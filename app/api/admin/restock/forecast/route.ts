import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { can } from '@/lib/permissions'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export type ForecastProduct = {
  id: string
  slug: string
  name: string
  category: string | null
  image_url: string | null
  stock_qty: number | null
  // raw windows
  units_30d: number
  units_prev_30d: number
  units_yoy: number
  units_yoy_prev: number
  // computed
  daily_velocity: number
  trend_pct: number          // MoM % change (+ = growing, - = shrinking)
  trend_factor: number       // ratio current/previous
  seasonality_factor: number // this-period-YoY ratio vs prior-period-YoY ratio
  forecast_velocity: number  // blended forward velocity
  forecast_30d: number       // predicted units next 30 days
  reorder_qty: number        // max(0, forecast*1.2 - stock)
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'no-data'
}

export type ForecastResponse = {
  products: ForecastProduct[]
  summary: string
  generated_at: string
}

function computeUrgency(p: Omit<ForecastProduct, 'urgency'>): ForecastProduct['urgency'] {
  if (p.stock_qty === null) return 'no-data'
  const daysLeft = p.daily_velocity > 0 ? p.stock_qty / p.daily_velocity : Infinity
  if (p.stock_qty === 0 || daysLeft <= 5)  return 'critical'
  if (p.reorder_qty > 0 && daysLeft <= 14) return 'high'
  if (p.reorder_qty > 0)                   return 'medium'
  return 'low'
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'viewRestock')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Ensure stock_qty column exists (idempotent)
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty INT`)

  // One query — four time windows per product
  // Window A: last 30 days
  // Window B: 31–60 days ago  (prior period, for MoM trend)
  // Window C: 335–365 days ago (same 30d window last year, for YoY seasonality)
  // Window D: 365–395 days ago (prior to same window last year, for YoY baseline)
  const result = await query(`
    SELECT
      p.id, p.slug, p.name, p.stock_qty,
      c.name AS category,
      (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image_url,

      COALESCE(SUM(CASE
        WHEN o.created_at >= NOW() - INTERVAL '30 days'
        THEN oi.qty END), 0)::INT AS units_30d,

      COALESCE(SUM(CASE
        WHEN o.created_at >= NOW() - INTERVAL '60 days'
         AND o.created_at <  NOW() - INTERVAL '30 days'
        THEN oi.qty END), 0)::INT AS units_prev_30d,

      COALESCE(SUM(CASE
        WHEN o.created_at >= NOW() - INTERVAL '395 days'
         AND o.created_at <  NOW() - INTERVAL '365 days'
        THEN oi.qty END), 0)::INT AS units_yoy,

      COALESCE(SUM(CASE
        WHEN o.created_at >= NOW() - INTERVAL '425 days'
         AND o.created_at <  NOW() - INTERVAL '395 days'
        THEN oi.qty END), 0)::INT AS units_yoy_prev

    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN order_items oi ON oi.product_id = p.id
    LEFT JOIN orders o ON o.id = oi.order_id
      AND o.created_at >= NOW() - INTERVAL '425 days'
    GROUP BY p.id, p.slug, p.name, p.stock_qty, c.name
    ORDER BY units_30d DESC, p.name ASC
    LIMIT 100
  `)

  const products: ForecastProduct[] = result.rows.map(row => {
    const u30   = Number(row.units_30d)
    const uPrev = Number(row.units_prev_30d)
    const uYoY  = Number(row.units_yoy)
    const uYoYP = Number(row.units_yoy_prev)
    const stock = row.stock_qty !== null ? Number(row.stock_qty) : null

    const dailyVelocity    = u30 / 30
    const trendFactor      = uPrev > 0 ? u30 / uPrev : 1.0
    const trendPct         = uPrev > 0 ? ((u30 - uPrev) / uPrev) * 100 : 0
    // Seasonality: ratio of YoY window vs its prior → if this period outperforms last year's pattern, seasonal boost
    const seasonalityFactor = uYoYP > 0 ? uYoY / uYoYP : 1.0

    // Blended forecast: 60% weight on MoM trend, 40% on YoY seasonality
    const forecastVelocity = dailyVelocity * (trendFactor * 0.6 + seasonalityFactor * 0.4)
    const forecast30d      = Math.round(forecastVelocity * 30)
    // Reorder = cover forecast with 20% safety buffer, minus current stock
    const reorderQty       = stock !== null ? Math.max(0, Math.round(forecast30d * 1.2 - stock)) : 0

    const base = {
      id: row.id, slug: row.slug, name: row.name, category: row.category ?? null,
      image_url: row.image_url ?? null, stock_qty: stock,
      units_30d: u30, units_prev_30d: uPrev, units_yoy: uYoY, units_yoy_prev: uYoYP,
      daily_velocity: dailyVelocity,
      trend_pct: trendPct, trend_factor: trendFactor,
      seasonality_factor: seasonalityFactor,
      forecast_velocity: forecastVelocity,
      forecast_30d: forecast30d,
      reorder_qty: reorderQty,
    }

    return { ...base, urgency: computeUrgency(base) }
  })

  // AI executive summary — top 15 products by forecast volume
  const topForSummary = products.slice(0, 15).map(p => ({
    name: p.name,
    category: p.category,
    sold_30d: p.units_30d,
    trend_pct: Math.round(p.trend_pct),
    seasonality: p.seasonality_factor.toFixed(2),
    forecast_30d: p.forecast_30d,
    reorder_qty: p.reorder_qty,
    urgency: p.urgency,
    stock_qty: p.stock_qty,
  }))

  const critical = products.filter(p => p.urgency === 'critical').length
  const high     = products.filter(p => p.urgency === 'high').length
  const needReorder = products.filter(p => p.reorder_qty > 0).length

  let summary = ''
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system',
        content: `You are a senior inventory analyst for Redleaf, a premium fashion brand. Write a concise demand forecast executive summary for the operations team. Be specific with numbers, highlight urgent actions, and note any seasonal opportunities. Use 3–5 bullet points. No intro sentence, start straight with the bullets. Each bullet max 20 words.`,
      }, {
        role: 'user',
        content: `Store summary: ${critical} critical, ${high} high-urgency, ${needReorder} total needing reorder.\n\nTop product data:\n${JSON.stringify(topForSummary, null, 2)}`,
      }],
      temperature: 0.3,
      max_tokens: 400,
    })
    summary = res.choices[0]?.message?.content?.trim() || ''
  } catch {
    summary = `${critical} critical products. ${needReorder} products need restocking based on forecast demand.`
  }

  return NextResponse.json({
    products,
    summary,
    generated_at: new Date().toISOString(),
  } satisfies ForecastResponse)
}
