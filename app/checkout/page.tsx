'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useCart } from '@/lib/CartContext'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

/* ── Stripe loader (null-safe if key not configured) ───────────────────── */
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise =
  stripeKey && stripeKey !== 'pk_test_placeholder'
    ? loadStripe(stripeKey)
    : null

type CartItem = {
  id: string; product_id: string; name: string; price: number
  qty: number; color_name: string; size: string; image_url: string; bg: string
}

type PaymentMethod = 'card' | 'cod' | 'paypal'

/* ── Test cards info ───────────────────────────────────────────────────── */
const TEST_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'Visa',       result: 'Success' },
  { number: '2223 0031 2200 3222', brand: 'Mastercard', result: 'Success' },
  { number: '4000 0025 0000 3155', brand: 'Visa',       result: '3D Secure' },
  { number: '4000 0000 0000 9995', brand: 'Visa',       result: 'Declined' },
]

/* ── Stripe card form (inner component, inside Elements) ───────────────── */
function StripeCardForm({
  onSuccess,
  total,
  disabled,
}: {
  onSuccess: (paymentIntentId: string) => void
  total: number
  disabled: boolean
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error, setError]     = useState('')
  const [paying, setPaying]   = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const elementStyle = {
    style: {
      base: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: '15px',
        color: '#1a1a1a',
        '::placeholder': { color: '#9ca3af' },
      },
      invalid: { color: '#b91c1c' },
    },
  }

  async function handlePay() {
    if (!stripe || !elements) return
    setPaying(true)
    setError('')

    const res = await fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Payment setup failed')
      setPaying(false)
      return
    }

    const { clientSecret } = await res.json()
    const cardNumber = elements.getElement(CardNumberElement)
    if (!cardNumber) { setPaying(false); return }

    const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardNumber },
    })

    setPaying(false)
    if (stripeErr) {
      setError(stripeErr.message || 'Payment failed')
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
  }

  const fieldStyle: React.CSSProperties = {
    padding: '0.875rem 1rem',
    borderRadius: 10,
    border: '1.5px solid var(--border)',
    background: 'white',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const focusedStyle: React.CSSProperties = {
    borderColor: 'var(--ink)',
    boxShadow: '0 0 0 3px rgba(26,26,26,0.08)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div>
        <label style={labelSt}>Card Number</label>
        <div style={{ ...fieldStyle, ...(focused === 'number' ? focusedStyle : {}) }}>
          <CardNumberElement
            options={elementStyle}
            onFocus={() => setFocused('number')}
            onBlur={() => setFocused(null)}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelSt}>Expiry</label>
          <div style={{ ...fieldStyle, ...(focused === 'expiry' ? focusedStyle : {}) }}>
            <CardExpiryElement
              options={elementStyle}
              onFocus={() => setFocused('expiry')}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>
        <div>
          <label style={labelSt}>CVC</label>
          <div style={{ ...fieldStyle, ...(focused === 'cvc' ? focusedStyle : {}) }}>
            <CardCvcElement
              options={elementStyle}
              onFocus={() => setFocused('cvc')}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || paying || disabled}
        style={{
          width: '100%', padding: '1rem', borderRadius: 12, border: 'none',
          background: disabled || paying ? '#9ca3af' : 'var(--ink)',
          color: 'white', fontSize: '0.95rem', fontWeight: 700,
          cursor: disabled || paying ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.01em',
          transition: 'background 0.2s',
        }}
      >
        {paying ? 'Processing…' : `Pay $${total.toFixed(2)}`}
      </button>

      {/* Test card hints */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.875rem 1rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Test Cards
        </div>
        {TEST_CARDS.map(c => (
          <div key={c.number} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#166534', padding: '0.2rem 0' }}>
            <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.number}</span>
            <span style={{ color: c.result === 'Declined' ? '#b91c1c' : '#15803d', fontWeight: 600 }}>{c.result}</span>
          </div>
        ))}
        <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '0.4rem' }}>Any future expiry · Any CVC</div>
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#6b7280',
  marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em',
}

/* ── Main checkout page ────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const router   = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { cart, clearCart }            = useCart()

  const [dbCart, setDbCart]     = useState<CartItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [placing, setPlacing]   = useState(false)
  const [error, setError]       = useState('')
  const [step, setStep]         = useState<'shipping' | 'payment'>('shipping')
  const [stripeConfigured] = useState(
    !!stripeKey && stripeKey !== 'pk_test_placeholder'
  )
  const [payMethod, setPayMethod] = useState<PaymentMethod>(
    stripeConfigured ? 'card' : 'cod'
  )

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', country: '', zip: '', notes: '',
  })

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login?redirect=/checkout')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/cart').then(r => r.json()).then(d => {
      setDbCart(d.items || [])
      setFetching(false)
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    setForm(f => ({ ...f, name: user.name, email: user.email }))
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile) setForm(f => ({
        ...f,
        phone: d.profile.phone || '',
        address: d.profile.address || '',
        city: d.profile.city || '',
        country: d.profile.country || '',
        zip: d.profile.zip || '',
      }))
    })
  }, [user])

  const items = dbCart.length
    ? dbCart
    : cart.map(c => ({
        id: c.id, product_id: '', name: c.name, price: c.price,
        qty: c.qty, color_name: c.selectedColor || '', size: c.selectedSize || '',
        image_url: '', bg: c.bg,
      }))

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping  = subtotal > 200 ? 0 : 15
  const total     = subtotal + shipping

  async function createOrder(paymentRef?: string) {
    setPlacing(true)
    setError('')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({
          product_id: i.product_id || null,
          product_name: i.name,
          color_name: i.color_name || null,
          size: i.size || null,
          qty: i.qty,
          price: i.price,
        })),
        subtotal, shipping_cost: shipping, total,
        shipping_name: form.name, shipping_email: form.email,
        shipping_phone: form.phone,
        shipping_address: form.address, shipping_city: form.city,
        shipping_country: form.country, shipping_zip: form.zip,
        notes: [form.notes, paymentRef ? `Payment: ${paymentRef}` : '', payMethod === 'cod' ? 'COD' : ''].filter(Boolean).join(' | ') || null,
      }),
    })

    const data = await res.json()
    setPlacing(false)

    if (!res.ok) {
      setError(data.error || 'Order failed')
      return
    }

    clearCart()
    router.push('/account/orders')
  }

  function validateShipping() {
    return form.name && form.email && form.phone && form.address && form.city && form.country && form.zip
  }

  function handleShippingSubmit(e: FormEvent) {
    e.preventDefault()
    if (validateShipping()) setStep('payment')
  }

  if (authLoading || !user) return null

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '0.875rem 1rem', borderRadius: 10,
    border: '1.5px solid var(--border)', fontSize: '0.9rem',
    fontFamily: 'var(--font-dm-sans)', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    background: 'white',
  }

  const PAY_OPTIONS: { id: PaymentMethod; label: string; icon: string; sub: string }[] = [
    ...(stripeConfigured ? [{ id: 'card' as PaymentMethod, label: 'Credit / Debit Card', icon: '💳', sub: 'Visa, Mastercard, Amex' }] : []),
    { id: 'paypal', label: 'PayPal',           icon: '🅿️', sub: 'Pay with your PayPal account' },
    { id: 'cod',    label: 'Cash on Delivery', icon: '💵', sub: 'Pay when your order arrives' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', cursor: 'pointer' }} onClick={() => router.push('/')}>
          Redleaf
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <StepDot active={step === 'shipping'} done={step === 'payment'} n="1" label="Shipping" />
          <div style={{ width: 32, height: 1, background: step === 'payment' ? 'var(--ink)' : 'var(--border)' }} />
          <StepDot active={step === 'payment'} done={false} n="2" label="Payment" />
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '2.5rem', alignItems: 'start' }} className="rsp-1col">

        {/* Left panel */}
        <div>
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* ── Shipping step ── */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit}>
              <SectionCard title="Shipping Information" icon="📦">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelSt}>Full Name *</label>
                    <input style={inputSt} required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelSt}>Email Address *</label>
                    <input style={inputSt} type="email" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelSt}>Phone Number *</label>
                    <input style={inputSt} type="tel" required value={form.phone}
                      placeholder="+1 (555) 000-0000"
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelSt}>Street Address *</label>
                    <input style={inputSt} required value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div>
                    <label style={labelSt}>City *</label>
                    <input style={inputSt} required value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div>
                    <label style={labelSt}>ZIP / Postal Code *</label>
                    <input style={inputSt} required value={form.zip}
                      onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelSt}>Country *</label>
                    <input style={inputSt} required value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelSt}>Order Notes</label>
                    <textarea rows={2} style={{ ...inputSt, resize: 'vertical' }}
                      value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Delivery instructions, gift message…"
                      onFocus={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>
              </SectionCard>

              <button type="submit" style={{
                width: '100%', padding: '1rem', marginTop: '1.25rem',
                borderRadius: 12, border: 'none', background: 'var(--ink)',
                color: 'white', fontSize: '0.95rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
                letterSpacing: '0.01em', transition: 'opacity 0.2s',
              }}>
                Continue to Payment →
              </button>
            </form>
          )}

          {/* ── Payment step ── */}
          {step === 'payment' && (
            <div>
              {/* Shipping summary */}
              <div style={{ background: 'white', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Ships to</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{form.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{form.address}, {form.city}, {form.country} {form.zip}</div>
                </div>
                <button onClick={() => setStep('shipping')} style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Edit
                </button>
              </div>

              {/* Payment method picker */}
              <SectionCard title="Payment Method" icon="💳">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                  {PAY_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '0.875rem 1rem', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${payMethod === opt.id ? 'var(--ink)' : 'var(--border)'}`,
                        background: payMethod === opt.id ? 'oklch(0.98 0.005 27)' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio" name="payMethod" value={opt.id}
                        checked={payMethod === opt.id}
                        onChange={() => setPayMethod(opt.id)}
                        style={{ accentColor: 'var(--ink)', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: '1.25rem' }}>{opt.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{opt.sub}</div>
                      </div>
                      {payMethod === opt.id && (
                        <span style={{ color: 'var(--ink)', fontSize: '1rem' }}>✓</span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Card payment via Stripe */}
                {payMethod === 'card' && (
                  stripeConfigured && stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <StripeCardForm
                        total={total}
                        disabled={!items.length || placing}
                        onSuccess={async (paymentIntentId) => {
                          await createOrder(`Stripe:${paymentIntentId}`)
                        }}
                      />
                    </Elements>
                  ) : (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e', marginBottom: '0.4rem' }}>Stripe not configured</div>
                      <div style={{ fontSize: '0.8rem', color: '#b45309', lineHeight: 1.5 }}>
                        Add your Stripe test keys to <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 4 }}>.env.local</code>:<br />
                        <code>STRIPE_SECRET_KEY=sk_test_…</code><br />
                        <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…</code><br />
                        Get free test keys at{' '}
                        <span style={{ fontWeight: 600 }}>dashboard.stripe.com/test/apikeys</span>
                      </div>
                    </div>
                  )
                )}

                {/* PayPal */}
                {payMethod === 'paypal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#0369a1' }}>
                      You&apos;ll be redirected to PayPal to complete your purchase securely.
                    </div>
                    <button
                      type="button"
                      disabled={!items.length || placing}
                      onClick={() => createOrder('PayPal-demo')}
                      style={{
                        width: '100%', padding: '1rem', borderRadius: 12, border: 'none',
                        background: '#ffc439', color: '#003087',
                        fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                        fontFamily: 'var(--font-dm-sans)',
                        opacity: !items.length || placing ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>🅿</span>
                      {placing ? 'Processing…' : `Pay $${total.toFixed(2)} with PayPal`}
                    </button>
                  </div>
                )}

                {/* Cash on Delivery */}
                {payMethod === 'cod' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#15803d' }}>
                      Pay in cash when your order is delivered. No prepayment required.
                    </div>
                    <button
                      type="button"
                      disabled={!items.length || placing}
                      onClick={() => createOrder()}
                      style={{
                        width: '100%', padding: '1rem', borderRadius: 12, border: 'none',
                        background: 'var(--ink)', color: 'white',
                        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-dm-sans)',
                        opacity: !items.length || placing ? 0.7 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {placing ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
                    </button>
                  </div>
                )}
              </SectionCard>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div style={{ position: 'sticky', top: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '1.5rem 1.5rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.25rem' }}>
                Order Summary
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', maxHeight: 320, overflowY: 'auto' }}>
              {fetching ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>Loading…</div>
              ) : items.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>Cart is empty</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: item.bg || '#f0ede8', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        <div style={{ position: 'absolute', top: -4, right: -4, background: 'var(--ink)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.qty}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        {(item.color_name || item.size) && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                            {[item.color_name, item.size].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', flexShrink: 0 }}>
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? '#16a34a' : 'var(--muted)' }}>
                  {shipping === 0 ? '✓ Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  Free shipping on orders over $200
                </div>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '0.375rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink)' }}>
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust */}
            <div style={{ background: '#fafaf8', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-around' }}>
              {[['🔒', 'Secure'], ['↩', '30-day returns'], ['✦', '2yr warranty']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── UI sub-components ─────────────────────────────────────────────────── */
function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function StepDot({ active, done, n, label }: { active: boolean; done: boolean; n: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: done ? 'var(--ink)' : active ? 'var(--red)' : 'var(--border)',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s',
      }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: active ? 'var(--red)' : done ? 'var(--ink)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </div>
  )
}
