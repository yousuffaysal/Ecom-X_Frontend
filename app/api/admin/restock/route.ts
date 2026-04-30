import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { can } from '@/lib/permissions'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'viewRestock')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty INT`)

  const result = await query(`
    SELECT
      p.id, p.slug, p.name, p.stock_qty, p.badge,
      c.name AS category,
      COALESCE(SUM(oi.qty), 0)::INT                   AS units_sold_30d,
      COALESCE(COUNT(DISTINCT oi.order_id), 0)::INT    AS orders_30d,
      ROUND(COALESCE(SUM(oi.qty), 0) / 30.0, 2)       AS daily_velocity,
      (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image_url
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN order_items oi ON oi.product_id = p.id
      AND oi.order_id IN (
        SELECT id FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
      )
    GROUP BY p.id, p.slug, p.name, p.stock_qty, p.badge, c.name
    ORDER BY units_sold_30d DESC, p.name ASC
    LIMIT 100
  `)

  const products = result.rows.map(p => {
    const stock    = p.stock_qty !== null ? parseInt(p.stock_qty) : null
    const velocity = parseFloat(p.daily_velocity)
    const daysLeft = stock !== null && velocity > 0 ? Math.floor(stock / velocity) : null

    let risk: 'critical' | 'warning' | 'healthy' | 'no-stock-data'
    if (stock === null)                              risk = 'no-stock-data'
    else if (stock === 0)                            risk = 'critical'
    else if (daysLeft !== null && daysLeft <= 7)     risk = 'critical'
    else if (daysLeft !== null && daysLeft <= 21)    risk = 'warning'
    else                                             risk = 'healthy'

    return {
      id: p.id, slug: p.slug, name: p.name, category: p.category,
      badge: p.badge, image_url: p.image_url,
      stock_qty: stock,
      units_sold_30d: p.units_sold_30d,
      orders_30d: p.orders_30d,
      daily_velocity: velocity,
      days_left: daysLeft,
      risk,
    }
  })

  return NextResponse.json({ products })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'viewRestock')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { product_id, stock_qty } = await req.json()
  if (!product_id || stock_qty === undefined) {
    return NextResponse.json({ error: 'product_id and stock_qty required' }, { status: 400 })
  }

  await query(`UPDATE products SET stock_qty=$1 WHERE id=$2`, [stock_qty, product_id])
  return NextResponse.json({ ok: true })
}
