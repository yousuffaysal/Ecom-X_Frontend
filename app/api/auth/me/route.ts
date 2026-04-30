import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const result = await query(
    'SELECT id, email, name, role FROM users WHERE id = $1',
    [session.userId]
  )
  if (!result.rows[0]) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: result.rows[0] })
}
