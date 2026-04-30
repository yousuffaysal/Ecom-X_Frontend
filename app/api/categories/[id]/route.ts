import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, slug, description, image_url } = await req.json()
  await query(
    `UPDATE categories SET name=$1, slug=$2, description=$3, image_url=$4 WHERE id=$5`,
    [name, slug, description || null, image_url || null, params.id]
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await query('DELETE FROM categories WHERE id=$1', [params.id])
  return NextResponse.json({ ok: true })
}
