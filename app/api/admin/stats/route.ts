import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { can, isStaffRole } from '@/lib/permissions'

export async function GET() {
  const session = await getSession()
  if (!session || !isStaffRole(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const isAdmin = session.role === 'admin'

  const queries: Promise<{ rows: Record<string, unknown>[] }>[] = [
    query(`SELECT COUNT(*)::int AS count FROM orders`, []),
    query(`SELECT COUNT(*)::int AS count FROM products`, []),
    query(
      `SELECT o.id, o.status, o.total, o.created_at, u.name AS user_name
       FROM orders o LEFT JOIN users u ON u.id=o.user_id
       ORDER BY o.created_at DESC LIMIT 5`,
      []
    ),
  ]

  if (isAdmin) {
    queries.push(
      query(`SELECT COALESCE(SUM(total),0)::numeric AS total FROM orders WHERE status != 'cancelled'`, []),
      query(`SELECT COUNT(*)::int AS count FROM users WHERE role='user'`, [])
    )
  }

  const results = await Promise.all(queries)
  const [orders, products, recentOrders, revenue, users] = results

  return NextResponse.json({
    orders: orders.rows[0].count,
    products: products.rows[0].count,
    recentOrders: recentOrders.rows,
    revenue: can(session.role, 'viewRevenue') ? revenue?.rows[0].total : null,
    users:   can(session.role, 'viewRevenue') ? users?.rows[0].count   : null,
  })
}
