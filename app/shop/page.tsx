import { Suspense } from 'react'
import ShopContent from './ShopContent'

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '80px 48px', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
        Loading…
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
