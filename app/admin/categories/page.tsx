'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useCart } from '@/lib/CartContext'

type Category = { id: string; name: string; slug: string; description: string; image_url: string; product_count: number }

export default function AdminCategories() {
  const [cats, setCats]       = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm]       = useState({ name: '', slug: '', description: '', image_url: '' })
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const { showToast } = useCart()

  const load = () => fetch(`/api/categories?t=${Date.now()}`).then(r => r.json()).then(d => setCats(d.categories || []))
  useEffect(() => { load() }, [])

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description || '', image_url: c.image_url || '' })
  }

  function openNew() {
    setEditing({ id: '', name: '', slug: '', description: '', image_url: '', product_count: 0 })
    setForm({ name: '', slug: '', description: '', image_url: '' })
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const isNew = !editing?.id
    await fetch(isNew ? '/api/categories' : `/api/categories/${editing!.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast(`"${name}" deleted successfully`)
      load()
    } else {
      alert('Failed to delete category')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({ ...f, image_url: data.url }))
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
    border: '1.5px solid var(--border)', fontSize: '0.9rem',
    fontFamily: 'var(--font-dm-sans)', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 700 }}>
          Categories
        </h1>
        <button onClick={openNew} className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          + Add Category
        </button>
      </div>

      {/* Edit / New form */}
      {editing !== null && (
        <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', marginBottom: '1.25rem' }}>
            {editing.id ? 'Edit Category' : 'New Category'}
          </h2>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}>Name *</label>
              <input style={inputStyle} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}>Slug *</label>
              <input style={inputStyle} required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="my-category" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}>Description</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}>Image URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input style={inputStyle} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
                <div style={{ position: 'relative' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} 
                    disabled={uploading}
                  />
                  <button 
                    type="button" 
                    className="btn-outline" 
                    style={{ padding: '0.625rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    disabled={uploading}
                  >
                    {uploading ? '...' : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.625rem 1.5rem', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline" style={{ padding: '0.625rem 1.5rem' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafaf8', fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Slug</th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>Products</th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #f0ede8' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{c.name}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{c.slug}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--ink)' }}>{c.product_count}</td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => openEdit(c)}
                      style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', borderRadius: 6, background: '#f0ede8', color: 'var(--ink)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id, c.name)}
                      style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!cats.length && (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No categories</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
