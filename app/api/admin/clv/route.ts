import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function clvTier(orderCount: number, totalSpend: number, daysSinceLast: number): {
  tier: string; color: string; bg: string
} {
  if (orderCount === 0) return { tier: 'Prospect', color: '#9ca3af', bg: '#f3f4f6' }
  if (daysSinceLast > 180 && orderCount >= 2) return { tier: 'Lost',     color: '#6b7280', bg: '#f9fafb' }
  if (daysSinceLast > 90  && orderCount >= 2) return { tier: 'At Risk',  color: '#b45309', bg: '#fef3c7' }
  if (orderCount >= 3 && totalSpend >= 500 && daysSinceLast <= 45) return { tier: 'Champion',  color: '#7c3aed', bg: '#ede9fe' }
  if (orderCount >= 3 || (orderCount >= 2 && totalSpend >= 300))   return { tier: 'Loyal',     color: '#1d4ed8', bg: '#dbeafe' }
  if (orderCount >= 2 && daysSinceLast <= 60) return { tier: 'Promising', color: '#0f766e', bg: '#ccfbf1' }
  if (daysSinceLast <= 30)                    return { tier: 'New',       color: '#15803d', bg: '#dcfce7' }
  return                                             { tier: 'Occasional', color: '#6b7280', bg: '#f3f4f6' }
}

function clvScore(orderCount: number, totalSpend: number, daysSinceLast: number, daysSinceFirst: number): number {
  const recency    = Math.max(0, 100 - daysSinceLast)
  const frequency  = Math.min(100, orderCount * 20)
  const monetary   = Math.min(100, totalSpend / 10)
  const longevity  = Math.min(100, daysSinceFirst / 3.65)
  return Math.round(recency * 0.3 + frequency * 0.25 + monetary * 0.3 + longevity * 0.15)
}

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await query(`
    SELECT
      u.id, u.name, u.email, u.created_at,
      COUNT(DISTINCT o.id)::INT                                         AS order_count,
      COALESCE(SUM(o.total), 0)::NUMERIC(10,2)                         AS total_spend,
      COALESCE(AVG(o.total), 0)::NUMERIC(10,2)                         AS avg_order_value,
      MAX(o.created_at)                                                 AS last_order_at,
      MIN(o.created_at)                                                 AS first_order_at,
      COALESCE(EXTRACT(EPOCH FROM (NOW() - MAX(o.created_at)))/86400, 9999)::INT AS days_since_last,
      COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(o.created_at)))/86400,  0   )::INT AS days_since_first
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.role = 'user'
    GROUP BY u.id, u.name, u.email, u.created_at
    ORDER BY total_spend DESC
    LIMIT 200
  `)

  const customers = result.rows.map(r => {
    const orderCount    = r.order_count
    const totalSpend    = parseFloat(r.total_spend)
    const avgOrderValue = parseFloat(r.avg_order_value)
    const daysSinceLast = r.days_since_last
    const daysSinceFirst= r.days_since_first
    const tier          = clvTier(orderCount, totalSpend, daysSinceLast)
    const score         = clvScore(orderCount, totalSpend, daysSinceLast, daysSinceFirst)

    return {
      id: r.id, name: r.name, email: r.email,
      created_at: r.created_at,
      order_count: orderCount,
      total_spend: totalSpend,
      avg_order_value: avgOrderValue,
      last_order_at: r.last_order_at,
      days_since_last: daysSinceLast,
      clv_score: score,
      ...tier,
    }
  })

  // Generate AI strategic insight for top 5 customers (only if they have orders)
  const top5 = customers.filter(c => c.order_count > 0).slice(0, 5)
  let insights: Record<string, string> = {}

  if (top5.length > 0) {
    const summary = top5.map(c =>
      `${c.name}: ${c.order_count} orders, $${c.total_spend} total spend, tier: ${c.tier}, last order ${c.days_since_last} days ago`
    ).join('\n')

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are a CRM strategist for Redleaf, a premium fashion brand. Based on this customer data, give a one-sentence personalized retention/growth strategy for each customer.

${summary}

Return valid JSON only:
{
  "insights": {
    "${top5[0].id}": "one-sentence strategy",
    ${top5.slice(1).map(c => `"${c.id}": "one-sentence strategy"`).join(',\n    ')}
  }
}`,
        }],
        temperature: 0.4,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      })
      const raw = completion.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(raw)
      insights = parsed.insights || {}
    } catch { /* non-fatal */ }
  }

  // Aggregate stats
  const total   = customers.length
  const withOrders = customers.filter(c => c.order_count > 0)
  const totalRevenue  = withOrders.reduce((s, c) => s + c.total_spend, 0)
  const avgCLVScore   = withOrders.length ? Math.round(withOrders.reduce((s, c) => s + c.clv_score, 0) / withOrders.length) : 0
  const tierCounts    = customers.reduce((acc, c) => { acc[c.tier] = (acc[c.tier] || 0) + 1; return acc }, {} as Record<string, number>)

  return NextResponse.json({
    customers: customers.map(c => ({ ...c, ai_insight: insights[c.id] || null })),
    stats: { total, totalRevenue, avgCLVScore, tierCounts },
  })
}
