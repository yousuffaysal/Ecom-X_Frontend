'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ForecastProduct } from '@/app/api/admin/restock/forecast/route'

// ─── Inventory types ────────────────────────────────────────────────────────

type Product = {
  id: string; slug: string; name: string; category: string; badge: string | null
  image_url: string | null; stock_qty: number | null
  units_sold_30d: number; orders_30d: number; daily_velocity: number
  days_left: number | null; risk: 'critical' | 'warning' | 'healthy' | 'no-stock-data'
}

const RISK = {
  critical:         { label: 'Critical',   color: '#b91c1c', bg: '#fee2e2', dot: '#dc2626' },
  warning:          { label: 'Low Stock',  color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  healthy:          { label: 'Healthy',    color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
  'no-stock-data':  { label: 'No Data',   color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
}

const URGENCY = {
  critical: { label: 'Critical', color: '#b91c1c', bg: '#fee2e2', dot: '#dc2626' },
  high:     { label: 'High',     color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  medium:   { label: 'Medium',   color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
  low:      { label: 'OK',       color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
  'no-data':{ label: 'No Data',  color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
}

// ─── Trend arrow ─────────────────────────────────────────────────────────────

function TrendBadge({ pct }: { pct: number }) {
  const up    = pct > 2
  const down  = pct < -2
  const color = up ? '#065f46' : down ? '#b91c1c' : '#6b7280'
  const bg    = up ? '#d1fae5' : down ? '#fee2e2' : '#f3f4f6'
  const arrow = up ? '↑' : down ? '↓' : '→'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '0.2rem 0.55rem', borderRadius: 10, background: bg, color, fontSize: '0.72rem', fontWeight: 700 }}>
      {arrow} {Math.abs(pct) < 1 ? '<1' : Math.abs(Math.round(pct))}%
    </span>
  )
}

// ─── Mini bar ────────────────────────────────────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 5, background: '#f0ede8', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', minWidth: 28, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RestockPage() {
  const [tab, setTab]             = useState<'inventory' | 'forecast'>('inventory')

  // Inventory state
  const [products, setProducts]   = useState<Product[]>([])
  const [invLoading, setInvLoad]  = useState(true)
  const [editId, setEditId]       = useState<string | null>(null)
  const [editVal, setEditVal]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [filter, setFilter]       = useState<'all' | 'critical' | 'warning' | 'no-stock-data'>('all')

  // Forecast state
  const [forecast, setForecast]   = useState<ForecastProduct[]>([])
  const [summary, setSummary]     = useState('')
  const [generatedAt, setGenAt]   = useState('')
  const [fcLoading, setFcLoad]    = useState(false)
  const [fcLoaded, setFcLoaded]   = useState(false)
  const [fcFilter, setFcFilter]   = useState<'all' | 'critical' | 'high' | 'medium'>('all')

  // ── Inventory load ──────────────────────────────────────────────────────────
  async function loadInventory() {
    setInvLoad(true)
    const res  = await fetch('/api/admin/restock')
    const data = await res.json()
    setProducts(data.products || [])
    setInvLoad(false)
  }

  useEffect(() => { loadInventory() }, [])

  async function saveStock(id: string) {
    setSaving(true)
    await fetch('/api/admin/restock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, stock_qty: parseInt(editVal) || 0 }),
    })
    setSaving(false)
    setEditId(null)
    loadInventory()
  }

  // ── Forecast load (lazy — only when tab opens) ──────────────────────────────
  async function loadForecast() {
    if (fcLoaded) return
    setFcLoad(true)
    const res  = await fetch('/api/admin/restock/forecast')
    const data = await res.json()
    setForecast(data.products || [])
    setSummary(data.summary || '')
    setGenAt(data.generated_at || '')
    setFcLoad(false)
    setFcLoaded(true)
  }

  function openForecast() {
    setTab('forecast')
    loadForecast()
  }

  // ── Inventory derived ────────────────────────────────────────────────────────
  const filtered  = filter === 'all' ? products : products.filter(p => p.risk === filter)
  const invCounts = {
    critical:         products.filter(p => p.risk === 'critical').length,
    warning:          products.filter(p => p.risk === 'warning').length,
    'no-stock-data':  products.filter(p => p.risk === 'no-stock-data').length,
  }

  // ── Forecast derived ─────────────────────────────────────────────────────────
  const fcFiltered  = fcFilter === 'all' ? forecast : forecast.filter(p => p.urgency === fcFilter)
  const maxForecast = Math.max(...forecast.map(p => p.forecast_30d), 1)
  const fcCounts    = {
    critical: forecast.filter(p => p.urgency === 'critical').length,
    high:     forecast.filter(p => p.urgency === 'high').length,
    medium:   forecast.filter(p => p.urgency === 'medium').length,
    reorder:  forecast.filter(p => p.reorder_qty > 0).length,
  }

  // Format summary bullets
  const summaryLines = summary
    .split('\n')
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

  return (
    <div style={{ padding: '2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: '#0f0e0d', marginBottom: '0.375rem' }}>
          Inventory & Demand Forecast
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
          30-day velocity tracking with AI-powered demand forecasting and reorder suggestions.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.75rem', background: '#f3f2ef', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {([
          ['inventory', 'Inventory', null],
          ['forecast',  'Demand Forecast', 'AI'],
        ] as const).map(([key, label, badge]) => (
          <button
            key={key}
            onClick={() => key === 'forecast' ? openForecast() : setTab('inventory')}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', fontWeight: 600,
              background: tab === key ? 'white' : 'transparent',
              color: tab === key ? '#0f0e0d' : '#6b7280',
              boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {label}
            {badge && (
              <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: '#b91c1c', color: 'white', letterSpacing: '0.08em' }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── INVENTORY TAB ─────────────────────────────────────────────────────── */}
      {tab === 'inventory' && (
        <>
          {!invLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
              {[
                { label: 'Total Products',  value: products.length,          color: '#0f0e0d', bg: 'white' },
                { label: 'Critical',        value: invCounts.critical,        color: '#b91c1c', bg: '#fee2e2' },
                { label: 'Low Stock',       value: invCounts.warning,         color: '#92400e', bg: '#fef3c7' },
                { label: 'No Stock Data',   value: invCounts['no-stock-data'], color: '#6b7280', bg: '#f3f4f6' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '1.25rem 1.5rem', border: '1.5px solid #e5e2dc' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.color, marginBottom: '0.375rem' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {([['all', 'All'], ['critical', 'Critical'], ['warning', 'Low Stock'], ['no-stock-data', 'No Data']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} style={{ padding: '0.4rem 0.875rem', borderRadius: 20, border: '1.5px solid', borderColor: filter === key ? '#0f0e0d' : '#e5e2dc', background: filter === key ? '#0f0e0d' : 'white', color: filter === key ? 'white' : '#374151', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1.5px solid #e5e2dc' }}>
            {invLoading ? (
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
                              {p.image_url
                                ? <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                                : <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0ede8', flexShrink: 0 }} />
                              }
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f0e0d' }}>{p.name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{p.category || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.625rem', borderRadius: 12, background: r.bg, color: r.color, fontSize: '0.7rem', fontWeight: 700 }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: r.dot }} />
                              {r.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: '#0f0e0d' }}>{p.units_sold_30d}</td>
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
        </>
      )}

      {/* ── FORECAST TAB ──────────────────────────────────────────────────────── */}
      {tab === 'forecast' && (
        <>
          {fcLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '5rem 2rem', color: '#9ca3af' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e5e2dc', borderTopColor: '#b91c1c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontSize: '0.85rem' }}>Running AI forecast analysis…</div>
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                  { label: 'Need Reorder',  value: fcCounts.reorder,   color: '#0f0e0d', bg: 'white' },
                  { label: 'Critical',      value: fcCounts.critical,  color: '#b91c1c', bg: '#fee2e2' },
                  { label: 'High Urgency',  value: fcCounts.high,      color: '#92400e', bg: '#fef3c7' },
                  { label: 'Watch',         value: fcCounts.medium,    color: '#1e40af', bg: '#dbeafe' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '1.25rem 1.5rem', border: '1.5px solid #e5e2dc' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.color, marginBottom: '0.375rem' }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* AI summary card */}
              {summaryLines.length > 0 && (
                <div style={{ background: '#0f0e0d', borderRadius: 12, padding: '1.5rem 1.75rem', marginBottom: '1.75rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(185,28,28,0.2)', border: '1px solid rgba(185,28,28,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#b91c1c" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(185,28,28,0.9)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                      AI Forecast Summary
                    </span>
                    {generatedAt && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>
                        {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {summaryLines.map((line, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.855rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#b91c1c', flexShrink: 0, marginTop: '0.45rem' }} />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setFcLoaded(false); loadForecast() }}
                    style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', padding: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  >
                    ↺ Regenerate forecast
                  </button>
                </div>
              )}

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {([['all', 'All'], ['critical', 'Critical'], ['high', 'High'], ['medium', 'Watch']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setFcFilter(key)} style={{ padding: '0.4rem 0.875rem', borderRadius: 20, border: '1.5px solid', borderColor: fcFilter === key ? '#0f0e0d' : '#e5e2dc', background: fcFilter === key ? '#0f0e0d' : 'white', color: fcFilter === key ? 'white' : '#374151', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', transition: 'all 0.15s' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Forecast table */}
              <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1.5px solid #e5e2dc' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#faf9f7', fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left',    fontWeight: 700 }}>Product</th>
                        <th style={{ padding: '0.75rem 1rem',    textAlign: 'center',  fontWeight: 700 }}>Urgency</th>
                        <th style={{ padding: '0.75rem 1rem',    textAlign: 'right',   fontWeight: 700 }}>Sold 30d</th>
                        <th style={{ padding: '0.75rem 1rem',    textAlign: 'center',  fontWeight: 700 }}>MoM Trend</th>
                        <th style={{ padding: '0.75rem 1rem',    textAlign: 'center',  fontWeight: 700 }}>Seasonal</th>
                        <th style={{ padding: '0.75rem 1rem',    textAlign: 'left',    fontWeight: 700, minWidth: 140 }}>Forecast (30d)</th>
                        <th style={{ padding: '0.75rem 1rem',    textAlign: 'center',  fontWeight: 700 }}>Stock</th>
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right',   fontWeight: 700 }}>Reorder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fcFiltered.map(p => {
                        const u = URGENCY[p.urgency]
                        const sfLabel = p.seasonality_factor > 1.1 ? `+${Math.round((p.seasonality_factor - 1) * 100)}% YoY` : p.seasonality_factor < 0.9 ? `${Math.round((p.seasonality_factor - 1) * 100)}% YoY` : 'Stable'
                        const sfColor = p.seasonality_factor > 1.1 ? '#065f46' : p.seasonality_factor < 0.9 ? '#b91c1c' : '#6b7280'

                        return (
                          <tr key={p.id} style={{ borderTop: '1px solid #f0ede8' }}>
                            {/* Product */}
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {p.image_url
                                  ? <img src={p.image_url} alt={p.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                  : <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f0ede8', flexShrink: 0 }} />
                                }
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f0e0d' }}>{p.name}</div>
                                  <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{p.category || '—'}</div>
                                </div>
                              </div>
                            </td>

                            {/* Urgency */}
                            <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.625rem', borderRadius: 12, background: u.bg, color: u.color, fontSize: '0.7rem', fontWeight: 700 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: u.dot }} />
                                {u.label}
                              </span>
                            </td>

                            {/* Sold 30d */}
                            <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: '#0f0e0d' }}>
                              {p.units_30d}
                            </td>

                            {/* MoM Trend */}
                            <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                              {p.units_prev_30d > 0
                                ? <TrendBadge pct={p.trend_pct} />
                                : <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>—</span>
                              }
                            </td>

                            {/* Seasonal factor */}
                            <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: sfColor }}>
                              {p.units_yoy > 0 || p.units_yoy_prev > 0 ? sfLabel : <span style={{ color: '#9ca3af' }}>No YoY data</span>}
                            </td>

                            {/* Forecast bar */}
                            <td style={{ padding: '0.875rem 1rem', minWidth: 140 }}>
                              <Bar value={p.forecast_30d} max={maxForecast} color={p.urgency === 'critical' ? '#dc2626' : p.urgency === 'high' ? '#f59e0b' : '#3b82f6'} />
                            </td>

                            {/* Stock */}
                            <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: p.stock_qty === null ? '#9ca3af' : p.stock_qty === 0 ? '#b91c1c' : '#374151' }}>
                              {p.stock_qty !== null ? p.stock_qty : '—'}
                            </td>

                            {/* Reorder suggestion */}
                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                              {p.reorder_qty > 0 ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 8, background: p.urgency === 'critical' ? '#fee2e2' : '#fef3c7', color: p.urgency === 'critical' ? '#b91c1c' : '#92400e', fontSize: '0.78rem', fontWeight: 700 }}>
                                  + {p.reorder_qty} units
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>✓ Sufficient</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '1rem', textAlign: 'center' }}>
                Forecast = current velocity × MoM trend (60%) + YoY seasonal factor (40%) · Reorder includes 20% safety buffer
              </p>
            </>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
