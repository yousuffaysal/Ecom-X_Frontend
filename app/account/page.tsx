'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { subscribeToPush } from '@/lib/push'

type Profile = {
  name: string; email: string; role: string
  phone: string; address: string; city: string; country: string; zip: string
}

export default function AccountPage() {
  const { user, loading, logout, refetch } = useAuth()
  const router = useRouter()

  const [profile, setProfile]   = useState<Profile | null>(null)
  const [form, setForm]         = useState({ name: '', phone: '', address: '', city: '', country: '', zip: '' })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [notifStatus, setNotifStatus] = useState<string>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifStatus(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/account')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile) {
        setProfile(d.profile)
        setForm({
          name:    d.profile.name    || '',
          phone:   d.profile.phone   || '',
          address: d.profile.address || '',
          city:    d.profile.city    || '',
          country: d.profile.country || '',
          zip:     d.profile.zip     || '',
        })
      }
    })
  }, [user])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    setSaving(false)
    if (!res.ok) { setSaveError(d.error || 'Save failed'); return }
    setProfile(d.profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setEditOpen(false)
    await refetch()
  }

  if (loading || !user) return null

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
    border: '1.5px solid #e5e2dc', fontSize: '0.875rem',
    fontFamily: 'var(--font-dm-sans)', boxSizing: 'border-box',
    outline: 'none', background: 'white', color: 'var(--ink)',
    transition: 'border-color 0.2s',
  }
  const labelSt: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: '#6b7280', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  return (
    <div style={{ minHeight: '80vh', background: 'var(--cream)', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '0.25rem' }}>
          My Account
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', fontSize: '0.875rem' }}>
          Welcome back, {user.name}
        </p>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { href: '/account/orders',   label: 'My Orders',   desc: 'Track purchases', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
            { href: '/account/wishlist', label: 'Wishlist',     desc: 'Saved items',    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
            { href: '/shop',             label: 'Shop',         desc: 'Browse products', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M12 12v4"/><path d="M9 14h6"/></svg> },
          ].map(card => (
            <Link
              key={card.href} href={card.href}
              style={{ display: 'block', background: 'white', borderRadius: 14, padding: '1.5rem', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.625rem' }}>{card.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>{card.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{card.desc}</div>
            </Link>
          ))}
        </div>

        {/* Notifications Setting */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--offwhite)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Push Notifications</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                  {notifStatus === 'granted' ? 'You are receiving real-time updates.' : 'Get alerts for new products and order updates.'}
                </p>
              </div>
            </div>
            <button
              disabled={notifStatus === 'granted'}
              onClick={async () => {
                try {
                  const res = await Notification.requestPermission()
                  setNotifStatus(res)
                  if (res === 'granted') {
                    await subscribeToPush()
                    alert('Notifications enabled!')
                  } else {
                    alert('Please enable notifications in your browser settings.')
                  }
                } catch (err) {
                  console.error(err)
                }
              }}
              style={{
                padding: '0.5rem 1rem', borderRadius: 10, border: '1.5px solid var(--border)',
                background: notifStatus === 'granted' ? '#f0fdf4' : 'white', 
                color: notifStatus === 'granted' ? '#15803d' : 'var(--ink)', 
                fontSize: '0.82rem', fontWeight: 600,
                cursor: notifStatus === 'granted' ? 'default' : 'pointer', 
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              {notifStatus === 'granted' ? 'Enabled ✓' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Profile details / edit */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Profile &amp; Address</h2>
            <button
              onClick={() => setEditOpen(o => !o)}
              style={{ fontSize: '0.78rem', fontWeight: 600, color: editOpen ? 'var(--muted)' : 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)' }}
            >
              {editOpen ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {saved && (
            <div style={{ background: '#f0fdf4', color: '#15803d', padding: '0.625rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
              Profile saved successfully.
            </div>
          )}

          {!editOpen ? (
            /* Read-only view */
            <div style={{ display: 'grid', gap: 0 }}>
              {[
                { label: 'Name',    value: profile?.name    || user.name },
                { label: 'Email',   value: profile?.email   || user.email },
                { label: 'Phone',   value: profile?.phone   || '—' },
                { label: 'Address', value: profile?.address || '—' },
                { label: 'City',    value: profile?.city    || '—' },
                { label: 'Country', value: profile?.country || '—' },
                { label: 'ZIP',     value: profile?.zip     || '—' },
                { label: 'Role',    value: (profile?.role || user.role).charAt(0).toUpperCase() + (profile?.role || user.role).slice(1) },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: i < arr.length - 1 ? '1px solid #f0ede8' : 'none' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{row.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: row.label === 'Role' && user.role === 'admin' ? 'var(--red)' : 'var(--ink)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            /* Edit form */
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {saveError && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.625rem 0.875rem', borderRadius: 8, fontSize: '0.85rem' }}>{saveError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelSt}>Full Name</label>
                  <input style={inputSt} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--ink)')} onBlur={e => (e.target.style.borderColor = '#e5e2dc')} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelSt}>Phone Number</label>
                  <input style={inputSt} type="tel" value={form.phone} placeholder="+1 (555) 000-0000"
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--ink)')} onBlur={e => (e.target.style.borderColor = '#e5e2dc')} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelSt}>Street Address</label>
                  <input style={inputSt} value={form.address} placeholder="123 Main St"
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--ink)')} onBlur={e => (e.target.style.borderColor = '#e5e2dc')} />
                </div>
                <div>
                  <label style={labelSt}>City</label>
                  <input style={inputSt} value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--ink)')} onBlur={e => (e.target.style.borderColor = '#e5e2dc')} />
                </div>
                <div>
                  <label style={labelSt}>ZIP / Postal Code</label>
                  <input style={inputSt} value={form.zip}
                    onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--ink)')} onBlur={e => (e.target.style.borderColor = '#e5e2dc')} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelSt}>Country</label>
                  <input style={inputSt} value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--ink)')} onBlur={e => (e.target.style.borderColor = '#e5e2dc')} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                  background: saving ? '#9ca3af' : 'var(--ink)', color: 'white',
                  fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-dm-sans)',
                }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditOpen(false)} style={{
                  padding: '0.75rem 1.25rem', borderRadius: 10, border: '1.5px solid #e5e2dc',
                  background: 'white', color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
                }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {user.role === 'admin' && (
          <Link href="/admin" style={{ display: 'block', background: 'var(--ink)', color: 'white', borderRadius: 12, padding: '0.875rem 1.5rem', textDecoration: 'none', fontWeight: 600, marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Go to Admin Panel →
          </Link>
        )}

        <button
          onClick={logout}
          style={{ width: '100%', padding: '0.875rem', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 12, color: 'var(--muted)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
