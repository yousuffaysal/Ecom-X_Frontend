import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { can } from '@/lib/permissions'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function GET() {
  const session = await getSession()
  if (!session || !can(session.role, 'viewMessages')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await ensureTable()

  const result = await query(
    `SELECT * FROM contact_messages ORDER BY created_at DESC`,
    []
  )

  return NextResponse.json({ messages: result.rows })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'viewMessages')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, read } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await query('UPDATE contact_messages SET read=$1 WHERE id=$2', [read, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'deleteMessages')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await query('DELETE FROM contact_messages WHERE id=$1', [id])
  return NextResponse.json({ ok: true })
}
