import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isStaffRole } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const all = searchParams.get('all') === 'true'

  if (all && !isStaffRole(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sql = all
    ? `SELECT o.*, u.email AS user_email, u.name AS user_name,
         (SELECT json_agg(oi) FROM order_items oi WHERE oi.order_id=o.id) AS items
       FROM orders o LEFT JOIN users u ON u.id=o.user_id
       ORDER BY o.created_at DESC`
    : `SELECT o.*,
         (SELECT json_agg(oi) FROM order_items oi WHERE oi.order_id=o.id) AS items
       FROM orders o
       WHERE o.user_id=$1
       ORDER BY o.created_at DESC`

  const result = await query(sql, all ? [] : [session.userId])
  return NextResponse.json({ orders: result.rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    items, subtotal, shipping_cost, total,
    shipping_name, shipping_email, shipping_phone, shipping_address,
    shipping_city, shipping_country, shipping_zip, notes,
  } = body

  if (!items?.length || !total) {
    return NextResponse.json({ error: 'items and total required' }, { status: 400 })
  }

  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT`)

  const orderRes = await query(
    `INSERT INTO orders
       (user_id, subtotal, shipping_cost, total,
        shipping_name, shipping_email, shipping_phone, shipping_address,
        shipping_city, shipping_country, shipping_zip, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [session.userId, subtotal, shipping_cost || 0, total,
     shipping_name, shipping_email, shipping_phone || null, shipping_address,
     shipping_city, shipping_country, shipping_zip, notes || null]
  )

  const orderId = orderRes.rows[0].id

  const isUUID = (v: unknown) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

  for (const item of items) {
    await query(
      `INSERT INTO order_items
         (order_id, product_id, product_name, color_name, size, qty, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [orderId, isUUID(item.product_id) ? item.product_id : null, item.product_name,
       item.color_name || null, item.size || null, item.qty, item.price]
    )
  }

  await query('DELETE FROM cart_items WHERE user_id=$1', [session.userId])

  return NextResponse.json({ id: orderId }, { status: 201 })
}
