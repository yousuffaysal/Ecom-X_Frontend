'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Order = {
  id: string; status: string; total: string; subtotal: string
  created_at: string; user_name: string; user_email: string
  shipping_name: string; shipping_city: string; shipping_country: string; shipping_phone: string | null
  shipping_address: string; shipping_zip: string
  items: { product_name: string; qty: number; price: string; color_name: string; size: string }[] | null
}

const STATUSES = ['pending','processing','shipped','delivered','cancelled']
const STATUS_COLOR: Record<string, string> = {
  pending:    '#d97706',
  processing: '#2563eb',
  shipped:    '#7c3aed',
  delivered:  '#16a34a',
  cancelled:  '#dc2626',
}

function deliveryDate(createdAt: string) {
  const d = new Date(createdAt)
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function downloadCSV(range: string) {
  window.location.href = `/api/admin/export?range=${range}`
}

export default function AdminOrders() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const load = () => {
    fetch('/api/orders?all=true').then(r => r.json()).then(d => {
      setOrders(d.orders || [])
      setLoading(false)
    })
  }
  useEffect(load, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders(o => o.map(ord => ord.id === id ? { ...ord, status } : ord))
  }

  const btnStyle = (color: string, bg: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem', borderRadius: 8, border: `1.5px solid ${color}30`,
    background: bg, color, fontSize: '0.78rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
    textDecoration: 'none', transition: 'opacity 0.15s',
  })

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '0.25rem' }}>
            Orders
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{orders.length} total orders</p>
        </div>

        {/* Export buttons */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Weekly CSV',  range: 'weekly',  color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Monthly CSV', range: 'monthly', color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Yearly CSV',  range: 'yearly',  color: '#15803d', bg: '#f0fdf4' },
          ].map(e => (
            <button
              key={e.range}
              style={btnStyle(e.color, e.bg)}
              onClick={() => { setExporting(true); downloadCSV(e.range); setTimeout(() => setExporting(false), 1500) }}
              disabled={exporting}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {exporting ? '…' : e.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #f0ede8' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafaf8', fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Order</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontWeight: 700 }}>Total</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontWeight: 700 }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <>
                  <tr
                    key={o.id}
                    style={{ borderTop: '1px solid #f0ede8', cursor: 'pointer', transition: 'background 0.1s' }}
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{o.shipping_name || o.user_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{o.user_email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }} onClick={e => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        style={{
                          fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.625rem',
                          borderRadius: 20, border: `1.5px solid ${STATUS_COLOR[o.status]}30`,
                          background: STATUS_COLOR[o.status] + '12', color: STATUS_COLOR[o.status],
                          cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', outline: 'none',
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s} style={{ color: '#374151', background: 'white' }}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-playfair)' }}>
                      ${Number(o.total).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.78rem', color: '#9ca3af' }}>
                      {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <Link
                        href={`/receipt/${o.id}`}
                        target="_blank"
                        style={btnStyle('#374151', '#f5f4f1')}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Receipt
                      </Link>
                    </td>
                  </tr>

                  {expanded === o.id && (
                    <tr key={o.id + '-detail'} style={{ background: '#fafaf8', borderTop: '1px solid #f0ede8' }}>
                      <td colSpan={6} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                        {/* Customer & shipping info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Customer</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 600 }}>{o.user_name || o.shipping_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{o.user_email}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Ship To</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--ink)', lineHeight: 1.6 }}>
                              {o.shipping_address}, {o.shipping_city}, {o.shipping_country} {o.shipping_zip}
                            </div>
                            {o.shipping_phone && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>📞 {o.shipping_phone}</div>}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Expected Delivery</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 600 }}>{deliveryDate(o.created_at)}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Standard 7-day delivery</div>
                          </div>
                        </div>

                        {/* Items table */}
                        <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', borderTop: '1px solid #e5e2dc' }}>
                          <thead>
                            <tr style={{ color: '#9ca3af' }}>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Item</th>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Options</th>
                              <th style={{ textAlign: 'center', padding: '0.5rem 0', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Qty</th>
                              <th style={{ textAlign: 'right', padding: '0.5rem 0', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unit</th>
                              <th style={{ textAlign: 'right', padding: '0.5rem 0', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(o.items || []).map((item, i) => (
                              <tr key={i} style={{ borderTop: '1px solid #f5f4f1' }}>
                                <td style={{ padding: '0.5rem 0', color: 'var(--ink)', fontWeight: 600 }}>{item.product_name}</td>
                                <td style={{ padding: '0.5rem 0', color: '#6b7280' }}>
                                  {[item.color_name, item.size].filter(Boolean).join(' / ') || '—'}
                                </td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>{item.qty}</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>${Number(item.price).toFixed(2)}</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 700 }}>${(Number(item.price) * item.qty).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!orders.length && (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
