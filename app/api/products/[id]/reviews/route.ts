import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function regenerateSummary(productId: string, productName: string) {
  try {
    await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS review_summary JSONB`)
    const reviewsRes = await query(
      `SELECT rating, title, body FROM reviews WHERE product_id=$1 ORDER BY created_at DESC LIMIT 80`,
      [productId]
    )
    const reviews = reviewsRes.rows
    if (reviews.length < 3) return

    const reviewText = reviews.map((r, i) => {
      const parts = [`[Review ${i + 1} — ${r.rating}/5 stars]`]
      if (r.title) parts.push(`Title: ${r.title}`)
      if (r.body)  parts.push(`Body: ${r.body}`)
      return parts.join('\n')
    }).join('\n\n')

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a retail analyst. Analyze these ${reviews.length} customer reviews for "${productName}" and return valid JSON only:\n{"summary":"One sentence starting with 'Based on ${reviews.length} reviews:'","pros":["2-4 specific positives"],"cons":["1-3 honest caveats or []"],"fit":"sizing consensus sentence or null","who_for":"who this suits best"}\n\nREVIEWS:\n${reviewText}`,
      }],
      temperature: 0.25,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw)
    const summary = {
      summary: parsed.summary || '', pros: parsed.pros || [],
      cons: parsed.cons || [], fit: parsed.fit || null,
      who_for: parsed.who_for || '',
      review_count: reviews.length, generated_at: new Date().toISOString(),
    }
    await query(`UPDATE products SET review_summary=$1 WHERE id=$2`, [JSON.stringify(summary), productId])
  } catch (err) {
    console.error('auto-summarize error', err)
  }
}

async function getProduct(idOrSlug: string) {
  const isUUID = /^[0-9a-f-]{36}$/i.test(idOrSlug)
  const col = isUUID ? 'id' : 'slug'
  const r = await query(`SELECT id, name FROM products WHERE ${col}=$1`, [idOrSlug])
  return r.rows[0] || null
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prod = await getProduct(params.id)
  const pid = prod?.id
  if (!pid) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await query(
    `SELECT r.*, u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [pid]
  )

  return NextResponse.json({ reviews: result.rows })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const prod = await getProduct(params.id)
  if (!prod) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const pid = prod.id

  const { rating, title, body: reviewBody } = await req.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
  }

  const existing = await query(
    'SELECT id FROM reviews WHERE product_id=$1 AND user_id=$2',
    [pid, session.userId]
  )

  let result
  if (existing.rows.length > 0) {
    result = await query(
      `UPDATE reviews SET rating=$1, title=$2, body=$3
       WHERE product_id=$4 AND user_id=$5 RETURNING *`,
      [rating, title || null, reviewBody || null, pid, session.userId]
    )
  } else {
    result = await query(
      `INSERT INTO reviews (product_id, user_id, rating, title, body)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [pid, session.userId, rating, title || null, reviewBody || null]
    )
  }

  // Fire-and-forget: regenerate AI summary in background
  regenerateSummary(pid, prod.name)

  return NextResponse.json({ review: result.rows[0] }, { status: 201 })
}
