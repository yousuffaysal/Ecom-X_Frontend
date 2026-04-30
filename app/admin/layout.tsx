'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isStaffRole, ROLE_LABEL, ROLE_COLOR, type Permission, can } from '@/lib/permissions'
import type { Role } from '@/lib/auth'

type NavItem = {
  href: string
  label: string
  permission: Permission | null  // null = visible to all staff roles
  ai?: true
  icon: (a: boolean) => React.ReactNode
}

const NAV: NavItem[] = [
  { href: '/admin',            label: 'Overview',   permission: null,              icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { href: '/admin/products',   label: 'Products',   permission: 'manageProducts',  icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  )},
  { href: '/admin/categories', label: 'Categories', permission: 'manageCategories', icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M4 6h16M4 12h8m-8 6h16"/>
    </svg>
  )},
  { href: '/admin/orders',     label: 'Orders',     permission: 'viewOrders',       icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  )},
  { href: '/admin/messages',   label: 'Messages',   permission: 'viewMessages',     icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )},
  { href: '/admin/users',      label: 'Team',       permission: 'manageUsers',      icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { href: '/admin/customers',  label: 'Customers',  permission: 'viewCLV',          ai: true, icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { href: '/admin/restock',    label: 'Restock',    permission: 'viewRestock',      ai: true, icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M4 4h16v4H4z"/><path d="M4 12h10v8H4z"/><path d="M18 12v8m-3-3 3 3 3-3"/>
    </svg>
  )},
  { href: '/admin/ai-chat',    label: 'Ask AI',     permission: 'useAIChat',        ai: true, icon: (a) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 10h8M8 14h5"/>
    </svg>
  )},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isStaffRole(user.role))) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  if (loading || !user || !isStaffRole(user.role)) return null

  const role = user.role as Role
  const roleLabel = ROLE_LABEL[role]
  const roleColor = ROLE_COLOR[role]

  const visibleNav = NAV.filter(item =>
    item.permission === null ? true : can(role, item.permission)
  )

  const Sidebar = () => (
    <aside style={{
      width: 220, background: '#0f0e0d', color: 'white',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 200,
    }}>
      {/* Brand */}
      <div style={{ padding: '1.75rem 1.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.3rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
            Redleaf
          </div>
          <div style={{ fontSize: '0.65rem', color: roleColor.text, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            {roleLabel}
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="admin-mobile-topbar"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, marginTop: -4 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {visibleNav.map((item, idx) => {
          const exact  = item.href === '/admin'
          const active = exact ? pathname === '/admin' : pathname.startsWith(item.href)
          const isFirstAI = item.ai && !visibleNav[idx - 1]?.ai
          return (
            <div key={item.href}>
              {isFirstAI && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.875rem 0.25rem', marginTop: '0.25rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(185,28,28,0.7)' }}>AI Tools</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                </div>
              )}
              <Link
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.875rem', fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'white' : 'rgba(255,255,255,0.5)',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderRadius: 10, textDecoration: 'none',
                  transition: 'all 0.15s',
                  border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                }}
              >
                {item.icon(active)}
                {item.label}
                {item.ai && (
                  <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: 'rgba(185,28,28,0.8)', flexShrink: 0 }} />
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.875rem', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleColor.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, color: 'white' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 4, background: roleColor.bg, color: roleColor.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {roleLabel}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%', marginTop: '0.5rem', padding: '0.5rem',
            background: 'transparent', color: 'rgba(255,255,255,0.35)',
            border: 'none', borderRadius: 8, fontSize: '0.78rem',
            cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
            transition: 'color 0.15s', textAlign: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(185,28,28,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-dm-sans)', background: '#f5f4f1' }}>

      {/* Desktop sidebar — always visible */}
      <div className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile sidebar — overlay */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(2px)' }}
          />
          <Sidebar />
        </>
      )}

      {/* Main */}
      <main className="rsp-admin-main" style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
        {/* Mobile top bar */}
        <div
          className="admin-mobile-topbar"
          style={{
            background: '#0f0e0d', padding: '0 1rem', height: 56,
            alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky', top: 0, zIndex: 100,
          }}
        >
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
            Redleaf <span style={{ fontSize: '0.6rem', color: roleColor.text, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-dm-sans)' }}>{roleLabel}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </main>

      <style>{`
        .admin-sidebar-desktop { display: contents; }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none; }
          .rsp-admin-main { margin-left: 0 !important; }
          .admin-mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
