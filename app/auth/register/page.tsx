'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Registration failed')
      return
    }

    login(data.user)
    router.push('/')
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: 10,
    border: `1.5px solid ${focused === field ? 'var(--ink)' : '#e5e2dc'}`,
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
        {/* Texture circles */}
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

        {/* Features */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: 32, height: 2, background: 'var(--red)', marginBottom: '1.5rem' }} />
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: 'white', lineHeight: 1.4, letterSpacing: '-0.01em', marginBottom: '2rem' }}>
            Join thousands of members who trust Redleaf.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '◎', label: 'Order tracking & history' },
              { icon: '♡', label: 'Wishlist & saved items' },
              { icon: '⊕', label: 'Faster checkout every time' },
              { icon: '★', label: 'Exclusive member offers' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
          © 2024 Redleaf. All rights reserved.
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
              Get started
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
              Create your account
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Already a member?{' '}
              <Link href="/auth/login" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Sign in
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
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                placeholder="Your full name"
                style={inputStyle('name')}
              />
            </div>

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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Min. 8 characters"
                style={inputStyle('password')}
              />
              <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                Use at least 8 characters for a secure password.
              </div>
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
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#1a1a1a') }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = 'var(--ink)') }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Legal */}
          <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>.
          </p>

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
