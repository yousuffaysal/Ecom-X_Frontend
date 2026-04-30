import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { can, isStaffRole } from '@/lib/permissions'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    `SELECT o.*,
       u.email AS user_email, u.name AS user_name,
       (SELECT json_agg(oi ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id) AS items
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.id = $1
       AND ($2 OR o.user_id = $3)`,
    [params.id, isStaffRole(session.role), session.userId]
  )

  const order = result.rows[0]
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || !can(session.role, 'updateOrderStatus')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { status } = await req.json()
  const valid = ['pending','processing','shipped','delivered','cancelled']
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await query(
    'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2',
    [status, params.id]
  )

  return NextResponse.json({ ok: true })
}
