'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = {
  id: string; slug: string; name: string; category: string; badge: string | null
  image_url: string | null; stock_qty: number | null
  units_sold_30d: number; orders_30d: number; daily_velocity: number
  days_left: number | null; risk: 'critical' | 'warning' | 'healthy' | 'no-stock-data'
}

const RISK = {
  critical:      { label: 'Critical',      color: '#b91c1c', bg: '#fee2e2', dot: '#dc2626' },
  warning:       { label: 'Low Stock',     color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  healthy:       { label: 'Healthy',       color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
  'no-stock-data': { label: 'No Data',    color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
}

export default function RestockPage() {
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [editId, setEditId]       = useState<string | null>(null)
  const [editVal, setEditVal]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [filter, setFilter]       = useState<'all' | 'critical' | 'warning' | 'no-stock-data'>('all')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/restock')
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveStock(id: string) {
    setSaving(true)
    await fetch('/api/admin/restock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, stock_qty: parseInt(editVal) || 0 }),
    })
    setSaving(false)
    setEditId(null)
    load()
  }

  const filtered = filter === 'all' ? products : products.filter(p => p.risk === filter)
  const counts   = {
    critical:       products.filter(p => p.risk === 'critical').length,
    warning:        products.filter(p => p.risk === 'warning').length,
    'no-stock-data': products.filter(p => p.risk === 'no-stock-data').length,
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
          Smart Restock Alerts
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
          AI-powered inventory intelligence based on 30-day order velocity. Set stock quantities to enable days-left predictions.
        </p>
      </div>

      {/* Stat cards */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Products',  value: products.length, color: '#0f0e0d', bg: 'white' },
            { label: 'Critical',        value: counts.critical, color: '#b91c1c', bg: '#fee2e2' },
            { label: 'Low Stock',       value: counts.warning,  color: '#92400e', bg: '#fef3c7' },
            { label: 'No Stock Data',   value: counts['no-stock-data'], color: '#6b7280', bg: '#f3f4f6' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '1.25rem 1.5rem', border: '1.5px solid #e5e2dc' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.color, marginBottom: '0.375rem' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {([['all', 'All'], ['critical', 'Critical'], ['warning', 'Low Stock'], ['no-stock-data', 'No Data']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{ padding: '0.4rem 0.875rem', borderRadius: 20, border: '1.5px solid', borderColor: filter === key ? '#0f0e0d' : '#e5e2dc', background: filter === key ? '#0f0e0d' : 'white', color: filter === key ? 'white' : '#374151', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1.5px solid #e5e2dc' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No products in this category.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf9f7', fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>Product</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>Risk</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>Sold (30d)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>Daily Vel.</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>Stock Qty</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>Days Left</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const r = RISK[p.risk]
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid #f0ede8' }}>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0ede8', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f0e0d' }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{p.category || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.625rem', borderRadius: 12, background: r.bg, color: r.color, fontSize: '0.7rem', fontWeight: 700 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
                          {r.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: '#0f0e0d' }}>
                        {p.units_sold_30d}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#374151' }}>
                        {p.daily_velocity > 0 ? `${p.daily_velocity.toFixed(2)}/d` : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {editId === p.id ? (
                          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                            <input
                              type="number" min="0" value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveStock(p.id); if (e.key === 'Escape') setEditId(null) }}
                              autoFocus
                              style={{ width: 64, padding: '0.3rem 0.5rem', borderRadius: 6, border: '1.5px solid #6b7280', fontSize: '0.875rem', fontFamily: 'var(--font-dm-sans)', textAlign: 'center' }}
                            />
                            <button onClick={() => saveStock(p.id)} disabled={saving} style={{ padding: '0.3rem 0.5rem', borderRadius: 6, background: '#0f0e0d', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>✓</button>
                            <button onClick={() => setEditId(null)} style={{ padding: '0.3rem 0.5rem', borderRadius: 6, background: '#f0ede8', color: '#374151', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditId(p.id); setEditVal(String(p.stock_qty ?? '')) }}
                            style={{ padding: '0.3rem 0.75rem', borderRadius: 8, border: '1.5px dashed #d1d5db', background: 'transparent', color: p.stock_qty !== null ? '#0f0e0d' : '#9ca3af', fontSize: '0.875rem', fontWeight: p.stock_qty !== null ? 700 : 400, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)' }}
                          >
                            {p.stock_qty !== null ? p.stock_qty : 'Set'}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', color: p.days_left !== null && p.days_left <= 7 ? '#b91c1c' : p.days_left !== null && p.days_left <= 21 ? '#b45309' : '#374151' }}>
                        {p.days_left !== null ? `${p.days_left}d` : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        <Link href={`/admin/products/${p.id}/edit`} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: 6, background: '#f0ede8', color: '#374151', fontWeight: 600, textDecoration: 'none' }}>
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '1rem', textAlign: 'center' }}>
        Velocity = units sold ÷ 30 days · Days Left = stock ÷ daily velocity · Click stock value to edit inline
      </p>
    </div>
  )
}
