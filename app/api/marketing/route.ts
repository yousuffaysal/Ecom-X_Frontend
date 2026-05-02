import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  const { rows } = await db.query(
    `SELECT id, slot, title, subtitle, link_url, image_url
     FROM marketing_banners
     WHERE is_active = true
     ORDER BY slot ASC`
  )
  return NextResponse.json({ banners: rows })
}
