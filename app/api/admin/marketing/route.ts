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

export async function GET() {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { rows } = await db.query(
    `SELECT id, slot, title, subtitle, link_url, image_url, is_active, created_at, updated_at
     FROM marketing_banners
     ORDER BY slot ASC`
  )
  return NextResponse.json({ banners: rows })
}

export async function POST(req: NextRequest) {
  const session = await guard()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { slot, title, subtitle, link_url, image_url, is_active } = body

  if (!slot || ![1, 2, 3].includes(Number(slot))) {
    return NextResponse.json({ error: 'Invalid slot (must be 1, 2, or 3)' }, { status: 400 })
  }

  const { rows } = await db.query(
    `INSERT INTO marketing_banners (slot, title, subtitle, link_url, image_url, is_active, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (slot) DO UPDATE SET
       title      = EXCLUDED.title,
       subtitle   = EXCLUDED.subtitle,
       link_url   = EXCLUDED.link_url,
       image_url  = EXCLUDED.image_url,
       is_active  = EXCLUDED.is_active,
       updated_at = NOW()
     RETURNING *`,
    [slot, title || null, subtitle || null, link_url || '/shop', image_url || null, is_active !== false, session.userId]
  )

  return NextResponse.json({ banner: rows[0] })
}
