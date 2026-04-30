'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type OrderItem = { product_name: string; qty: number; price: string; color_name: string | null; size: string | null }
type Order = {
  id: string; status: string; total: string; subtotal: string; shipping_cost: string
  created_at: string; items: OrderItem[] | null
  shipping_name: string; shipping_address: string; shipping_city: string
  shipping_country: string; shipping_zip: string; shipping_phone: string | null
}

const STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:    { label: 'Payment Pending',  color: '#92400e', bg: '#fffbeb', dot: '#d97706' },
  processing: { label: 'Processing',       color: '#1d4ed8', bg: '#eff6ff', dot: '#3b82f6' },
  shipped:    { label: 'Shipped',          color: '#6d28d9', bg: '#f5f3ff', dot: '#7c3aed' },
  delivered:  { label: 'Delivered',        color: '#15803d', bg: '#f0fdf4', dot: '#16a34a' },
  cancelled:  { label: 'Cancelled',        color: '#b91c1c', bg: '#fef2f2', dot: '#dc2626' },
}

function deliveryDate(createdAt: string) {
  const d = new Date(createdAt)
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function daysLeft(createdAt: string) {
  const delivery = new Date(createdAt)
  delivery.setDate(delivery.getDate() + 7)
  const diff = Math.ceil((delivery.getTime() - Date.now()) / 86400000)
  if (diff <= 0) return null
  return diff
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders]     = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/account/orders')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/orders').then(r => r.json()).then(d => {
      setOrders(d.orders || [])
      setFetching(false)
    })
  }, [user])

  if (loading || !user) return null

  return (
    <div style={{ minHeight: '80vh', background: 'var(--cream)', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <Link href="/account" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem' }}>← Account</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: 'var(--ink)', fontWeight: 700 }}>
            My Orders
          </h1>
        </div>

        {fetching ? (
          <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◎</div>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="btn-primary" style={{ textDecoration: 'none', padding: '0.75rem 2rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map(o => {
              const st = STATUS[o.status] || { label: o.status, color: '#374151', bg: '#f5f4f1', dot: '#9ca3af' }
              const isOpen  = expanded === o.id
              const left    = o.status !== 'delivered' && o.status !== 'cancelled' ? daysLeft(o.created_at) : null
              const items   = o.items || []
              const subtotal = Number(o.subtotal)
              const shipCost = Number(o.shipping_cost)
              const total   = Number(o.total)

              return (
                <div key={o.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {/* Order header row */}
                  <div
                    style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                  >
                    {/* Status dot */}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#9ca3af' }}>
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 20, background: st.bg, color: st.color, textTransform: 'capitalize' }}>
                          {st.label}
                        </span>
                        {left !== null && (
                          <span style={{ fontSize: '0.68rem', color: '#7c3aed', fontWeight: 600, background: '#f5f3ff', padding: '0.2rem 0.5rem', borderRadius: 20 }}>
                            {left}d left
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                        Ordered {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>
                        ${total.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
                    </div>

                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #f0ede8' }}>

                      {/* Delivery timeline */}
                      {o.status !== 'cancelled' && (
                        <div style={{ padding: '1.25rem 1.5rem', background: '#fafaf8', borderBottom: '1px solid #f0ede8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              Delivery Timeline
                            </span>
                          </div>
                          {/* Progress dots */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '0.625rem' }}>
                            {['pending','processing','shipped','delivered'].map((s, i, arr) => {
                              const steps = ['pending','processing','shipped','delivered']
                              const activeIdx = steps.indexOf(o.status)
                              const isDone = i <= activeIdx
                              return (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 0 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: isDone ? st.dot : '#e5e2dc', flexShrink: 0 }} />
                                  {i < arr.length - 1 && (
                                    <div style={{ flex: 1, height: 2, background: isDone && i < activeIdx ? st.dot : '#e5e2dc' }} />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {['Ordered','Processing','Shipped','Delivered'].map(l => (
                              <span key={l} style={{ fontSize: '0.62rem', color: '#9ca3af', fontWeight: 600 }}>{l}</span>
                            ))}
                          </div>
                          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                              <path d="M5 12l5 5 9-9"/>
                            </svg>
                            <span style={{ fontSize: '0.78rem', color: '#374151' }}>
                              {o.status === 'delivered'
                                ? 'Your order has been delivered.'
                                : <>Expected by <strong>{deliveryDate(o.created_at)}</strong></>}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0ede8' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>
                          Items
                        </div>
                        {items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: i < items.length - 1 ? '1px solid #f8f7f5' : 'none' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{item.product_name}</div>
                              {(item.color_name || item.size) && (
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>
                                  {[item.color_name, item.size].filter(Boolean).join(' · ')}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)' }}>
                                ${(Number(item.price) * item.qty).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                ${Number(item.price).toFixed(2)} × {item.qty}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Totals + shipping info */}
                      <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }} className="rsp-1col">
                        {/* Shipping */}
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>
                            Shipping Address
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.7 }}>
                            <strong style={{ color: 'var(--ink)' }}>{o.shipping_name}</strong><br />
                            {o.shipping_address}<br />
                            {o.shipping_city}{o.shipping_zip ? `, ${o.shipping_zip}` : ''}<br />
                            {o.shipping_country}
                            {o.shipping_phone && <><br />{o.shipping_phone}</>}
                          </div>
                        </div>

                        {/* Totals */}
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>
                            Summary
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#6b7280' }}>
                              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#6b7280' }}>
                              <span>Shipping</span>
                              <span style={{ color: shipCost === 0 ? '#16a34a' : '#6b7280', fontWeight: shipCost === 0 ? 600 : 400 }}>
                                {shipCost === 0 ? 'Free' : `$${shipCost.toFixed(2)}`}
                              </span>
                            </div>
                            <div style={{ height: 1, background: '#f0ede8', margin: '0.25rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--ink)', fontSize: '1rem' }}>
                              <span>Total</span><span>${total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0ede8', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Link
                          href={`/receipt/${o.id}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1.25rem', borderRadius: 8,
                            background: 'var(--ink)', color: 'white',
                            fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                            fontFamily: 'var(--font-dm-sans)',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                          View Receipt
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
