'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

type OrderItem = {
  id: string; product_name: string; qty: number
  price: string; color_name: string | null; size: string | null
}

type Order = {
  id: string; status: string
  subtotal: string; shipping_cost: string; total: string
  shipping_name: string; shipping_email: string; shipping_phone: string | null
  shipping_address: string; shipping_city: string; shipping_country: string; shipping_zip: string
  notes: string | null; created_at: string
  user_name: string | null; user_email: string | null
  items: OrderItem[] | null
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Payment Pending',  color: '#92400e', bg: '#fffbeb' },
  processing: { label: 'Processing',       color: '#1d4ed8', bg: '#eff6ff' },
  shipped:    { label: 'Shipped',          color: '#6d28d9', bg: '#f5f3ff' },
  delivered:  { label: 'Delivered',        color: '#15803d', bg: '#f0fdf4' },
  cancelled:  { label: 'Cancelled',        color: '#b91c1c', bg: '#fef2f2' },
}

function expectedDelivery(createdAt: string) {
  const d = new Date(createdAt)
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function invoiceNumber(id: string) {
  return 'INV-' + id.replace(/-/g, '').slice(0, 12).toUpperCase()
}

export default function ReceiptPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router      = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth/login'); return }

    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setOrder(d.order)
        setLoading(false)
      })
  }, [orderId, user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7f5' }}>
        <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading receipt…</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>∅</div>
        <p style={{ color: '#6b7280' }}>Receipt not found or access denied.</p>
        <button onClick={() => router.back()} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Go back</button>
      </div>
    )
  }

  const st = STATUS_LABEL[order.status] || { label: order.status, color: '#374151', bg: '#f5f4f1' }
  const items = order.items || []
  const subtotal = Number(order.subtotal)
  const shipping = Number(order.shipping_cost)
  const total    = Number(order.total)
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const invNum = invoiceNumber(order.id)

  return (
    <>
      {/* ── Print CSS injected inline ── */}
      <style>{`
        @page { size: A4; margin: 10mm 12mm; }

        @media print {
          /* Force background colours & images to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide everything via visibility so DOM layout is preserved */
          body * { visibility: hidden !important; }
          /* Reveal only the receipt and every element inside it */
          #receipt-root,
          #receipt-root * { visibility: visible !important; }
          /* Anchor receipt to top-left of the printed page */
          #receipt-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          /* Hide the on-screen action bar */
          .receipt-actions { display: none !important; }
        }

        @media screen {
          #receipt-root { background: #f1efe9; min-height: 100vh; padding: 2rem 1rem 4rem; }
        }
      `}</style>

      <div id="receipt-root">
        {/* Action bar — screen only */}
        <div className="receipt-actions" style={{
          maxWidth: 820, margin: '0 auto 1.5rem', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem', fontFamily: 'var(--font-dm-sans)' }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.25rem', borderRadius: 8, border: '1.5px solid #e5e2dc',
                background: 'white', color: '#374151', fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* ── Invoice card ── */}
        <div style={{
          maxWidth: 820, margin: '0 auto',
          background: 'white',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
          fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
          color: '#1a1a1a',
        }}>

          {/* Header stripe */}
          <div style={{ background: '#0f0e0d', padding: '2.5rem 3rem 2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -40, width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              {/* Brand */}
              <div>
                <div style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em', lineHeight: 1 }}>
                  Redleaf
                </div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(185,28,28,0.9)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700, marginTop: 5 }}>
                  Est. 2024 · Premium Collection
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                  Redleaf Fashion Ltd.<br />
                  123 Collection Drive, London, UK<br />
                  hello@redleaf.com · redleaf.com
                </div>
              </div>

              {/* Invoice meta */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.375rem' }}>
                  Invoice
                </div>
                <div style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '0.01em' }}>
                  {invNum}
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                    Date: <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{orderDate}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                    Order: <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: '0.68rem' }}>#{order.id.slice(0,8).toUpperCase()}</span>
                  </div>
                </div>
                {/* Status badge */}
                <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: 20, background: st.bg, border: `1px solid ${st.color}30` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: st.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {st.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Red accent line */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)' }} />

          {/* Bill To / Ship To / Delivery */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderBottom: '1px solid #f0ede8' }}>
            {[
              {
                title: 'Bill To',
                lines: [
                  order.user_name || order.shipping_name,
                  order.user_email || order.shipping_email,
                  order.shipping_phone,
                ].filter(Boolean),
              },
              {
                title: 'Ship To',
                lines: [
                  order.shipping_name,
                  order.shipping_address,
                  `${order.shipping_city}${order.shipping_zip ? ', ' + order.shipping_zip : ''}`,
                  order.shipping_country,
                ].filter(Boolean),
              },
              {
                title: 'Delivery',
                lines: null,
                custom: (
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.25rem' }}>
                      {order.status === 'delivered' ? 'Delivered' : 'Expected by'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>
                      {order.status === 'cancelled'
                        ? 'Order cancelled'
                        : expectedDelivery(order.created_at)}
                    </div>
                    <div style={{ marginTop: '0.625rem', fontSize: '0.7rem', color: '#9ca3af' }}>
                      Standard 7-day delivery
                    </div>
                  </div>
                ),
              },
            ].map((col, i) => (
              <div key={i} style={{ padding: '1.75rem 2rem', borderRight: i < 2 ? '1px solid #f0ede8' : 'none' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.75rem' }}>
                  {col.title}
                </div>
                {col.custom ?? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {col.lines?.map((line, j) => (
                      <div key={j} style={{ fontSize: j === 0 ? '0.875rem' : '0.78rem', fontWeight: j === 0 ? 600 : 400, color: j === 0 ? '#1a1a1a' : '#6b7280', lineHeight: 1.5 }}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Items table */}
          <div style={{ padding: '0 2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0ede8' }}>
                  {['Item', 'Options', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                    <th key={h} style={{
                      padding: '1rem 0.75rem',
                      fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: '#9ca3af',
                      textAlign: i === 0 ? 'left' : i < 2 ? 'left' : 'right',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} style={{ borderBottom: '1px solid #f8f7f5' }}>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', maxWidth: 220 }}>
                      {item.product_name}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.78rem', color: '#6b7280' }}>
                      {[item.color_name, item.size].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#374151', textAlign: 'right' }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#374151', textAlign: 'right' }}>
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', textAlign: 'right' }}>
                      ${(Number(item.price) * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 2rem 2rem' }}>
            <div style={{ width: 300 }}>
              <div style={{ height: '1px', background: '#f0ede8', marginBottom: '1rem' }} />
              {[
                { label: 'Subtotal', value: `$${subtotal.toFixed(2)}`, muted: true },
                { label: 'Shipping', value: shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`, muted: true, green: shipping === 0 },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0' }}>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{row.label}</span>
                  <span style={{ fontSize: '0.82rem', color: row.green ? '#15803d' : '#374151', fontWeight: row.green ? 600 : 400 }}>{row.value}</span>
                </div>
              ))}
              {shipping > 0 && (
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'right', marginBottom: '0.25rem' }}>
                  Free on orders over $200
                </div>
              )}
              <div style={{ height: '1px', background: '#e5e2dc', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Due</span>
                <span style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: '1.75rem', fontWeight: 700, color: '#0f0e0d' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
              {/* Payment status pill */}
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: 8, background: st.bg, border: `1px solid ${st.color}25`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: st.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {st.label}
                  </div>
                  {order.status === 'pending' && (
                    <div style={{ fontSize: '0.68rem', color: '#92400e', marginTop: 1 }}>Payment will be collected on delivery</div>
                  )}
                  {order.status === 'delivered' && (
                    <div style={{ fontSize: '0.68rem', color: '#15803d', marginTop: 1 }}>Payment received — Thank you!</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div style={{ margin: '0 2rem 2rem', padding: '1rem 1.25rem', background: '#fafaf8', borderRadius: 8, border: '1px solid #f0ede8' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.375rem' }}>
                Order Notes
              </div>
              <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 }}>{order.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ background: '#fafaf8', borderTop: '1px solid #f0ede8', padding: '1.75rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: '0.9rem', fontWeight: 700, color: '#0f0e0d', marginBottom: '0.2rem' }}>
                Redleaf
              </div>
              <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                Crafted clothing, built to last. Est. 2024.
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                30-Day Free Returns
              </div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>hello@redleaf.com · redleaf.com</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af', lineHeight: 1.6 }}>
                This document serves as your official receipt.<br />
                VAT No. GB 000 000 000 · Redleaf Fashion Ltd.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
