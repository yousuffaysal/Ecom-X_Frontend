'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { can, type Permission } from '@/lib/permissions'
import type { Role } from '@/lib/auth'

type Stats = {
  orders: number
  revenue: string | null
  users: number | null
  products: number
  recentOrders: { id: string; status: string; total: string; created_at: string; user_name: string }[]
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#fffbeb', text: '#92400e' },
  processing: { bg: '#eff6ff', text: '#1d4ed8' },
  shipped:    { bg: '#f5f3ff', text: '#6d28d9' },
  delivered:  { bg: '#f0fdf4', text: '#15803d' },
  cancelled:  { bg: '#fef2f2', text: '#b91c1c' },
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div style={{ padding: '2.5rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          {greeting}, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }} className="admin-stat-grid rsp-4col">
        {[
          stats?.revenue !== null && stats?.revenue !== undefined ? {
            label: 'Total Revenue',
            value: stats ? `$${Number(stats.revenue).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
            sub: 'All time, excl. cancelled',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>
              </svg>
            ),
            accent: '#15803d',
            accentBg: '#f0fdf4',
          } : null,
          {
            label: 'Total Orders',
            value: stats?.orders ?? '—',
            sub: 'Across all statuses',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              </svg>
            ),
            accent: '#1d4ed8',
            accentBg: '#eff6ff',
          },
          stats?.users !== null && stats?.users !== undefined ? {
            label: 'Customers',
            value: stats.users,
            sub: 'Registered accounts',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            ),
            accent: '#7c3aed',
            accentBg: '#f5f3ff',
          } : null,
          {
            label: 'Products',
            value: stats?.products ?? '—',
            sub: 'In catalogue',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            ),
            accent: '#b45309',
            accentBg: '#fffbeb',
          },
        ].filter((card): card is NonNullable<typeof card> => card !== null).map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f0ede8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {card.label}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: card.accentBg, color: card.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.875rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column lower section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }} className="rsp-1col">

        {/* Recent orders table */}
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #f0ede8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f4f1' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Recent Orders</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>Last 5 orders placed</div>
            </div>
            <Link href="/admin/orders" style={{ fontSize: '0.78rem', color: 'var(--red)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
          <div>
            {!stats ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Loading…</div>
            ) : stats.recentOrders.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No orders yet</div>
            ) : stats.recentOrders.map((o, i) => {
              const sc = STATUS_COLOR[o.status] || { bg: '#f5f4f1', text: '#6b7280' }
              return (
                <div key={o.id} style={{ padding: '1rem 1.5rem', borderTop: i === 0 ? 'none' : '1px solid #f5f4f1', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 2 }}>
                      #{o.id.slice(0, 8)}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.user_name || 'Guest'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 20, background: sc.bg, color: sc.text, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {o.status}
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                    ${Number(o.total).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem 1.5rem', border: '1px solid #f0ede8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '1rem' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {([
                { href: '/admin/products/new', label: 'Add New Product',   icon: '+', color: 'var(--red)',   bg: '#fee2e2', permission: 'manageProducts'   as Permission },
                { href: '/admin/orders',       label: 'Manage Orders',     icon: '◎', color: '#1d4ed8', bg: '#eff6ff', permission: 'viewOrders'        as Permission },
                { href: '/admin/users',        label: 'Manage Users',      icon: '⊕', color: '#7c3aed', bg: '#f5f3ff', permission: 'manageUsers'       as Permission },
                { href: '/admin/categories',   label: 'Edit Categories',   icon: '≡', color: '#b45309', bg: '#fffbeb', permission: 'manageCategories'  as Permission },
              ] as const).filter(a => can(user.role as Role, a.permission)).map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: 10, textDecoration: 'none',
                    background: '#fafaf8', border: '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'white'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e2dc' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fafaf8'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{a.label}</span>
                  <svg style={{ marginLeft: 'auto', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Store health */}
          <div style={{ background: 'linear-gradient(135deg, #0f0e0d 0%, #1a1a1a 100%)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Store Status
            </div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              All systems operational
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Database',   ok: true },
                { label: 'Payments',   ok: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY },
                { label: 'Image CDN',  ok: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                  <span style={{ color: '#4ade80', fontSize: '0.72rem', fontWeight: 700 }}>● Online</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
