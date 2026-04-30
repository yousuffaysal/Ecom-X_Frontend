import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

async function ensureColumns() {
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`)
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`)
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT`)
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT`)
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS zip TEXT`)
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensureColumns()

  const result = await query(
    'SELECT id, email, name, role, phone, address, city, country, zip FROM users WHERE id = $1',
    [session.userId]
  )
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ profile: result.rows[0] })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensureColumns()

  const { name, phone, address, city, country, zip } = await req.json()

  const result = await query(
    `UPDATE users SET name=$1, phone=$2, address=$3, city=$4, country=$5, zip=$6
     WHERE id=$7
     RETURNING id, email, name, role, phone, address, city, country, zip`,
    [name || null, phone || null, address || null, city || null, country || null, zip || null, session.userId]
  )
  return NextResponse.json({ profile: result.rows[0] })
}
