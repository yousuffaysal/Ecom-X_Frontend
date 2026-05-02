'use client'

import { useState, useEffect, useRef } from 'react'

type Banner = {
  id?: string
  slot: 1 | 2 | 3
  title: string
  subtitle: string
  link_url: string
  image_url: string
  is_active: boolean
}

const SLOT_INFO = [
  {
    slot: 1 as const,
    label: 'Main Banner',
    description: 'Large hero panel — left side',
    ratio: '7 : 5',
    recommended: '1400 × 1000 px',
    aspect: 'aspect: 1.4 / 1',
    gridStyle: { gridColumn: 'span 2' },
    previewH: 220,
  },
  {
    slot: 2 as const,
    label: 'Secondary — Top',
    description: 'Right column, upper panel',
    ratio: '16 : 7',
    recommended: '1200 × 530 px',
    aspect: 'aspect: 2.3 / 1',
    gridStyle: {},
    previewH: 100,
  },
  {
    slot: 3 as const,
    label: 'Secondary — Bottom',
    description: 'Right column, lower panel',
    ratio: '16 : 7',
    recommended: '1200 × 530 px',
    aspect: 'aspect: 2.3 / 1',
    gridStyle: {},
    previewH: 100,
  },
]

const EMPTY: Omit<Banner, 'slot'> = {
  title: '', subtitle: '', link_url: '/shop', image_url: '', is_active: true,
}

export default function MarketingPage() {
  const [banners, setBanners] = useState<Record<number, Banner>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch('/api/admin/marketing')
      .then(r => r.json())
      .then(d => {
        const map: Record<number, Banner> = {}
        for (const b of d.banners || []) map[b.slot] = b
        setBanners(map)
      })
  }, [])

  function getBanner(slot: 1 | 2 | 3): Banner {
    return banners[slot] ?? { slot, ...EMPTY }
  }

  function update(slot: 1 | 2 | 3, field: keyof Omit<Banner, 'slot'>, value: string | boolean) {
    setBanners(prev => ({
      ...prev,
      [slot]: { ...getBanner(slot), [field]: value },
    }))
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function uploadImage(slot: 1 | 2 | 3, file: File) {
    setUploading(p => ({ ...p, [slot]: true }))
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      update(slot, 'image_url', url)
      showToast('Image uploaded')
    } catch {
      showToast('Upload failed', false)
    } finally {
      setUploading(p => ({ ...p, [slot]: false }))
    }
  }

  async function saveBanner(slot: 1 | 2 | 3) {
    const b = getBanner(slot)
    setSaving(p => ({ ...p, [slot]: true }))
    try {
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...b, slot }),
      })
      if (!res.ok) throw new Error()
      const { banner } = await res.json()
      setBanners(prev => ({ ...prev, [slot]: banner }))
      showToast(`Slot ${slot} saved`)
    } catch {
      showToast('Save failed', false)
    } finally {
      setSaving(p => ({ ...p, [slot]: false }))
    }
  }

  async function clearBanner(slot: 1 | 2 | 3) {
    const b = getBanner(slot)
    if (!b.id) { update(slot, 'image_url', ''); return }
    if (!confirm('Remove this banner image?')) return
    try {
      await fetch(`/api/admin/marketing/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: '' }),
      })
      setBanners(prev => ({ ...prev, [slot]: { ...b, image_url: '' } }))
      showToast('Image removed')
    } catch {
      showToast('Failed', false)
    }
  }

  const imgPlaceholder = (hue = 27, sat = 0.04) => ({
    background: `repeating-linear-gradient(45deg,
      oklch(0.88 ${sat} ${hue}) 0px, oklch(0.88 ${sat} ${hue}) 1px,
      oklch(0.92 ${sat * 0.6} ${hue}) 1px, oklch(0.92 ${sat * 0.6} ${hue}) 14px)`,
  })

  const placeholderHues = [27, 220, 150]

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b91c1c', marginBottom: 8 }}>
          Admin › Marketing
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em', margin: 0 }}>
          Marketing Banners
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 6, lineHeight: 1.6 }}>
          Manage the three image slots in the homepage lookbook section. Changes go live immediately once saved.
        </p>
      </div>

      {/* Layout preview diagram */}
      <div style={{ background: 'white', border: '1px solid #e5e3df', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.875rem' }}>
          Section Layout
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8, height: 140 }}>
          <div style={{ borderRadius: 6, border: '2px solid #b91c1c', background: 'rgba(185,28,28,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Slot 1</span>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Main Banner · 7:5</span>
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8 }}>
            {[2, 3].map(s => (
              <div key={s} style={{ borderRadius: 6, border: '1.5px solid #d1d5db', background: '#f9f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Slot {s}</span>
                <span style={{ fontSize: '0.62rem', color: '#9ca3af' }}>Secondary · 16:7</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slot cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SLOT_INFO.map((info, idx) => {
          const b = getBanner(info.slot)
          const hue = placeholderHues[idx]

          return (
            <div key={info.slot} style={{ background: 'white', border: '1px solid #e5e3df', borderRadius: 12, overflow: 'hidden' }}>
              {/* Slot header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #f0ede9', background: '#fafaf8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: info.slot === 1 ? '#fee2e2' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: info.slot === 1 ? '#b91c1c' : '#374151' }}>
                    {info.slot}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a18' }}>{info.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{info.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', letterSpacing: '0.06em' }}>
                    Recommended: <strong style={{ color: '#374151' }}>{info.recommended}</strong> &nbsp;·&nbsp; Ratio: <strong style={{ color: '#374151' }}>{info.ratio}</strong>
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginLeft: 8 }}>
                    <div
                      onClick={() => update(info.slot, 'is_active', !b.is_active)}
                      style={{
                        width: 36, height: 20, borderRadius: 10,
                        background: b.is_active ? '#b91c1c' : '#d1d5db',
                        position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3, left: b.is_active ? 19 : 3,
                        width: 14, height: 14, borderRadius: '50%', background: 'white',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: b.is_active ? '#b91c1c' : '#9ca3af' }}>
                      {b.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Slot body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', padding: '1.5rem' }}>
                {/* Image upload */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>
                    Banner Image
                  </div>

                  {/* Preview */}
                  <div
                    style={{
                      position: 'relative', borderRadius: 8, overflow: 'hidden',
                      height: info.previewH,
                      cursor: 'pointer',
                      border: '2px dashed #e5e3df',
                      ...(b.image_url
                        ? { backgroundImage: `url(${b.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' }
                        : imgPlaceholder(hue, 0.03)),
                    }}
                    onClick={() => fileRefs.current[info.slot]?.click()}
                  >
                    {uploading[info.slot] ? (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      </div>
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: b.image_url ? 'rgba(0,0,0,0)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
                        onMouseLeave={e => (e.currentTarget.style.background = b.image_url ? 'rgba(0,0,0,0)' : 'transparent')}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ opacity: b.image_url ? 0 : 0.4 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        {!b.image_url && <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Click to upload</span>}
                      </div>
                    )}
                  </div>

                  <input
                    ref={el => { fileRefs.current[info.slot] = el }}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(info.slot, f); e.target.value = '' }}
                  />

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => fileRefs.current[info.slot]?.click()}
                      disabled={uploading[info.slot]}
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid #e5e3df', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#374151', fontFamily: 'var(--font-dm-sans)', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#b91c1c')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e3df')}
                    >
                      {uploading[info.slot] ? 'Uploading…' : b.image_url ? 'Replace' : 'Upload'}
                    </button>
                    {b.image_url && (
                      <button
                        onClick={() => clearBanner(info.slot)}
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid #fee2e2', borderRadius: 8, background: '#fff5f5', cursor: 'pointer', color: '#b91c1c', fontFamily: 'var(--font-dm-sans)' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ marginTop: 8, padding: '0.625rem 0.75rem', background: '#f9f8f6', borderRadius: 6, border: '1px solid #f0ede9' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Image Specs</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.6 }}>
                      Recommended: <strong style={{ color: '#374151' }}>{info.recommended}</strong><br />
                      Aspect ratio: <strong style={{ color: '#374151' }}>{info.ratio}</strong><br />
                      Format: JPG or WebP, max 5 MB
                    </div>
                  </div>
                </div>

                {/* Text fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={e => update(info.slot, 'title', e.target.value)}
                      placeholder={info.slot === 1 ? 'The Ember Field Jacket' : 'The Ridge Knit'}
                      style={{ width: '100%', height: 42, border: '1.5px solid #e5e3df', borderRadius: 8, padding: '0 12px', fontSize: '0.88rem', fontFamily: 'var(--font-dm-sans)', outline: 'none', color: '#1a1a18', background: 'white', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#b91c1c')}
                      onBlur={e => (e.target.style.borderColor = '#e5e3df')}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                      Subtitle / Caption
                    </label>
                    <input
                      type="text"
                      value={b.subtitle}
                      onChange={e => update(info.slot, 'subtitle', e.target.value)}
                      placeholder={info.slot === 1 ? '$298 — Available in 3 colours' : '$188 — Heritage texture'}
                      style={{ width: '100%', height: 42, border: '1.5px solid #e5e3df', borderRadius: 8, padding: '0 12px', fontSize: '0.88rem', fontFamily: 'var(--font-dm-sans)', outline: 'none', color: '#1a1a18', background: 'white', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#b91c1c')}
                      onBlur={e => (e.target.style.borderColor = '#e5e3df')}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                      Link URL
                    </label>
                    <input
                      type="text"
                      value={b.link_url}
                      onChange={e => update(info.slot, 'link_url', e.target.value)}
                      placeholder="/shop"
                      style={{ width: '100%', height: 42, border: '1.5px solid #e5e3df', borderRadius: 8, padding: '0 12px', fontSize: '0.88rem', fontFamily: 'var(--font-dm-sans)', outline: 'none', color: '#1a1a18', background: 'white', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#b91c1c')}
                      onBlur={e => (e.target.style.borderColor = '#e5e3df')}
                    />
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 4 }}>Internal path (e.g. /shop) or full URL</div>
                  </div>

                  {/* Live preview of overlay text */}
                  {(b.title || b.subtitle) && (
                    <div style={{ padding: '0.75rem 1rem', background: 'oklch(0.1 0.01 30)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                        {info.slot === 1 ? 'Featured Style' : 'Preview'}
                      </div>
                      {b.title && <div style={{ fontFamily: 'var(--font-playfair)', fontSize: info.slot === 1 ? '1rem' : '0.88rem', fontWeight: 700, color: 'white' }}>{b.title}</div>}
                      {b.subtitle && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{b.subtitle}</div>}
                    </div>
                  )}

                  <button
                    onClick={() => saveBanner(info.slot)}
                    disabled={saving[info.slot]}
                    style={{
                      marginTop: 'auto', padding: '0.7rem 1.25rem', borderRadius: 8, border: 'none',
                      background: saving[info.slot] ? '#9ca3af' : '#b91c1c', color: 'white',
                      fontSize: '0.85rem', fontWeight: 700, cursor: saving[info.slot] ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-dm-sans)', transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { if (!saving[info.slot]) (e.currentTarget.style.opacity = '0.85') }}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {saving[info.slot] ? 'Saving…' : 'Save Slot ' + info.slot}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.ok ? '#1a1a18' : '#b91c1c',
          color: 'white', padding: '0.75rem 1.25rem', borderRadius: 10,
          fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'fadeSlideUp 0.25s ease',
        }}>
          {toast.ok
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          }
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
