'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'

type Product = {
  slug: string; name: string; subtitle: string | null
  price: number; original_price: number | null
  bg: string | null; image_url: string | null; category: string | null
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
  id: string
}

const STARTERS = [
  'I need an outfit for a winter wedding',
  'Smart casual look for the office',
  'Weekend getaway — what should I pack?',
  "Help me find something under $200 for date night",
  'What goes with a neutral wardrobe?',
]

function uid() { return Math.random().toString(36).slice(2) }

export default function StyleAdvisorPage() {
  const router  = useRouter()
  const { addToCart } = useCart()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [started, setStarted]   = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setStarted(true)
    setInput('')

    const userMsg: Message = { role: 'user', content: trimmed, id: uid() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/style-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        products: data.suggestedProducts || [],
        id: uid(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a moment — please try again.",
        id: uid(),
      }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const discount = (p: Product) =>
    p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--nav-h))', background: '#faf9f7', fontFamily: 'var(--font-dm-sans)' }}>

      {/* ── Hero header ── */}
      <div style={{ background: '#0f0e0d', padding: '3rem 2rem 2.5rem', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(185,28,28,0.05)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(185,28,28,0.9)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              AI Style Advisor — Powered by Groq
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '0.875rem' }}>
            Meet Aria, Your<br />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>Personal Stylist</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: 480, marginBottom: '1.75rem' }}>
            Describe any occasion, vibe, or style challenge. Aria knows the full Redleaf collection and will find exactly what you need.
          </p>

          {/* Starter chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STARTERS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-dm-sans)',
                  transition: 'all 0.18s',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Red accent line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)', flexShrink: 0 }} />

      {/* ── Messages area ── */}
      <div
        ref={messagesRef}
        style={{ flex: 1, overflowY: 'auto', padding: '2rem 1rem' }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Empty state */}
          {!started && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Start a conversation with Aria</div>
              <div style={{ fontSize: '0.8rem' }}>Try one of the suggestions above, or type your own question below</div>
            </div>
          )}

          {/* Message list */}
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.875rem' }}>

              {/* Bubble */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', maxWidth: '82%', ...(msg.role === 'user' ? { flexDirection: 'row-reverse' } : {}) }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? 'var(--ink)' : '#f0ede8',
                  fontSize: '0.7rem', fontWeight: 700,
                  color: msg.role === 'user' ? 'white' : '#b45309',
                }}>
                  {msg.role === 'user' ? 'You' : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  )}
                </div>

                {/* Message text */}
                <div style={{
                  padding: '0.875rem 1.125rem',
                  borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  background: msg.role === 'user' ? 'var(--ink)' : 'white',
                  color: msg.role === 'user' ? 'white' : '#1a1a1a',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  boxShadow: msg.role === 'user' ? 'none' : '0 2px 12px rgba(0,0,0,0.07)',
                  border: msg.role === 'assistant' ? '1px solid #f0ede8' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.375rem' }}>
                      Aria · Style Advisor
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>

              {/* Product recommendations */}
              {msg.role === 'assistant' && msg.products && msg.products.length > 0 && (
                <div style={{ width: '100%', paddingLeft: '2.5rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
                    Aria recommends
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
                    {msg.products.map(p => {
                      const disc = discount(p)
                      return (
                        <div
                          key={p.slug}
                          style={{
                            background: 'white', borderRadius: 14, overflow: 'hidden',
                            border: '1px solid #f0ede8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}
                          onClick={() => router.push('/product/' + p.slug)}
                        >
                          {/* Image */}
                          <div style={{ height: 160, background: p.bg || 'oklch(0.93 0.03 27)', position: 'relative', overflow: 'hidden' }}>
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.name}</span>
                              </div>
                            )}
                            {disc && (
                              <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--red)', color: 'white', fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 3 }}>
                                −{disc}%
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ padding: '0.875rem' }}>
                            {p.category && (
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.2rem' }}>
                                {p.category}
                              </div>
                            )}
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                              {p.name}
                            </div>
                            {p.subtitle && (
                              <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                                {p.subtitle}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>
                                  ${Number(p.price).toFixed(2)}
                                </span>
                                {p.original_price && (
                                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                                    ${Number(p.original_price).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  addToCart({ id: p.slug, name: p.name, price: p.price, qty: 1, bg: p.bg || 'oklch(0.93 0.03 27)' })
                                }}
                                style={{
                                  padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none',
                                  background: 'var(--ink)', color: 'white',
                                  fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                                  fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap',
                                  transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                              >
                                + Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div style={{ padding: '0.875rem 1.125rem', borderRadius: '4px 18px 18px 18px', background: 'white', border: '1px solid #f0ede8', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                  Aria · Style Advisor
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', height: 18 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', animation: `pulse 1.2s ${i * 0.2}s infinite ease-in-out` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div style={{ borderTop: '1px solid #e5e2dc', background: 'white', padding: '1rem 1.25rem', flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {messages.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                onClick={() => { setMessages([]); setStarted(false) }}
                style={{ fontSize: '0.72rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)' }}
              >
                ↺ New conversation
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aria anything — occasion, style, budget, wardrobe…"
              disabled={loading}
              style={{
                flex: 1, padding: '0.75rem 1rem', borderRadius: 12,
                border: '1.5px solid #e5e2dc', fontSize: '0.875rem',
                fontFamily: 'var(--font-dm-sans)', resize: 'none',
                outline: 'none', lineHeight: 1.5,
                transition: 'border-color 0.2s',
                background: loading ? '#fafaf8' : 'white',
                color: 'var(--ink)',
                minHeight: 46, maxHeight: 120,
                overflowY: 'auto',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={e => (e.target.style.borderColor = '#e5e2dc')}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 46, height: 46, borderRadius: 12, border: 'none', flexShrink: 0,
                background: !input.trim() || loading ? '#e5e2dc' : 'var(--red)',
                color: 'white', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
          <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#9ca3af', textAlign: 'center' }}>
            Aria uses live product data · Press Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Pulse animation for loading dots */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
