import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { query } from '@/lib/db'
import { cache } from '@/lib/cache'
import { rateLimit } from '@/lib/rate-limit'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const CATALOG_CACHE_KEY = 'style-advisor:catalog'
const CATALOG_TTL_MS    = 5 * 60 * 1000  // 5 minutes

type Message = { role: 'user' | 'assistant'; content: string }

type CatalogCache = {
  catalogText: string
  products: Record<string, unknown>[]
}

async function getCatalog(): Promise<CatalogCache> {
  // Return cached catalog if still fresh
  const hit = cache.get<CatalogCache>(CATALOG_CACHE_KEY)
  if (hit) return hit

  // Cache miss — fetch from DB
  const result = await query(`
    SELECT
      p.slug, p.name, p.subtitle, p.description,
      p.price, p.original_price, p.material, p.fit, p.badge,
      c.name AS category,
      (SELECT json_agg(json_build_object('name', pc.name, 'hex', pc.hex) ORDER BY pc.position)
         FROM product_colors pc WHERE pc.product_id = p.id) AS colors,
      (SELECT json_agg(json_build_object('size', ps.size, 'available', ps.available) ORDER BY ps.position)
         FROM product_sizes ps WHERE ps.product_id = p.id) AS sizes,
      (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image_url
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.featured DESC, p.created_at DESC
    LIMIT 60
  `)

  const products = result.rows

  const catalogText = products.map(p => {
    const colors = (p.colors || []).map((c: { name: string }) => c.name).join(', ')
    const sizes  = (p.sizes  || []).filter((s: { available: boolean }) => s.available).map((s: { size: string }) => s.size).join(', ')
    return [
      `SLUG: ${p.slug}`,
      `NAME: ${p.name}`,
      `CATEGORY: ${p.category || 'General'}`,
      `PRICE: $${Number(p.price).toFixed(2)}${p.original_price ? ` (was $${Number(p.original_price).toFixed(2)})` : ''}`,
      p.subtitle    ? `TAGLINE: ${p.subtitle}` : '',
      p.description ? `DESCRIPTION: ${p.description.slice(0, 180)}` : '',
      p.material    ? `MATERIAL: ${p.material}` : '',
      p.fit         ? `FIT: ${p.fit}` : '',
      colors        ? `COLOURS: ${colors}` : '',
      sizes         ? `SIZES: ${sizes}` : '',
    ].filter(Boolean).join('\n')
  }).join('\n\n---\n\n')

  const catalog = { catalogText, products }
  cache.set(CATALOG_CACHE_KEY, catalog, CATALOG_TTL_MS)
  return catalog
}

export async function POST(req: NextRequest) {
  // Rate limit: 15 messages per minute per IP
  const limited = rateLimit(req, 'style-advisor', 15, 60_000)
  if (limited) return limited

  try {
    const { messages }: { messages: Message[] } = await req.json()
    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    // Catalog is cached — no DB hit on repeat calls within 5 minutes
    const { catalogText, products } = await getCatalog()

    const systemPrompt = `You are Aria — Redleaf's personal AI style advisor. Redleaf is a premium fashion brand (est. 2024) built around timeless quality over fast fashion. Your role is to be a knowledgeable, warm, editorial-toned stylist who helps customers find exactly what they need.

GUIDELINES:
- Be conversational, warm, and genuinely helpful — like a trusted personal stylist
- Ask one clarifying question at a time if you need more context (occasion, body preference, budget, climate)
- Recommend 1–4 products max per response — quality over quantity
- Explain WHY each product suits the customer's need (occasion fit, material, colour suitability)
- If a product is on sale, mention it as a value point
- Never recommend products that don't genuinely match the request
- Keep responses concise but rich — 2–4 sentences of advice, then the recommendations
- If no products fit well, say so honestly and ask more questions

CURRENT REDLEAF CATALOG:
${catalogText}

RESPONSE FORMAT — you MUST always respond with valid JSON only, no markdown, no extra text:
{
  "message": "Your full conversational response here",
  "product_slugs": ["slug1", "slug2"]
}
product_slugs must contain only slugs from the catalog above. Use [] if no specific products apply.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    let parsed: { message: string; product_slugs: string[] }
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { message: raw, product_slugs: [] }
    }

    // Look up suggested products from the already-fetched catalog (no extra DB query)
    const slugs = (parsed.product_slugs || []).slice(0, 4)
    const productMap = Object.fromEntries(products.map(p => [p.slug as string, p]))
    const suggestedProducts = slugs.map((s: string) => productMap[s]).filter(Boolean)

    // If any slug wasn't in the cached catalog, fall back to a DB lookup
    const missingSlugs = slugs.filter((s: string) => !productMap[s])
    if (missingSlugs.length) {
      const placeholders = missingSlugs.map((_: string, i: number) => `$${i + 1}`).join(',')
      const pRes = await query(
        `SELECT p.slug, p.name, p.subtitle, p.price, p.original_price, p.bg,
                c.name AS category,
                (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image_url
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.slug IN (${placeholders})`,
        missingSlugs
      )
      const fallbackMap = Object.fromEntries(pRes.rows.map((r: { slug: string }) => [r.slug, r]))
      missingSlugs.forEach((s: string) => { if (fallbackMap[s]) suggestedProducts.push(fallbackMap[s]) })
    }

    return NextResponse.json({
      message: parsed.message || 'I had trouble understanding that. Could you rephrase?',
      suggestedProducts,
    })
  } catch (err) {
    console.error('style-advisor error', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
