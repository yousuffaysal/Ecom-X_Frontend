'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'
import { useAuth } from '@/lib/AuthContext'
import { subscribeToPush } from '@/lib/push'

export default function Nav() {
  const [scrolled, setScrolled]       = useState(false)
  const [userMenuOpen, setUserMenu]   = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const { cart, setCartOpen } = useCart()
  const { user, logout }      = useAuth()
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const menuRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const links = [
    { href: '/',                label: 'Home' },
    { href: '/shop',            label: 'Shop' },
    { href: '/style-advisor',   label: 'AI Stylist', ai: true },
    { href: '/about',           label: 'About' },
    { href: '/contact',         label: 'Contact' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo" onClick={() => router.push('/')}>Redleaf</div>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map(l => (
            <button
              key={l.href}
              className={`nav-link ${isActive(l.href) ? 'active' : ''}`}
              onClick={() => router.push(l.href)}
              style={l.ai ? { display: 'flex', alignItems: 'center', gap: '0.3rem' } : {}}
            >
              {l.ai && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              )}
              {l.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          {/* Search */}
          <button className="nav-icon-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* User / Account */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn"
              aria-label="Account"
              onClick={() => user ? setUserMenu(v => !v) : router.push('/auth/login')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              {user && (
                <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--red)', borderRadius: '50%', border: '1.5px solid white' }} />
              )}
            </button>

            {userMenuOpen && user && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                minWidth: 180, zIndex: 600, overflow: 'hidden',
                border: '1px solid var(--border)',
              }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{user.email}</div>
                </div>
                {[
                  { label: 'My Account', href: '/account' },
                  { label: 'Orders',     href: '/account/orders' },
                  { label: 'Wishlist',   href: '/account/wishlist' },
                  ...(['admin','moderator','staff'].includes(user.role) ? [{ label: 'Dashboard', href: '/admin' }] : []),
                ].map(item => (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setUserMenu(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.7rem 1rem', fontSize: '0.875rem', color: 'var(--ink)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-dm-sans)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--offwhite)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => { logout(); setUserMenu(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.7rem 1rem', fontSize: '0.875rem', color: 'var(--red)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-dm-sans)', fontWeight: 600,
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications — Desktop only */}
          <button 
            className="nav-icon-btn rsp-hide-mobile" 
            aria-label="Notifications"
            onClick={async () => {
              try {
                const res = await Notification.requestPermission()
                if (res === 'granted') {
                  await subscribeToPush()
                  alert('Notifications enabled!')
                }
              } catch (err) {
                console.error(err)
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          {/* Cart */}
          <button className="nav-icon-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="nav-mobile-btn"
            aria-label="Menu"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`nav-mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <div className={`nav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {links.map(l => (
          <button
            key={l.href}
            className={`nav-mobile-link ${isActive(l.href) ? 'active' : ''}`}
            onClick={() => { router.push(l.href); setMobileOpen(false) }}
            style={l.ai ? { display: 'flex', alignItems: 'center', gap: '0.4rem' } : {}}
          >
            {l.ai && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            )}
            {l.label}
          </button>
        ))}
        {user ? (
          <>
            <button className="nav-mobile-link" onClick={() => { router.push('/account'); setMobileOpen(false) }}>My Account</button>
            {['admin','moderator','staff'].includes(user.role) && (
              <button className="nav-mobile-link" onClick={() => { router.push('/admin'); setMobileOpen(false) }}>Dashboard</button>
            )}
            <button className="nav-mobile-link" style={{ color: 'var(--red)' }} onClick={() => { logout(); setMobileOpen(false) }}>Sign Out</button>
          </>
        ) : (
          <button className="nav-mobile-link" style={{ color: 'var(--red)', fontWeight: 700 }} onClick={() => { router.push('/auth/login'); setMobileOpen(false) }}>Sign In</button>
        )}
      </div>
    </>
  )
}
