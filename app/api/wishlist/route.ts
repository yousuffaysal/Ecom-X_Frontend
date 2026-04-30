import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    `SELECT p.*, wi.id AS wishlist_item_id,
       (SELECT json_agg(pi ORDER BY pi.position)
          FROM product_images pi WHERE pi.product_id = p.id) AS images
     FROM wishlist_items wi
     JOIN products p ON p.id = wi.product_id
     WHERE wi.user_id = $1
     ORDER BY wi.created_at DESC`,
    [session.userId]
  )

  return NextResponse.json({ items: result.rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  await query(
    `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
    [session.userId, product_id]
  )

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const product_id = searchParams.get('product_id')
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  await query(
    'DELETE FROM wishlist_items WHERE user_id=$1 AND product_id=$2',
    [session.userId, product_id]
  )

  return NextResponse.json({ ok: true })
}
