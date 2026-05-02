'use client'

import { usePathname } from 'next/navigation'
import Nav from './Nav'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import Toast from './Toast'
import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/push'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    registerServiceWorker()
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
