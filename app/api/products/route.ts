import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { cache } from '@/lib/cache'
import { can } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cat     = searchParams.get('cat')
  const sort    = searchParams.get('sort') || 'created_at'
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const featured = searchParams.get('featured')
  const search   = searchParams.get('search')
  const limit    = parseInt(searchParams.get('limit') || '100')
  const offset   = parseInt(searchParams.get('offset') || '0')

  const conditions: string[] = []
  const params: unknown[] = []
  let idx = 1

  if (cat) {
    conditions.push(`c.slug = $${idx++}`)
    params.push(cat)
  }
  if (minPrice) {
    conditions.push(`p.price >= $${idx++}`)
    params.push(parseFloat(minPrice))
  }
  if (maxPrice) {
    conditions.push(`p.price <= $${idx++}`)
    params.push(parseFloat(maxPrice))
  }
  if (featured === 'true') {
    conditions.push(`p.featured = true`)
  }
  if (search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.subtitle ILIKE $${idx} OR p.description ILIKE $${idx})`)
    params.push(`%${search}%`)
    idx++
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const sortMap: Record<string, string> = {
    price_asc:   'p.price ASC',
    price_desc:  'p.price DESC',
    rating:      'p.rating DESC',
    newest:      'p.created_at DESC',
    created_at:  'p.created_at DESC',
  }
  const orderBy = sortMap[sort] || 'p.created_at DESC'

  params.push(limit, offset)

  const sql = `
    SELECT
      p.*,
      c.name  AS category_name,
      c.slug  AS category_slug,
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
    ${where}
    ORDER BY ${orderBy}
    LIMIT $${idx++} OFFSET $${idx++}
  `

  const result = await query(sql, params)
  const res = NextResponse.json({ products: result.rows })
  // Cache public product listings for 60s at the CDN edge, serve stale for 5min while revalidating
  res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  return res
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'manageProducts')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { slug, name, subtitle, description, category_id, price,
          original_price, badge, material, fit, bg, featured } = body

  if (!slug || !name || !price) {
    return NextResponse.json({ error: 'slug, name, price required' }, { status: 400 })
  }

  const result = await query(
    `INSERT INTO products
       (slug, name, subtitle, description, category_id, price,
        original_price, badge, material, fit, bg, featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [slug, name, subtitle, description, category_id, price,
     original_price || null, badge || null, material, fit,
     bg || 'oklch(0.93 0.03 27)', featured || false]
  )

  // Invalidate Aria's product catalog cache so she sees the new product immediately
  cache.del('style-advisor:catalog')

  return NextResponse.json({ id: result.rows[0].id }, { status: 201 })
}
