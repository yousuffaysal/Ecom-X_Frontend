'use client'

import { usePathname, useRouter } from 'next/navigation'
import Nav from './Nav'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import Toast from './Toast'
import { useEffect, useState } from 'react'
import { registerServiceWorker, subscribeToPush } from '@/lib/push'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    registerServiceWorker()

    // Auto-prompt logic for first-time visitors
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const hasAsked = localStorage.getItem('push_notif_asked')
      if (!hasAsked) {
        setTimeout(async () => {
          try {
            const res = await Notification.requestPermission()
            localStorage.setItem('push_notif_asked', 'true')
            if (res === 'granted') {
              await subscribeToPush()
            }
          } catch (err) {
            console.error('Auto-prompt error:', err)
          }
        }, 5000) // Ask after 5 seconds of browsing
      }
    }
  }, [])

  // Admin pages have their own full-screen layout — skip storefront shell
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  const showSupport = pathname !== '/support'

  return (
    <>
      <Nav />
      <div className="page-shell">
        <div className="page-content">{children}</div>
        <Footer />
      </div>
      <CartDrawer />
      <Toast />

      {/* Floating support button */}
      {showSupport && (
        <button
          onClick={() => router.push('/support')}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Customer support"
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 900,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: hovered ? '0 1.125rem' : '0',
            width: hovered ? 'auto' : 52, height: 52,
            borderRadius: 26, border: 'none',
            background: '#b91c1c', color: 'white',
            cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
            boxShadow: '0 4px 20px rgba(185,28,28,0.45)',
            transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            overflow: 'hidden', whiteSpace: 'nowrap',
            justifyContent: 'center',
          }}
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="white" strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 5.55 5.55l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.38v1.54"/>
          </svg>
          {hovered && (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.01em' }}>
              Support
            </span>
          )}
        </button>
      )}
    </>
  )
}
