'use client'

import { useEffect, useState } from 'react'

type Message = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading]   = useState(true)
  const [active, setActive]     = useState<string | null>(null)
  const [filter, setFilter]     = useState<'all' | 'unread' | 'read'>('all')

  const load = async () => {
    const res = await fetch('/api/admin/messages')
    const d   = await res.json()
    setMessages(d.messages || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const markRead = async (id: string, read: boolean) => {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m))
  }

  const deleteMsg = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setMessages(prev => prev.filter(m => m.id !== id))
    if (active === id) setActive(null)
  }

  const filtered = messages.filter(m =>
    filter === 'all' ? true : filter === 'unread' ? !m.read : m.read
  )

  const unreadCount = messages.filter(m => !m.read).length
  const activeMsg   = messages.find(m => m.id === active) || null

  const openMsg = (m: Message) => {
    setActive(m.id)
    if (!m.read) markRead(m.id, true)
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '0.25rem' }}>
          Messages
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Contact form submissions from customers</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total',  value: messages.length,                        color: 'var(--ink)' },
          { label: 'Unread', value: unreadCount,                            color: 'var(--red)' },
          { label: 'Read',   value: messages.length - unreadCount,           color: '#2563eb' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #f0ede8' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', background: 'white', borderRadius: 10, border: '1.5px solid #e5e2dc', overflow: 'hidden', marginBottom: '1.5rem', width: 'fit-content' }}>
        {(['all', 'unread', 'read'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.6rem 1.25rem', fontSize: '0.8rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
              background: filter === f ? 'var(--ink)' : 'white',
              color: filter === f ? 'white' : '#6b7280',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}
          >
            {f === 'all' ? `All (${messages.length})` : f === 'unread' ? `Unread (${unreadCount})` : `Read (${messages.length - unreadCount})`}
          </button>
        ))}
      </div>

      {/* Two-pane layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.25rem', alignItems: 'start' }} className="rsp-1col">

        {/* Message list */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No messages</div>
          ) : filtered.map((m, i) => (
            <div
              key={m.id}
              onClick={() => openMsg(m)}
              style={{
                padding: '1rem 1.25rem',
                borderTop: i === 0 ? 'none' : '1px solid #f5f4f1',
                cursor: 'pointer',
                background: active === m.id ? '#f5f4f1' : m.read ? 'white' : '#fefcfa',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!m.read && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                  )}
                  <div style={{ fontWeight: m.read ? 500 : 700, fontSize: '0.875rem', color: 'var(--ink)' }}>
                    {m.name}
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: m.read ? 400 : 600 }}>
                {m.subject || 'General Inquiry'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.message}
              </div>
            </div>
          ))}
        </div>

        {/* Detail pane */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minHeight: 400 }}>
          {!activeMsg ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ marginBottom: '1rem', color: '#d1d5db' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Select a message</div>
              <div style={{ fontSize: '0.8rem' }}>Click any message on the left to read it</div>
            </div>
          ) : (
            <div style={{ padding: '1.75rem 2rem' }}>
              {/* Message header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f5f4f1' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
                    {activeMsg.subject || 'General Inquiry'}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#6b7280' }}>
                    <span>From: <strong style={{ color: 'var(--ink)' }}>{activeMsg.name}</strong></span>
                    <span>·</span>
                    <a href={`mailto:${activeMsg.email}`} style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>
                      {activeMsg.email}
                    </a>
                    <span>·</span>
                    <span>{new Date(activeMsg.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => markRead(activeMsg.id, !activeMsg.read)}
                    style={{
                      padding: '0.5rem 0.875rem', fontSize: '0.78rem', fontWeight: 600,
                      borderRadius: 8, border: '1.5px solid #e5e2dc', cursor: 'pointer',
                      background: 'white', color: '#6b7280', fontFamily: 'var(--font-dm-sans)',
                    }}
                  >
                    {activeMsg.read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <a
                    href={`mailto:${activeMsg.email}?subject=Re: ${encodeURIComponent(activeMsg.subject || 'Your message')}`}
                    style={{
                      padding: '0.5rem 0.875rem', fontSize: '0.78rem', fontWeight: 600,
                      borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: 'var(--ink)', color: 'white',
                      fontFamily: 'var(--font-dm-sans)', textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3h18l-9 9-9-9z"/><path d="M3 3v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3"/></svg>
                    Reply
                  </a>
                  <button
                    onClick={() => deleteMsg(activeMsg.id)}
                    style={{
                      padding: '0.5rem 0.875rem', fontSize: '0.78rem', fontWeight: 600,
                      borderRadius: 8, border: '1.5px solid #fecaca', cursor: 'pointer',
                      background: '#fff5f5', color: '#b91c1c', fontFamily: 'var(--font-dm-sans)',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {activeMsg.message}
              </div>
            </div>
          )}
        </div>
      </div>

      {!loading && (
        <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#9ca3af', textAlign: 'right' }}>
          {filtered.length} of {messages.length} messages
        </div>
      )}
    </div>
  )
}
