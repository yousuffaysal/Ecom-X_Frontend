import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { cache } from '@/lib/cache'
import { can } from '@/lib/permissions'

async function fetchProduct(idOrSlug: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
  const col = isUUID ? 'p.id' : 'p.slug'

  const result = await query(
    `SELECT
       p.*,
       c.name AS category_name,
       c.slug AS category_slug,
       (SELECT json_agg(pi ORDER BY pi.position)
          FROM product_images pi WHERE pi.product_id = p.id) AS images,
       (SELECT json_agg(pc ORDER BY pc.position)
          FROM product_colors pc WHERE pc.product_id = p.id) AS colors,
       (SELECT json_agg(ps ORDER BY ps.position)
          FROM product_sizes  ps WHERE ps.product_id = p.id) AS sizes,
       (SELECT json_agg(sp ORDER BY sp.position)
          FROM product_specs  sp WHERE sp.product_id = p.id) AS specs
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${col} = $1`,
    [idOrSlug]
  )

  return result.rows[0] || null
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || !can(session.role, 'manageProducts')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const fields = ['slug','name','subtitle','description','category_id','price',
                  'original_price','badge','material','fit','bg','featured']
  const sets: string[] = []
  const vals: unknown[] = []
  let idx = 1

  for (const f of fields) {
    if (f in body) {
      sets.push(`${f} = $${idx++}`)
      vals.push(body[f] ?? null)
    }
  }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  sets.push(`updated_at = NOW()`)
  vals.push(params.id)

  const isUUID = /^[0-9a-f-]{36}$/i.test(params.id)
  const col = isUUID ? 'id' : 'slug'

  await query(`UPDATE products SET ${sets.join(',')} WHERE ${col} = $${idx}`, vals)

  if (body.images) {
    const pr = await query(`SELECT id FROM products WHERE ${col}=$1`, [params.id])
    const pid = pr.rows[0]?.id
    if (pid) {
      await query(`DELETE FROM product_images WHERE product_id=$1`, [pid])
      for (const img of body.images) {
        await query(
          `INSERT INTO product_images (product_id,url,label,position) VALUES ($1,$2,$3,$4)`,
          [pid, img.url, img.label || 'Image', img.position || 0]
        )
      }
    }
  }

  if (body.colors) {
    const pr = await query(`SELECT id FROM products WHERE ${col}=$1`, [params.id])
    const pid = pr.rows[0]?.id
    if (pid) {
      await query(`DELETE FROM product_colors WHERE product_id=$1`, [pid])
      for (const c of body.colors) {
        await query(
          `INSERT INTO product_colors (product_id,name,hex,position) VALUES ($1,$2,$3,$4)`,
          [pid, c.name, c.hex, c.position || 0]
        )
      }
    }
  }

  if (body.sizes) {
    const pr = await query(`SELECT id FROM products WHERE ${col}=$1`, [params.id])
    const pid = pr.rows[0]?.id
    if (pid) {
      await query(`DELETE FROM product_sizes WHERE product_id=$1`, [pid])
      for (const s of body.sizes) {
        await query(
          `INSERT INTO product_sizes (product_id,size,available,position) VALUES ($1,$2,$3,$4)`,
          [pid, s.size, s.available !== false, s.position || 0]
        )
      }
    }
  }

  if (body.specs) {
    const pr = await query(`SELECT id FROM products WHERE ${col}=$1`, [params.id])
    const pid = pr.rows[0]?.id
    if (pid) {
      await query(`DELETE FROM product_specs WHERE product_id=$1`, [pid])
      for (const sp of body.specs) {
        await query(
          `INSERT INTO product_specs (product_id,key,value,position) VALUES ($1,$2,$3,$4)`,
          [pid, sp.key, sp.value, sp.position || 0]
        )
      }
    }
  }

  cache.del('style-advisor:catalog')
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || !can(session.role, 'manageProducts')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const isUUID = /^[0-9a-f-]{36}$/i.test(params.id)
  const col = isUUID ? 'id' : 'slug'
  await query(`DELETE FROM products WHERE ${col} = $1`, [params.id])
  cache.del('style-advisor:catalog')
  return NextResponse.json({ ok: true })
}
