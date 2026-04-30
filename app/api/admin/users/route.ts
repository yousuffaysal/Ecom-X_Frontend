import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { can } from '@/lib/permissions'

export async function GET() {
  const session = await getSession()
  if (!session || !can(session.role, 'manageUsers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await query(
    `SELECT u.id, u.email, u.name, u.role, u.created_at,
       COUNT(o.id)::int AS order_count
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    []
  )

  return NextResponse.json({ users: result.rows })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'manageUsers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, role } = await req.json()
  const allowedRoles = ['admin', 'moderator', 'staff', 'user']
  if (!id || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid id or role' }, { status: 400 })
  }

  if (id === session.userId) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
  }

  await query('UPDATE users SET role=$1 WHERE id=$2', [role, id])
  return NextResponse.json({ ok: true })
}
