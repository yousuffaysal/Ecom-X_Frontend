'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { ROLE_COLOR, ROLE_LABEL } from '@/lib/permissions'
import type { Role } from '@/lib/auth'

type User = {
  id: string; email: string; name: string
  role: Role; created_at: string; order_count: number
}

const ROLES: Role[] = ['admin', 'moderator', 'staff', 'user']

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Role | 'all'>('all')
  const [saving, setSaving] = useState<string | null>(null)

  const load = () => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      setUsers(d.users || [])
      setLoading(false)
    })
  }
  useEffect(load, [])

  async function changeRole(u: User, newRole: Role) {
    if (newRole === u.role) return
    if (!confirm(`Change ${u.name} to ${ROLE_LABEL[newRole]}?`)) return
    setSaving(u.id)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, role: newRole }),
    })
    setUsers(prev => prev.map(p => p.id === u.id ? { ...p, role: newRole } : p))
    setSaving(null)
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.role === filter
    return matchSearch && matchFilter
  })

  const counts = {
    admin:     users.filter(u => u.role === 'admin').length,
    moderator: users.filter(u => u.role === 'moderator').length,
    staff:     users.filter(u => u.role === 'staff').length,
    user:      users.filter(u => u.role === 'user').length,
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '0.25rem' }}>
          Team & Users
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage roles — admins, moderators, staff, and customers</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {([
          { label: 'Total', value: users.length, role: null },
          { label: 'Admins',     value: counts.admin,     role: 'admin'     as Role },
          { label: 'Moderators', value: counts.moderator, role: 'moderator' as Role },
          { label: 'Staff',      value: counts.staff,     role: 'staff'     as Role },
        ]).map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #f0ede8' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem',
              color: s.role ? ROLE_COLOR[s.role].text : '#6b7280' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: s.role ? ROLE_COLOR[s.role].text : 'var(--ink)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: 10, border: '1.5px solid var(--border)',
              fontSize: '0.875rem', fontFamily: 'var(--font-dm-sans)',
              outline: 'none', boxSizing: 'border-box', background: 'white',
            }}
          />
        </div>
        <div style={{ display: 'flex', background: 'white', borderRadius: 10, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
          {(['all', ...ROLES] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.625rem 0.875rem', fontSize: '0.78rem', fontWeight: 600,
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
                background: filter === f ? 'var(--ink)' : 'white',
                color: filter === f ? 'white' : '#6b7280',
                textTransform: 'capitalize', transition: 'all 0.15s',
              }}
            >
              {f === 'all' ? 'All' : ROLE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #f0ede8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafaf8' }}>
              {['User', 'Email', 'Role', 'Orders', 'Joined', 'Change Role'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No users found</td></tr>
            ) : filtered.map((u, i) => {
              const rc = ROLE_COLOR[u.role]
              return (
                <tr key={u.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f5f4f1' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: rc.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>{u.name}</div>
                        {u.id === me?.id && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 500 }}>You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 20,
                      background: rc.bg, color: rc.text, textTransform: 'capitalize',
                    }}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>
                    {u.order_count}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                    {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {u.id !== me?.id ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select
                          value={u.role}
                          disabled={saving === u.id}
                          onChange={e => changeRole(u, e.target.value as Role)}
                          style={{
                            fontSize: '0.78rem', fontWeight: 600, padding: '0.375rem 2rem 0.375rem 0.75rem',
                            borderRadius: 8, border: `1.5px solid ${rc.bg}`,
                            background: rc.bg, color: rc.text,
                            cursor: 'pointer', outline: 'none',
                            fontFamily: 'var(--font-dm-sans)',
                            appearance: 'none', WebkitAppearance: 'none',
                            opacity: saving === u.id ? 0.5 : 1,
                          }}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                        </select>
                        <svg style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: rc.text }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!loading && (
        <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#9ca3af', textAlign: 'right' }}>
          Showing {filtered.length} of {users.length} users
        </div>
      )}

      {/* Role legend */}
      <div style={{ marginTop: '2rem', background: 'white', borderRadius: 14, padding: '1.5rem', border: '1px solid #f0ede8' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Role Permissions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {([
            { role: 'moderator' as Role, perms: ['Manage products & images', 'View all orders', 'Update order status', 'View & reply to messages', 'Delete messages', 'Manage restock alerts', 'Generate AI copy'] },
            { role: 'staff' as Role,     perms: ['View all orders', 'Update order status', 'View messages', 'Mark messages as read'] },
            { role: 'admin' as Role,     perms: ['Full access to everything', 'Manage team roles', 'View revenue & CLV', 'AI Analytics Chat', 'Manage categories'] },
          ]).map(({ role, perms }) => {
            const rc = ROLE_COLOR[role]
            return (
              <div key={role} style={{ borderRadius: 10, border: `1.5px solid ${rc.bg}`, overflow: 'hidden' }}>
                <div style={{ padding: '0.625rem 1rem', background: rc.bg }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rc.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ROLE_LABEL[role]}</span>
                </div>
                <ul style={{ margin: 0, padding: '0.75rem 1rem 0.75rem 1.5rem', listStyle: 'disc' }}>
                  {perms.map(p => (
                    <li key={p} style={{ fontSize: '0.78rem', color: '#374151', marginBottom: '0.25rem' }}>{p}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
