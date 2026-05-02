import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { can } from '@/lib/permissions'
import type { Role } from '@/lib/auth'
import db from '@/lib/db'

async function guard() {
  const session = await getSession()
  if (!session || !can(session.role as Role, 'manageMarketing')) return null
  return session
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, subtitle, link_url, image_url, is_active } = body

  const { rows } = await db.query(
    `UPDATE marketing_banners
     SET title      = COALESCE($1, title),
         subtitle   = COALESCE($2, subtitle),
         link_url   = COALESCE($3, link_url),
         image_url  = COALESCE($4, image_url),
         is_active  = COALESCE($5, is_active),
         updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [title ?? null, subtitle ?? null, link_url ?? null, image_url ?? null, is_active ?? null, params.id]
  )

  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ banner: rows[0] })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.query('DELETE FROM marketing_banners WHERE id = $1', [params.id])
  return NextResponse.json({ ok: true })
}
