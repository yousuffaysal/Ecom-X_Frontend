'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'

export default function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Login failed')
      return
    }

    login(data.user)
    const isStaff = ['admin', 'moderator', 'staff'].includes(data.user?.role)
    const redirect = params.get('redirect') || (isStaff ? '/admin' : '/')
    router.push(redirect)
  }

  const inputStyle = (name: string) => ({
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: 10,
    border: `1.5px solid ${focused === name ? 'var(--ink)' : '#e5e2dc'}`,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-dm-sans)',
    background: 'white',
    color: 'var(--ink)',
    transition: 'border-color 0.2s',
  })

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', fontFamily: 'var(--font-dm-sans)' }}>

      {/* Left panel — brand */}
      <div style={{
        width: '45%',
        background: '#0f0e0d',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
        className="auth-left-panel"
      >
        {/* Subtle texture circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: 120, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(185,28,28,0.06)' }} />

        {/* Logo */}
        <div>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
            Redleaf
          </div>
          <div style={{ fontSize: '0.62rem', color: 'rgba(185,28,28,0.85)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginTop: 4 }}>
            Est. 2024
          </div>
        </div>

        {/* Centre quote */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: 32, height: 2, background: 'var(--red)', marginBottom: '1.5rem' }} />
          <blockquote style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: 1.4, letterSpacing: '-0.01em', margin: 0 }}>
            Style is a way to say who you are without having to speak.
          </blockquote>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
            — Rachel Zoe
          </p>
        </div>

        {/* Bottom trust */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Premium Quality', 'Free Returns', 'Secure Payments'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        background: '#faf9f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.625rem' }}>
              Welcome back
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
              Sign in to your account
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Don&apos;t have one?{' '}
              <Link href="/auth/register" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Create account
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                style={inputStyle('email')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.01em' }}>
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                style={inputStyle('password')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9375rem',
                marginTop: '0.5rem',
                background: loading ? '#6b7280' : 'var(--ink)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-dm-sans)',
                transition: 'background 0.2s, transform 0.1s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#1a1a1a') }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = 'var(--ink)') }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.75rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e2dc' }} />
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em' }}>DEMO ACCESS</span>
            <div style={{ flex: 1, height: 1, background: '#e5e2dc' }} />
          </div>

          {/* Demo credentials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Customer',  email: 'demo@redleaf.com',      pw: 'user1234',  accent: '#6b7280', bg: '#f3f4f6' },
              { label: 'Staff',     email: 'staff@redleaf.com',     pw: 'staff123',  accent: '#1d4ed8', bg: '#dbeafe' },
              { label: 'Moderator', email: 'mod@redleaf.com',       pw: 'mod123',    accent: '#7c3aed', bg: '#f3e8ff' },
              { label: 'Admin',     email: 'admin@redleaf.com',     pw: 'admin123',  accent: '#b91c1c', bg: '#fee2e2' },
            ].map(d => (
              <button
                key={d.label}
                type="button"
                onClick={() => { setEmail(d.email); setPassword(d.pw) }}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: `1.5px solid ${d.bg}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-dm-sans)',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = d.accent; e.currentTarget.style.background = d.bg }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = d.bg; e.currentTarget.style.background = 'white' }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: d.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                  {d.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{d.email}</div>
              </button>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
