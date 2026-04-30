'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'
import { useAuth } from '@/lib/AuthContext'
import ProductCard, { type ApiProduct } from '@/components/ProductCard'
import Stars from '@/components/Stars'

type ApiReview = {
  id: string; user_name: string; rating: number; title: string; body: string
  verified: boolean; created_at: string
}

type ReviewSummary = {
  summary: string; pros: string[]; cons: string[]
  fit: string | null; who_for: string
  review_count: number; generated_at: string
}

type FullProduct = ApiProduct & {
  description: string; material: string; fit: string
  category_name: string; category_slug: string
  original_price: number | null
  review_summary: ReviewSummary | null
  specs: { key: string; value: string }[]
  sizes: { size: string; available: boolean }[]
  colors: { name: string; hex: string }[]
  images: { url: string; label: string }[]
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct]   = useState<FullProduct | null>(null)
  const [related, setRelated]   = useState<ApiProduct[]>([])
  const [reviews, setReviews]   = useState<ApiReview[]>([])
  const [loading, setLoading]   = useState(true)

  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null)
  const [selectedSize, setSelectedSize]   = useState<string | null>(null)
  const [qty, setQty]           = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)
  const [wished, setWished]     = useState(false)
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  const [variantError, setVariantError] = useState('')

  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError, setReviewError]   = useState('')

  useEffect(() => {
    setLoading(true)
    setActiveThumb(0)

    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        const p = d.product as FullProduct
        if (!p) return
        setProduct(p)
        setSelectedColor(p.colors?.[0] || null)
        const firstAvail = p.sizes?.find(s => s.available)
        setSelectedSize(firstAvail?.size || p.sizes?.[0]?.size || null)

        if (p.category_slug) {
          fetch(`/api/products?cat=${p.category_slug}&limit=5`)
            .then(r => r.json())
            .then(d2 => setRelated((d2.products || []).filter((rp: ApiProduct) => rp.id !== p.id).slice(0, 4)))
        }
        return fetch(`/api/products/${id}/reviews`)
      })
      .then(r => r?.json())
      .then(d => { if (d?.reviews) setReviews(d.reviews) })
      .finally(() => setLoading(false))
  }, [id])

  async function toggleWishlist() {
    if (!user) { router.push('/auth/login'); return }
    if (!product) return
    if (wished) {
      await fetch(`/api/wishlist?product_id=${product.id}`, { method: 'DELETE' })
    } else {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      })
    }
    setWished(w => !w)
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    setReviewSaving(true)
    setReviewError('')

    const res = await fetch(`/api/products/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm),
    })

    setReviewSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setReviewError(d.error || 'Failed to submit review')
      return
    }

    const updated = await fetch(`/api/products/${id}/reviews`).then(r => r.json())
    setReviews(updated.reviews || [])
    setReviewForm({ rating: 5, title: '', body: '' })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        Loading…
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>∅</div>
        <p style={{ color: 'var(--muted)' }}>Product not found</p>
        <button className="btn-primary" onClick={() => router.push('/shop')}>Back to Shop</button>
      </div>
    )
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  const images = product.images?.length
    ? product.images
    : [{ url: '', label: 'Front' }, { url: '', label: 'Back' }, { url: '', label: 'Detail' }]

  const specsObj: Record<string, string> = {}
  if (product.specs) product.specs.forEach(s => { specsObj[s.key] = s.value })

  const accordionItems = [
    { title: 'Shipping & Delivery', body: 'Free standard shipping on orders over $150. Express 2-day delivery available at checkout. Orders ship within 1 business day. We ship worldwide.' },
    { title: 'Returns & Exchanges', body: 'Hassle-free returns within 30 days of delivery. Items must be unworn and in original packaging. A free prepaid return label is included with every order.' },
    { title: 'Care Instructions', body: specsObj['Care'] || 'See garment label for care instructions. When in doubt, hand wash in cold water and lay flat to dry.' },
  ]

  const S: Record<string, React.CSSProperties> = {
    page: { padding: '24px 48px 80px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 24, alignItems: 'start' },
    galleryCol: { display: 'flex', flexDirection: 'column', gap: 14 },
    mainImg: { flex: 1, borderRadius: 4, overflow: 'hidden', background: product.bg || 'oklch(0.93 0.03 27)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    thumbsRow: { display: 'flex', gap: 10 },
    thumb: { width: 70, height: 70, borderRadius: 3, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: '2px solid transparent', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--red)' },
    detailsCol: { paddingBottom: 40 },
    cat: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 },
    name: { fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 8 },
    sub: { fontSize: '1rem', color: 'var(--ink-mid)', marginBottom: 20 },
    stars: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 },
    price: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 },
    priceMain: { fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' },
    priceOld: { fontSize: '1.1rem', color: 'var(--ink-soft)', textDecoration: 'line-through' },
    badge: { fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 2, background: 'var(--red)', color: 'white' },
    section: { marginBottom: 28, paddingBottom: 28, borderBottom: '1.5px solid var(--border)' },
    sectionLabel: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mid)', marginBottom: 12 },
    colorSwatches: { display: 'flex', gap: 10 },
    swatch: { width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.2s' },
    sizeGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    sizeBtn: { height: 38, minWidth: 48, padding: '0 12px', border: '1.5px solid var(--border)', borderRadius: 3, background: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s', fontFamily: 'var(--font-dm-sans)' },
    qtyRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 },
    qtyBtn: { width: 36, height: 36, border: '1.5px solid var(--border)', borderRadius: 3, background: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-sans)' },
    ctaRow: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 16 },
    wishBtn: { width: 48, height: 48, border: '1.5px solid var(--border)', borderRadius: 3, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', transition: 'all 0.2s', fontFamily: 'var(--font-dm-sans)' },
    trust: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 24 },
    trustItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' },
    specGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' },
    specRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' },
    accordion: { borderBottom: '1px solid var(--border)' },
    accordionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' },
    reviewCard: { background: 'var(--offwhite)', borderRadius: 4, padding: '20px', marginBottom: 16 },
    relatedSection: { padding: '60px 48px', borderTop: '1.5px solid var(--border)', background: 'var(--offwhite)' },
    relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginTop: 32 },
  }

  return (
    <div className="page-enter">
      <div style={S.page} className="rsp-px">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button className="breadcrumb-link" onClick={() => router.push('/')}>Home</button>
          <span className="breadcrumb-sep">›</span>
          <button className="breadcrumb-link" onClick={() => router.push('/shop')}>Shop</button>
          <span className="breadcrumb-sep">›</span>
          {product.category_name && (
            <>
              <button className="breadcrumb-link" onClick={() => router.push('/shop?cat=' + product.category_slug)}>{product.category_name}</button>
              <span className="breadcrumb-sep">›</span>
            </>
          )}
          <span>{product.name}</span>
        </div>

        <div style={S.layout} className="rsp-2col">
          {/* Gallery */}
          <div style={S.galleryCol}>
            <div style={S.mainImg}>
              {images[activeThumb]?.url ? (
                <img
                  src={images[activeThumb].url}
                  alt={images[activeThumb].label || product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: `repeating-linear-gradient(45deg, ${product.bg||'oklch(0.93 0.03 27)'} 0px, ${product.bg||'oklch(0.93 0.03 27)'} 1px, oklch(0.97 0.01 27) 1px, oklch(0.97 0.01 27) 14px)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ background: 'white', padding: '7px 16px', borderRadius: 2, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--red)', fontWeight: 700 }}>
                    {images[activeThumb]?.label || 'Product Image'}
                  </div>
                </div>
              )}
            </div>
            <div style={S.thumbsRow}>
              {images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    ...S.thumb,
                    background: img.url ? `url(${img.url}) center/cover` : (product.bg || 'oklch(0.93 0.03 27)'),
                    borderColor: i === activeThumb ? 'var(--red)' : 'transparent',
                  }}
                  onClick={() => setActiveThumb(i)}
                >
                  {!img.url && (img.label || `${i + 1}`)}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div style={S.detailsCol}>
            <div style={S.cat}>{product.category_name || 'Collection'}</div>
            <h1 style={S.name}>{product.name}</h1>
            <div style={S.sub}>{product.subtitle}</div>

            <div style={S.stars}>
              <Stars rating={product.rating} />
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-mid)' }}>
                {Number(product.rating).toFixed(1)} ({product.review_count} review{product.review_count !== 1 ? 's' : ''})
              </span>
            </div>

            <div style={S.price}>
              <span style={S.priceMain}>${Number(product.price).toFixed(2)}</span>
              {product.original_price && (
                <>
                  <span style={S.priceOld}>${Number(product.original_price).toFixed(2)}</span>
                  <span style={S.badge}>−{discount}%</span>
                </>
              )}
            </div>

            {/* Color */}
            {product.colors?.length > 0 && (
              <div style={S.section}>
                <div style={S.sectionLabel}>
                  Colour — <span style={{ color: 'var(--ink)', fontWeight: 500, textTransform: 'none' }}>{selectedColor?.name || '—'}</span>
                </div>
                <div style={S.colorSwatches}>
                  {product.colors.map(c => (
                    <div
                      key={c.name}
                      title={c.name}
                      style={{
                        ...S.swatch,
                        background: c.hex,
                        borderColor: selectedColor?.name === c.name ? 'var(--ink)' : 'transparent',
                        outline: selectedColor?.name === c.name ? '2px solid var(--ink)' : '2px solid transparent',
                        outlineOffset: 2,
                      }}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={S.section}>
                <div style={S.sectionLabel}>Size — <span style={{ color: 'var(--ink)', fontWeight: 500, textTransform: 'none' }}>{selectedSize || '—'}</span></div>
                <div style={S.sizeGrid}>
                  {product.sizes.map(s => (
                    <button
                      key={s.size}
                      disabled={!s.available}
                      style={{
                        ...S.sizeBtn,
                        borderColor: selectedSize === s.size ? 'var(--ink)' : 'var(--border)',
                        background: selectedSize === s.size ? 'var(--ink)' : 'white',
                        color: !s.available ? 'var(--border)' : selectedSize === s.size ? 'white' : 'var(--ink)',
                        textDecoration: !s.available ? 'line-through' : 'none',
                        cursor: !s.available ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => s.available && setSelectedSize(s.size)}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div style={S.section}>
              <div style={S.sectionLabel}>Quantity</div>
              <div style={S.qtyRow}>
                <button style={S.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button style={S.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              {variantError && (
                <div style={{ marginBottom: 10, padding: '0.6rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500 }}>
                  {variantError}
                </div>
              )}
              <div style={S.ctaRow}>
                <button
                  className="btn-primary"
                  style={{ height: 52, fontSize: '0.85rem' }}
                  onClick={() => {
                    if (product.colors?.length > 0 && !selectedColor) {
                      setVariantError('Please select a colour')
                      return
                    }
                    if (product.sizes?.length > 0 && !selectedSize) {
                      setVariantError('Please select a size')
                      return
                    }
                    setVariantError('')
                    addToCart({
                      id: product.slug, name: product.name, price: product.price,
                      qty, bg: product.bg || 'oklch(0.93 0.03 27)',
                      selectedColor: selectedColor?.name, selectedSize: selectedSize || undefined,
                    })
                  }}
                >
                  Add to Cart — ${(product.price * qty).toFixed(2)}
                </button>
                <button
                  style={{
                    ...S.wishBtn,
                    color: wished ? 'var(--red)' : 'var(--ink)',
                    background: wished ? 'var(--red-light)' : 'white',
                  }}
                  onClick={toggleWishlist}
                  title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wished ? '♥' : '♡'}
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div style={S.trust}>
              {[
                { icon: '⟳', label: 'Free Returns', sub: '30-day hassle-free' },
                { icon: '◎', label: 'Free Shipping', sub: 'On orders over $150' },
                { icon: '✦', label: '2yr Warranty', sub: 'Guaranteed quality' },
              ].map(t => (
                <div key={t.label} style={S.trustItem}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--red)' }}>{t.icon}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink)' }}>{t.label}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--ink-soft)' }}>{t.sub}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ ...S.section, paddingBottom: 20 }}>
              <div style={S.sectionLabel}>About This Piece</div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--ink-mid)' }}>{product.description}</p>
              {(product.material || product.fit) && (
                <div style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                  {product.material && <span>Material: {product.material}. </span>}
                  {product.fit && <span>Fit: {product.fit}.</span>}
                </div>
              )}
            </div>

            {/* Specs */}
            {product.specs?.length > 0 && (
              <div style={{ ...S.section, paddingBottom: 20 }}>
                <div style={S.sectionLabel}>Specifications</div>
                <div style={S.specGrid}>
                  {product.specs.map(s => (
                    <div key={s.key} style={S.specRow}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{s.key}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accordion */}
            <div>
              {accordionItems.map((item, i) => (
                <div key={i} style={S.accordion}>
                  <button style={S.accordionHead} onClick={() => setOpenAccordion(openAccordion === i ? null : i)}>
                    {item.title}
                    <span style={{ fontSize: '1.1rem', color: 'var(--red)', fontWeight: 400 }}>{openAccordion === i ? '−' : '+'}</span>
                  </button>
                  {openAccordion === i && (
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--ink-mid)', paddingBottom: 16 }}>
                      {item.body}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Review Insights */}
            {product.review_summary && (
              <div style={{ marginTop: 40, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e5e2dc' }}>
                {/* Header */}
                <div style={{ background: '#0f0e0d', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(185,28,28,0.2)', border: '1px solid rgba(185,28,28,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'white', lineHeight: 1.2 }}>AI Review Insights</div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                        Based on {product.review_summary.review_count} verified reviews
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                    AI-generated · {new Date(product.review_summary.generated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ height: 3, background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #f87171 100%)' }} />

                {/* Body */}
                <div style={{ padding: '1.25rem', background: '#faf9f7' }}>
                  {/* Summary sentence */}
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#1a1a1a', fontStyle: 'italic', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e5e2dc' }}>
                    &ldquo;{product.review_summary.summary}&rdquo;
                  </p>

                  {/* Pros / Cons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: product.review_summary.fit || product.review_summary.who_for ? '1.25rem' : 0 }}>
                    {product.review_summary.pros.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#15803d', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#dcfce7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#15803d' }}>✓</span>
                          What customers love
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {product.review_summary.pros.map((p, i) => (
                            <li key={i} style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.5, display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                              <span style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }}>•</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.review_summary.cons.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b45309', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#fef3c7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#b45309' }}>!</span>
                          A few caveats
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {product.review_summary.cons.map((c, i) => (
                            <li key={i} style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.5, display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                              <span style={{ color: '#d97706', marginTop: 2, flexShrink: 0 }}>•</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Fit + Who For */}
                  {(product.review_summary.fit || product.review_summary.who_for) && (
                    <div style={{ display: 'grid', gridTemplateColumns: product.review_summary.fit && product.review_summary.who_for ? '1fr 1fr' : '1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e5e2dc' }}>
                      {product.review_summary.fit && (
                        <div style={{ background: 'white', borderRadius: 8, padding: '0.75rem', border: '1px solid #e5e2dc' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.3rem' }}>◎ Fit & Sizing</div>
                          <p style={{ fontSize: '0.78rem', color: '#1a1a1a', lineHeight: 1.5, margin: 0 }}>{product.review_summary.fit}</p>
                        </div>
                      )}
                      {product.review_summary.who_for && (
                        <div style={{ background: 'white', borderRadius: 8, padding: '0.75rem', border: '1px solid #e5e2dc' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.3rem' }}>◈ Best For</div>
                          <p style={{ fontSize: '0.78rem', color: '#1a1a1a', lineHeight: 1.5, margin: 0 }}>{product.review_summary.who_for}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Reviews ({product.review_count})
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Stars rating={product.rating} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{Number(product.rating).toFixed(1)}</span>
                </div>
              </div>

              {reviews.map(r => (
                <div key={r.id} style={S.reviewCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.user_name}</span>
                        {r.verified && (
                          <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>✓ Verified</span>
                        )}
                      </div>
                      <Stars rating={r.rating} size="0.7rem" />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {r.title && <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>{r.title}</div>}
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--ink-mid)', margin: 0 }}>{r.body}</p>
                </div>
              ))}

              {/* Leave a review */}
              {user && (
                <div style={{ background: 'var(--offwhite)', borderRadius: 4, padding: '20px', marginTop: 16 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>Leave a Review</h3>
                  {reviewError && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>
                      {reviewError}
                    </div>
                  )}
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Rating</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n} type="button"
                            onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                            style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: n <= reviewForm.rating ? '#f59e0b' : '#d1d5db' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Title</label>
                      <input
                        value={reviewForm.title}
                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Sum up your experience"
                        style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: '0.875rem', fontFamily: 'var(--font-dm-sans)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Review</label>
                      <textarea
                        rows={4} value={reviewForm.body}
                        onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                        placeholder="Tell others about your experience"
                        style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: '0.875rem', fontFamily: 'var(--font-dm-sans)', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>
                    <button type="submit" disabled={reviewSaving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.625rem 1.5rem', opacity: reviewSaving ? 0.7 : 1 }}>
                      {reviewSaving ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {!user && (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--offwhite)', borderRadius: 8, marginTop: 16 }}>
                  <button onClick={() => router.push('/auth/login')} style={{ color: 'var(--red)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Sign in to leave a review →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={S.relatedSection} className="rsp-px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <div className="section-eyebrow">You May Also Like</div>
              <div className="section-title">Complete the Look</div>
            </div>
            <button className="btn-ghost" onClick={() => router.push('/shop')}>View All →</button>
          </div>
          <div style={S.relatedGrid} className="rsp-4col">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
