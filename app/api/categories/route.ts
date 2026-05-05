import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name`,
    []
  )
  const res = NextResponse.json({ categories: result.rows })
  return res
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, slug, description, image_url } = await req.json()
  if (!name || !slug) {
    return NextResponse.json({ error: 'name and slug required' }, { status: 400 })
  }

  const result = await query(
    `INSERT INTO categories (name, slug, description, image_url)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, slug, description || null, image_url || null]
  )

  return NextResponse.json({ category: result.rows[0] }, { status: 201 })
}
