import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    `SELECT ci.*, p.name, p.price, p.slug, p.bg,
       (SELECT url FROM product_images pi WHERE pi.product_id=ci.product_id ORDER BY pi.position LIMIT 1) AS image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at`,
    [session.userId]
  )

  return NextResponse.json({ items: result.rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id, color_name, size, qty } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  const result = await query(
    `INSERT INTO cart_items (user_id, product_id, color_name, size, qty)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id, product_id, color_name, size)
     DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty
     RETURNING *`,
    [session.userId, product_id, color_name || null, size || null, qty || 1]
  )

  return NextResponse.json({ item: result.rows[0] }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, qty } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (qty <= 0) {
    await query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [id, session.userId])
  } else {
    await query(
      'UPDATE cart_items SET qty=$1 WHERE id=$2 AND user_id=$3',
      [qty, id, session.userId]
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  const all = searchParams.get('all')

  if (all === 'true') {
    await query('DELETE FROM cart_items WHERE user_id=$1', [session.userId])
  } else if (id) {
    await query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [id, session.userId])
  }

  return NextResponse.json({ ok: true })
}
