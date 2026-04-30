'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string; slug: string }
type ColorEntry = { name: string; hex: string }
type SizeEntry  = { size: string; available: boolean }
type SpecEntry  = { key: string; value: string }
type ImageEntry = { url: string; label: string }

type FormState = {
  slug: string; name: string; subtitle: string; description: string
  category_id: string; price: string; original_price: string
  badge: string; material: string; fit: string; bg: string; featured: boolean
  images: ImageEntry[]
  colors: ColorEntry[]
  sizes: SizeEntry[]
  specs: SpecEntry[]
}

const BLANK: FormState = {
  slug: '', name: '', subtitle: '', description: '',
  category_id: '', price: '', original_price: '',
  badge: '', material: '', fit: '', bg: 'oklch(0.93 0.03 27)', featured: false,
  images: [{ url: '', label: 'Front' }],
  colors: [{ name: '', hex: '#000000' }],
  sizes: [{ size: 'S', available: true }],
  specs: [{ key: '', value: '' }],
}

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const [cats, setCats]     = useState<Category[]>([])
  const [form, setForm]     = useState<FormState>(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState('')

  async function generateDescription() {
    if (!form.name) { setGenMsg('Add a product name first.'); return }
    setGenerating(true)
    setGenMsg('')
    const catName = cats.find(c => c.id === form.category_id)?.name || ''
    const colorNames = form.colors.filter(c => c.name).map(c => c.name).join(', ')
    try {
      const res = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, category: catName,
          material: form.material, fit: form.fit,
          price: form.price, badge: form.badge,
          colors: colorNames || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setGenMsg(data.error || 'Generation failed'); return }
      if (data.subtitle)    set('subtitle',    data.subtitle)
      if (data.description) set('description', data.description)
      setGenMsg('✓ Copy generated!')
      setTimeout(() => setGenMsg(''), 3000)
    } catch {
      setGenMsg('Network error')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCats(d.categories || []))

    if (productId) {
      fetch(`/api/products/${productId}`)
        .then(r => r.json())
        .then(d => {
          const p = d.product
          if (!p) return
          setForm({
            slug: p.slug, name: p.name, subtitle: p.subtitle || '',
            description: p.description || '', category_id: p.category_id || '',
            price: String(p.price), original_price: p.original_price ? String(p.original_price) : '',
            badge: p.badge || '', material: p.material || '', fit: p.fit || '',
            bg: p.bg || 'oklch(0.93 0.03 27)', featured: p.featured || false,
            images: p.images?.length ? p.images.map((i: ImageEntry) => ({ url: i.url, label: i.label })) : [{ url: '', label: 'Front' }],
            colors: p.colors?.length ? p.colors.map((c: ColorEntry) => ({ name: c.name, hex: c.hex })) : [{ name: '', hex: '#000000' }],
            sizes: p.sizes?.length ? p.sizes.map((s: SizeEntry) => ({ size: s.size, available: s.available })) : [{ size: 'S', available: true }],
            specs: p.specs?.length ? p.specs.map((sp: SpecEntry) => ({ key: sp.key, value: sp.value })) : [{ key: '', value: '' }],
          })
        })
    }
  }, [productId])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    return data.url
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      badge: form.badge || null,
      images: form.images.filter(i => i.url).map((i, pos) => ({ ...i, position: pos })),
      colors: form.colors.filter(c => c.name).map((c, pos) => ({ ...c, position: pos })),
      sizes:  form.sizes.map((s, pos) => ({ ...s, position: pos })),
      specs:  form.specs.filter(sp => sp.key).map((sp, pos) => ({ ...sp, position: pos })),
    }

    const url    = productId ? `/api/products/${productId}` : '/api/products'
    const method = productId ? 'PUT' : 'POST'

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Save failed')
      return
    }

    router.push('/admin/products')
  }

  const inputStyle = {
    width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8,
    border: '1.5px solid var(--border)', fontSize: '0.9rem',
    fontFamily: 'var(--font-dm-sans)', boxSizing: 'border-box' as const,
    outline: 'none',
  }

  const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600 as const,
    color: 'var(--ink)', marginBottom: '0.375rem', textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '2rem' }}>
        {productId ? 'Edit Product' : 'New Product'}
      </h1>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '2rem' }}>

          {/* Basic Info */}
          <section style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.25rem' }}>Basic Info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} required value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Slug *</label>
                <input style={inputStyle} required value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="my-product-name" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Subtitle & Description</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {genMsg && (
                      <span style={{ fontSize: '0.72rem', color: genMsg.startsWith('✓') ? '#15803d' : '#b91c1c', fontWeight: 500 }}>
                        {genMsg}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={generating}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.4rem 0.875rem', borderRadius: 8,
                        border: '1.5px solid rgba(185,28,28,0.3)',
                        background: generating ? '#f5f4f1' : 'rgba(185,28,28,0.05)',
                        color: '#b91c1c', fontSize: '0.75rem', fontWeight: 700,
                        cursor: generating ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-dm-sans)', transition: 'all 0.15s',
                        opacity: generating ? 0.7 : 1,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                      {generating ? 'Generating…' : 'Generate with AI'}
                    </button>
                  </div>
                </div>
                <input style={{ ...inputStyle, marginBottom: '0.625rem' }} placeholder="Subtitle / tagline" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
                <textarea
                  rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Product description"
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">Select…</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Badge</label>
                <select style={inputStyle} value={form.badge} onChange={e => set('badge', e.target.value)}>
                  <option value="">None</option>
                  <option value="Sale">Sale</option>
                  <option value="New">New</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Price *</label>
                <input style={inputStyle} type="number" step="0.01" required value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Original Price</label>
                <input style={inputStyle} type="number" step="0.01" value={form.original_price} onChange={e => set('original_price', e.target.value)} placeholder="Leave blank if no sale" />
              </div>
              <div>
                <label style={labelStyle}>Material</label>
                <input style={inputStyle} value={form.material} onChange={e => set('material', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Fit</label>
                <input style={inputStyle} value={form.fit} onChange={e => set('fit', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Background Color</label>
                <input style={inputStyle} value={form.bg} onChange={e => set('bg', e.target.value)} placeholder="oklch(0.93 0.03 27)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <label htmlFor="featured" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Featured product</label>
              </div>
            </div>
          </section>

          {/* Images */}
          <section style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>Images</h2>
              <button type="button" onClick={() => set('images', [...form.images, { url: '', label: 'Image' }])}
                style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', background: '#f0ede8', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                + Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.images.map((img, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="https://… or upload →"
                      value={img.url}
                      onChange={e => {
                        const imgs = [...form.images]
                        imgs[i] = { ...imgs[i], url: e.target.value }
                        set('images', imgs)
                      }}
                    />
                    <label style={{ cursor: 'pointer', padding: '0.5rem 0.75rem', background: '#f0ede8', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {uploading ? '…' : 'Upload'}
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={async e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploading(true)
                          const url = await uploadImage(file)
                          const imgs = [...form.images]
                          imgs[i] = { ...imgs[i], url }
                          set('images', imgs)
                          setUploading(false)
                        }}
                      />
                    </label>
                  </div>
                  <input
                    style={inputStyle}
                    placeholder="Label"
                    value={img.label}
                    onChange={e => {
                      const imgs = [...form.images]
                      imgs[i] = { ...imgs[i], label: e.target.value }
                      set('images', imgs)
                    }}
                  />
                  <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                    style={{ padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Colors */}
          <section style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>Colors</h2>
              <button type="button" onClick={() => set('colors', [...form.colors, { name: '', hex: '#000000' }])}
                style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', background: '#f0ede8', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                + Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.colors.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Color name" value={c.name}
                    onChange={e => { const cs = [...form.colors]; cs[i] = { ...cs[i], name: e.target.value }; set('colors', cs) }} />
                  <input type="color" value={c.hex}
                    onChange={e => { const cs = [...form.colors]; cs[i] = { ...cs[i], hex: e.target.value }; set('colors', cs) }}
                    style={{ width: 44, height: 38, borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer', padding: 2 }} />
                  <button type="button" onClick={() => set('colors', form.colors.filter((_, j) => j !== i))}
                    style={{ padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Sizes */}
          <section style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>Sizes</h2>
              <button type="button" onClick={() => set('sizes', [...form.sizes, { size: '', available: true }])}
                style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', background: '#f0ede8', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                + Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {form.sizes.map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <input style={{ ...inputStyle, width: 70, textAlign: 'center' }} value={s.size}
                    onChange={e => { const ss = [...form.sizes]; ss[i] = { ...ss[i], size: e.target.value }; set('sizes', ss) }} />
                  <label style={{ fontSize: '0.7rem', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" checked={s.available}
                      onChange={e => { const ss = [...form.sizes]; ss[i] = { ...ss[i], available: e.target.checked }; set('sizes', ss) }} />
                    Avail.
                  </label>
                  <button type="button" onClick={() => set('sizes', form.sizes.filter((_, j) => j !== i))}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Specs */}
          <section style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>Specs</h2>
              <button type="button" onClick={() => set('specs', [...form.specs, { key: '', value: '' }])}
                style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', background: '#f0ede8', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                + Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {form.specs.map((sp, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Key" value={sp.key}
                    onChange={e => { const ss = [...form.specs]; ss[i] = { ...ss[i], key: e.target.value }; set('specs', ss) }} />
                  <input style={inputStyle} placeholder="Value" value={sp.value}
                    onChange={e => { const ss = [...form.specs]; ss[i] = { ...ss[i], value: e.target.value }; set('specs', ss) }} />
                  <button type="button" onClick={() => set('specs', form.specs.filter((_, j) => j !== i))}
                    style={{ padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.875rem 2rem', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : (productId ? 'Save Changes' : 'Create Product')}
            </button>
            <button type="button" onClick={() => router.push('/admin/products')} className="btn-outline" style={{ padding: '0.875rem 2rem' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
