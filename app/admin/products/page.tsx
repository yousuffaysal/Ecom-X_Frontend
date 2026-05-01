'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/CartContext'

type Product = {
  id: string; slug: string; name: string; price: number
  category_name: string; badge: string | null; featured: boolean
  rating: number; review_count: number
  review_summary: { generated_at: string } | null
  images: { url: string }[] | null
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const { showToast }           = useCart()

  const load = () => {
    fetch(`/api/products?t=${Date.now()}`).then(r => r.json()).then(d => {
      setProducts(d.products || [])
      setLoading(false)
    })
  }

  useEffect(load, [])

  const [summarizing, setSummarizing] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast(`"${name}" deleted successfully`)
      load()
    } else {
      alert('Failed to delete product')
    }
  }

  async function handleSummarize(id: string, reviewCount: number) {
    if (reviewCount < 3) { alert('Need at least 3 reviews to generate insights.'); return }
    setSummarizing(id)
    await fetch(`/api/products/${id}/summarize`, { method: 'POST' })
    setSummarizing(null)
    load()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 700 }}>
          Products
        </h1>
        <Link href="/admin/products/new" className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none' }}>
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)' }}>Loading…</div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafaf8', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Rating</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Badges</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #f0ede8' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.images?.[0] && (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--ink)' }}>
                    {p.category_name || '—'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--ink)' }}>
                    {Number(p.rating).toFixed(1)} ({p.review_count})
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {p.badge && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 12, background: p.badge === 'Sale' ? '#fee2e2' : '#dcfce7', color: p.badge === 'Sale' ? '#b91c1c' : '#15803d' }}>
                          {p.badge}
                        </span>
                      )}
                      {p.featured && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 12, background: '#fef9c3', color: '#854d0e' }}>
                          Featured
                        </span>
                      )}
                      {p.review_summary ? (
                        <span title={`AI insights generated ${new Date(p.review_summary.generated_at).toLocaleDateString()}`} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 12, background: '#ede9fe', color: '#6d28d9' }}>
                          ✦ Insights
                        </span>
                      ) : (
                        p.review_count >= 3 && (
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 12, background: '#f0ede8', color: '#9ca3af' }}>
                            No insights
                          </span>
                        )
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {p.review_count >= 3 && (
                        <button
                          onClick={() => handleSummarize(p.id, p.review_count)}
                          disabled={summarizing === p.id}
                          title="Generate AI review insights"
                          style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', borderRadius: 6, background: '#ede9fe', color: '#6d28d9', fontWeight: 600, border: 'none', cursor: summarizing === p.id ? 'not-allowed' : 'pointer', opacity: summarizing === p.id ? 0.6 : 1 }}
                        >
                          {summarizing === p.id ? '…' : '✦'}
                        </button>
                      )}
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', borderRadius: 6, background: '#f0ede8', color: 'var(--ink)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No products</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
