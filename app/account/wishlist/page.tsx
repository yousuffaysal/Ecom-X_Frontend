'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type WishlistProduct = {
  id: string; slug: string; name: string; price: number; original_price: number | null
  badge: string | null; bg: string; rating: number; review_count: number
  images: { url: string }[] | null
  wishlist_item_id: string
}

export default function WishlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [items, setItems]     = useState<WishlistProduct[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/account/wishlist')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/wishlist').then(r => r.json()).then(d => {
      setItems(d.items || [])
      setFetching(false)
    })
  }, [user])

  async function removeFromWishlist(productId: string) {
    await fetch(`/api/wishlist?product_id=${productId}`, { method: 'DELETE' })
    setItems(i => i.filter(p => p.id !== productId))
  }

  if (loading || !user) return null

  return (
    <div style={{ minHeight: '80vh', background: 'var(--cream)', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <Link href="/account" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem' }}>← Account</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: 'var(--ink)', fontWeight: 700 }}>
            Wishlist
          </h1>
        </div>

        {fetching ? (
          <div style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>♡</div>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Your wishlist is empty.</p>
            <Link href="/shop" className="btn-primary" style={{ textDecoration: 'none', padding: '0.75rem 2rem' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {items.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: p.bg, aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
                    {p.images?.[0] && (
                      <img src={p.images[0].url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {p.badge && (
                      <span style={{
                        position: 'absolute', top: 12, left: 12, fontSize: '0.7rem', fontWeight: 700,
                        padding: '0.25rem 0.625rem', borderRadius: 12,
                        background: p.badge === 'Sale' ? 'var(--red)' : 'var(--ink)', color: 'white',
                      }}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '0.25rem' }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>${Number(p.price).toFixed(2)}</span>
                      {p.original_price && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'line-through' }}>
                          ${Number(p.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="btn-primary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(p.id)}
                    style={{ padding: '0.6rem 0.875rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
