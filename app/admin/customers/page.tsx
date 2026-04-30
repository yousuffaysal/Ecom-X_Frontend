'use client'

import { useEffect, useState } from 'react'

type Customer = {
  id: string; name: string; email: string; created_at: string
  order_count: number; total_spend: number; avg_order_value: number
  last_order_at: string | null; days_since_last: number
  clv_score: number; tier: string; color: string; bg: string
  ai_insight: string | null
}

type Stats = {
  total: number; totalRevenue: number; avgCLVScore: number
  tierCounts: Record<string, number>
}

const TIER_ORDER = ['Champion', 'Loyal', 'Promising', 'New', 'Occasional', 'At Risk', 'Lost', 'Prospect']

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats]         = useState<Stats | null>(null)
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('All')
  const [sort, setSort]           = useState<'clv_score' | 'total_spend' | 'order_count' | 'days_since_last'>('clv_score')

  useEffect(() => {
    fetch('/api/admin/clv').then(r => r.json()).then(d => {
      setCustomers(d.customers || [])
      setStats(d.stats || null)
      setLoading(false)
    })
  }, [])

  const tiers   = ['All', ...TIER_ORDER.filter(t => customers.some(c => c.tier === t))]
  const filtered = (filter === 'All' ? customers : customers.filter(c => c.tier === filter))
    .slice().sort((a, b) => sort === 'days_since_last' ? a[sort] - b[sort] : b[sort] - a[sort])

  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const fmtMoney = (n: number) => `$${Number(n).toFixed(2)}`

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
          Customer Intelligence
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          AI-computed CLV scores, tier segmentation, and personalized retention insights for your top customers.
        </p>
      </div>

      {/* Stat cards */}
      {stats && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Customers', value: stats.total, suffix: '', color: '#0f0e0d' },
            { label: 'Total Revenue',   value: fmtMoney(stats.totalRevenue), suffix: '', color: '#0f0e0d' },
            { label: 'Avg CLV Score',   value: stats.avgCLVScore, suffix: '/100', color: stats.avgCLVScore >= 60 ? '#065f46' : stats.avgCLVScore >= 35 ? '#92400e' : '#6b7280' },
            { label: 'Champions',       value: stats.tierCounts['Champion'] || 0, suffix: '', color: '#7c3aed' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1.5px solid #e5e2dc', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '0.375rem' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
                {s.value}{s.suffix}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tier filter + sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tiers.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding: '0.35rem 0.75rem', borderRadius: 20, border: '1.5px solid', borderColor: filter === t ? '#0f0e0d' : '#e5e2dc', background: filter === t ? '#0f0e0d' : 'white', color: filter === t ? 'white' : '#374151', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', transition: 'all 0.15s' }}>
              {t}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #e5e2dc', fontSize: '0.78rem', fontFamily: 'var(--font-dm-sans)', color: '#374151', background: 'white', cursor: 'pointer' }}>
          <option value="clv_score">Sort: CLV Score</option>
          <option value="total_spend">Sort: Total Spend</option>
          <option value="order_count">Sort: Order Count</option>
          <option value="days_since_last">Sort: Most Recent</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1.5px solid #e5e2dc' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>Computing CLV scores…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf9f7', fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>Tier</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>CLV Score</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>Total Spend</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>Orders</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>Avg Order</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>Last Order</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>AI Insight</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderTop: '1px solid #f0ede8' }}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0f0e0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f0e0d' }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: 10, background: c.bg, color: c.color, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {c.tier}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <div style={{ width: 52, height: 5, borderRadius: 3, background: '#f0ede8', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${c.clv_score}%`, background: c.clv_score >= 70 ? '#7c3aed' : c.clv_score >= 45 ? '#2563eb' : '#9ca3af', borderRadius: 3, transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f0e0d', minWidth: 28 }}>{c.clv_score}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: '#0f0e0d' }}>
                      {fmtMoney(c.total_spend)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#374151' }}>
                      {c.order_count}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#374151' }}>
                      {c.order_count > 0 ? fmtMoney(c.avg_order_value) : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: c.days_since_last <= 30 ? '#065f46' : c.days_since_last <= 90 ? '#92400e' : '#6b7280' }}>
                      {c.last_order_at ? `${c.days_since_last}d ago` : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', maxWidth: 260 }}>
                      {c.ai_insight ? (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c3aed" stroke="none" style={{ flexShrink: 0, marginTop: 2 }}>
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                          </svg>
                          <span style={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.5 }}>{c.ai_insight}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#d1d5db' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No customers in this tier.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '1rem', textAlign: 'center' }}>
        CLV Score = weighted blend of Recency (30%) · Frequency (25%) · Monetary (30%) · Longevity (15%) · AI insights generated for top 5 customers
      </p>
    </div>
  )
}
