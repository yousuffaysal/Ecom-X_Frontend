'use client'

import { usePathname } from 'next/navigation'
import Nav from './Nav'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import Toast from './Toast'
import { useEffect } from 'react'
import { registerServiceWorker, subscribeToPush } from '@/lib/push'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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

  return (
    <>
      <Nav />
      <div className="page-shell">
        <div className="page-content">{children}</div>
        <Footer />
      </div>
      <CartDrawer />
      <Toast />
    </>
  )
}
