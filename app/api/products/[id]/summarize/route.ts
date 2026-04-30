import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { query } from '@/lib/db'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function resolveProductId(idOrSlug: string) {
  const isUUID = /^[0-9a-f-]{36}$/i.test(idOrSlug)
  const col = isUUID ? 'id' : 'slug'
  const r = await query(`SELECT id, name FROM products WHERE ${col}=$1`, [idOrSlug])
  return r.rows[0] || null
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS review_summary JSONB`)

    const product = await resolveProductId(params.id)
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const reviewsRes = await query(
      `SELECT rating, title, body FROM reviews WHERE product_id=$1 ORDER BY created_at DESC LIMIT 80`,
      [product.id]
    )
    const reviews = reviewsRes.rows

    if (reviews.length < 3) {
      return NextResponse.json({ error: 'Need at least 3 reviews to generate insights' }, { status: 400 })
    }

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
        content: `You are a retail analyst creating a concise review summary for "${product.name}".

Analyze these ${reviews.length} customer reviews and extract the most useful, specific insights for shoppers.

REVIEWS:
${reviewText}

Return valid JSON only — no markdown:
{
  "summary": "One sentence starting with 'Based on ${reviews.length} reviews:' that captures the overall verdict",
  "pros": ["2–4 specific, concrete positives customers mention"],
  "cons": ["1–3 honest caveats or negatives, or empty array if genuinely none"],
  "fit": "One sentence about sizing/fit/dimensions consensus, or null if not mentioned in reviews",
  "who_for": "One sentence describing who this product suits best based on reviewer feedback"
}`,
      }],
      temperature: 0.25,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    let parsed: {
      summary: string
      pros: string[]
      cons: string[]
      fit: string | null
      who_for: string
    }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'AI response parse error' }, { status: 500 })
    }

    const summary = {
      summary:      parsed.summary  || '',
      pros:         parsed.pros     || [],
      cons:         parsed.cons     || [],
      fit:          parsed.fit      || null,
      who_for:      parsed.who_for  || '',
      review_count: reviews.length,
      generated_at: new Date().toISOString(),
    }

    await query(
      `UPDATE products SET review_summary=$1 WHERE id=$2`,
      [JSON.stringify(summary), product.id]
    )

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('summarize-reviews error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
