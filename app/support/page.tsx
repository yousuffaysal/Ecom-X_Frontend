'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const STARTERS = [
  'Where is my order?',
  'How do I return an item?',
  'What is the warranty policy?',
  'How long does shipping take?',
  'Can I exchange for a different size?',
  'I need to speak to a human',
]

function uid() { return Math.random().toString(36).slice(2) }

function formatContent(text: string) {
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split('\n').length - 1 && <br />}
    </span>
  ))
}

export default function SupportPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [started, setStarted]   = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setStarted(true)
    setInput('')

    const userMsg: Message = { id: uid(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.authenticated) setAuthenticated(true)

      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: data.message,
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: "I'm having trouble right now. Please try again or visit our [Contact page](/contact).",
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--nav-h))', background: '#faf9f7', fontFamily: 'var(--font-dm-sans)' }}>

      {/* Header */}
      <div style={{ background: '#0f0e0d', padding: '3rem 2rem 2.5rem', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(185,28,28,0.04)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 5.55 5.55l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.38v1.54"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(185,28,28,0.9)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              Customer Support — AI Powered
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '0.875rem' }}>
            How can we<br />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>help you today?</span>
          </h1>

          {/* Auth status pill */}
          {user ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: 20, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: '1.5rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(34,197,94,0.9)' }}>
                Signed in as {user.name} — order lookup enabled
              </span>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
              </svg>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>
                <button onClick={() => router.push('/auth/login')} style={{ background: 'none', border: 'none', color: 'rgba(185,28,28,0.85)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit', fontFamily: 'inherit' }}>Sign in</button>
                {' '}to look up your orders
              </span>
            </div>
          )}

          {/* Starter chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STARTERS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                style={{
                  padding: '0.45rem 0.9rem', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-dm-sans)', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Red accent line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)', flexShrink: 0 }} />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Empty state */}
          {!started && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Ask us anything</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', maxWidth: 320, margin: '0 auto' }}>
                Order status, returns, sizing, shipping, or anything else — we're here.
              </div>

              {/* Info cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: '2rem', textAlign: 'left' }}>
                {[
                  { icon: '↩', title: '30-Day Returns', desc: 'Unworn, tags attached' },
                  { icon: '🛡', title: '2-Year Warranty', desc: 'No receipt needed' },
                  { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $150' },
                ].map(c => (
                  <div key={c.title} style={{ padding: '1rem', background: 'white', borderRadius: 10, border: '1px solid #f0ede8', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1a1a18', marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', maxWidth: '82%', ...(msg.role === 'user' ? { flexDirection: 'row-reverse' } : {}) }}>

                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? '#1a1a18' : '#f0ede8',
                  fontSize: '0.62rem', fontWeight: 700,
                  color: msg.role === 'user' ? 'white' : '#b91c1c',
                }}>
                  {msg.role === 'user' ? (
                    user?.name?.charAt(0).toUpperCase() || 'Y'
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 5.55 5.55l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.38v1.54"/>
                    </svg>
                  )}
                </div>

                {/* Bubble */}
                <div style={{
                  padding: '0.875rem 1.125rem',
                  borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  background: msg.role === 'user' ? '#1a1a18' : 'white',
                  color: msg.role === 'user' ? 'white' : '#1a1a1a',
                  fontSize: '0.875rem', lineHeight: 1.7,
                  boxShadow: msg.role === 'user' ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
                  border: msg.role === 'assistant' ? '1px solid #f0ede8' : 'none',
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.375rem' }}>
                      Redleaf Support
                    </div>
                  )}
                  <div>{formatContent(msg.content)}</div>

                  {/* Escalation nudge — show after every assistant reply */}
                  {msg.role === 'assistant' && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f0ede8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Not resolved?</span>
                      <button
                        onClick={() => router.push('/contact')}
                        style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-dm-sans)' }}
                      >
                        Talk to a human →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 5.55 5.55l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.38v1.54"/>
                </svg>
              </div>
              <div style={{ padding: '0.875rem 1.125rem', borderRadius: '4px 18px 18px 18px', background: 'white', border: '1px solid #f0ede8', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                  Redleaf Support
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

      {/* Input bar */}
      <div style={{ borderTop: '1px solid #e5e2dc', background: 'white', padding: '1rem 1.25rem', flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {messages.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <button
                onClick={() => router.push('/contact')}
                style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Speak to a human
              </button>
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
              placeholder="Ask about your order, returns, sizing, shipping…"
              disabled={loading}
              style={{
                flex: 1, padding: '0.75rem 1rem', borderRadius: 12,
                border: '1.5px solid #e5e2dc', fontSize: '0.875rem',
                fontFamily: 'var(--font-dm-sans)', resize: 'none',
                outline: 'none', lineHeight: 1.5, transition: 'border-color 0.2s',
                background: loading ? '#fafaf8' : 'white', color: 'var(--ink)',
                minHeight: 46, maxHeight: 120, overflowY: 'auto',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={e => (e.target.style.borderColor = '#e5e2dc')}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 46, height: 46, borderRadius: 12, border: 'none', flexShrink: 0,
                background: !input.trim() || loading ? '#e5e2dc' : '#b91c1c',
                color: 'white',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
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
            AI support · responses are instant · Press Enter to send
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 640px) {
          div[style*="repeat(3,1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
