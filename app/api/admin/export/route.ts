import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const range = req.nextUrl.searchParams.get('range') || 'monthly'

  const interval = range === 'weekly' ? '7 days' : range === 'monthly' ? '30 days' : '365 days'

  const result = await query(
    `SELECT
       o.id,
       o.status,
       o.subtotal,
       o.shipping_cost,
       o.total,
       o.shipping_name,
       o.shipping_email,
       COALESCE(o.shipping_phone, '') AS shipping_phone,
       o.shipping_address,
       o.shipping_city,
       o.shipping_country,
       COALESCE(o.shipping_zip, '') AS shipping_zip,
       COALESCE(o.notes, '') AS notes,
       o.created_at,
       COALESCE(u.name, '') AS customer_name,
       COALESCE(u.email, '') AS customer_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.created_at >= NOW() - INTERVAL '${interval}'
     ORDER BY o.created_at DESC`
  )

  const orders = result.rows

  const escape = (v: unknown) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return `"${s}"`
  }

  const headers = [
    'Order ID', 'Status', 'Subtotal', 'Shipping', 'Total',
    'Customer Name', 'Customer Email', 'Phone',
    'Ship To Name', 'Ship To Email', 'Address', 'City', 'Country', 'ZIP',
    'Notes', 'Date',
  ]

  const rows = orders.map(o => [
    escape(o.id),
    escape(o.status),
    escape(Number(o.subtotal).toFixed(2)),
    escape(Number(o.shipping_cost).toFixed(2)),
    escape(Number(o.total).toFixed(2)),
    escape(o.customer_name),
    escape(o.customer_email),
    escape(o.shipping_phone),
    escape(o.shipping_name),
    escape(o.shipping_email),
    escape(o.shipping_address),
    escape(o.shipping_city),
    escape(o.shipping_country),
    escape(o.shipping_zip),
    escape(o.notes),
    escape(new Date(o.created_at).toISOString()),
  ].join(','))

  const csv = [headers.map(escape).join(','), ...rows].join('\r\n')

  const label = range === 'weekly' ? 'last-7-days' : range === 'monthly' ? 'last-30-days' : 'last-year'
  const filename = `redleaf-orders-${label}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
