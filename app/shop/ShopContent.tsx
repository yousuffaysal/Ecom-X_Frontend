'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard, { type ApiProduct } from '@/components/ProductCard'

type ApiCategory = { id: string; name: string; slug: string; description: string; product_count: number }

export default function ShopContent() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const initialCat   = searchParams.get('cat') || 'all'

  const [products, setProducts]   = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [sortBy, setSortBy]       = useState('created_at')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [filtersOpen, setFiltersOpen] = useState(true)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCategory !== 'all') params.set('cat', activeCategory)
    params.set('sort', sortBy)
    params.set('minPrice', String(priceRange[0]))
    params.set('maxPrice', String(priceRange[1]))

    fetch('/api/products?' + params.toString())
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || [])
        setLoading(false)
      })
  }, [activeCategory, sortBy, priceRange])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const setCategory = (cat: string) => {
    setActiveCategory(cat)
    if (cat === 'all') router.push('/shop', { scroll: false })
    else router.push('/shop?cat=' + cat, { scroll: false })
  }

  const S: Record<string, React.CSSProperties> = {
    page: { padding: '0 0 80px' },
    hero: { background: 'var(--offwhite)', borderBottom: '1.5px solid var(--border)', padding: '48px 48px 40px' },
    heroInner: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' },
    title: { fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em' },
    subtitle: { fontSize: '0.88rem', color: 'var(--ink-soft)', marginTop: 6 },
    catTabs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28 },
    catTab: { height: 36, padding: '0 18px', borderRadius: 2, border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', transition: 'all 0.18s', color: 'var(--ink-mid)' },
    catTabActive: { background: 'var(--red)', borderColor: 'var(--red)', color: 'white' },
    layout: { display: 'grid', gridTemplateColumns: filtersOpen ? '240px 1fr' : '1fr', gap: 0, padding: '0 48px', marginTop: 32 },
    sidebar: { paddingRight: 32, borderRight: '1.5px solid var(--border)' },
    main: { paddingLeft: filtersOpen ? 32 : 0 },
    sideTitle: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--ink-mid)', marginBottom: 14, marginTop: 24 },
    sideTitle1: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--ink-mid)', marginBottom: 14, marginTop: 0 },
    filterCatBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 3, cursor: 'pointer', fontSize: '0.85rem', background: 'none', border: 'none', transition: 'background 0.15s', textAlign: 'left' as const, color: 'var(--ink)', width: '100%', fontFamily: 'var(--font-dm-sans)' },
    sortRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    sortSelect: { height: 36, padding: '0 12px', border: '1.5px solid var(--border)', borderRadius: 3, fontSize: '0.82rem', outline: 'none', cursor: 'pointer', background: 'white', fontFamily: 'var(--font-dm-sans)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 },
    resultCount: { fontSize: '0.8rem', color: 'var(--ink-soft)' },
    toggleBtn: { height: 36, padding: '0 16px', border: '1.5px solid var(--border)', borderRadius: 3, background: 'white', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, transition: 'all 0.18s', fontFamily: 'var(--font-dm-sans)' },
    priceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ink-soft)', marginBottom: 8 },
    rangeInput: { width: '100%', accentColor: 'var(--red)', cursor: 'pointer' },
    noResults: { gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--ink-soft)' },
  }

  const catAll = [{ id: 'all', slug: 'all', name: 'All Products', description: '', product_count: products.length }, ...categories]

  return (
    <div style={S.page} className="page-enter">
      {/* HERO */}
      <div style={S.hero} className="rsp-px">
        <div style={S.heroInner}>
          <div>
            <div className="section-eyebrow">Redleaf Collection</div>
            <h1 style={S.title}>Shop All</h1>
            <div style={S.subtitle}>{loading ? '…' : `${products.length} pieces, crafted to last`}</div>
          </div>
          <button style={S.toggleBtn} onClick={() => setFiltersOpen(f => !f)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
            </svg>
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        <div style={S.catTabs}>
          {catAll.map(c => (
            <button
              key={c.slug}
              style={{ ...S.catTab, ...(activeCategory === c.slug ? S.catTabActive : {}) }}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
              {c.slug !== 'all' && (
                <span style={{ marginLeft: 6, opacity: 0.65, fontWeight: 400 }}>({c.product_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LAYOUT */}
      <div style={S.layout} className="rsp-px rsp-shop-layout">
        {filtersOpen && (
          <div style={S.sidebar} className="rsp-shop-sidebar">
            <div style={S.sideTitle1}>Category</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {catAll.map(c => (
                <button
                  key={c.slug}
                  style={{
                    ...S.filterCatBtn,
                    background: activeCategory === c.slug ? 'var(--red-light)' : 'transparent',
                    color: activeCategory === c.slug ? 'var(--red)' : 'var(--ink)',
                    fontWeight: activeCategory === c.slug ? 600 : 400,
                  }}
                  onClick={() => setCategory(c.slug)}
                >
                  <span>{c.name}</span>
                  <span style={{ fontSize: '0.72rem', color: activeCategory === c.slug ? 'var(--red)' : 'var(--ink-soft)' }}>
                    {c.product_count}
                  </span>
                </button>
              ))}
            </div>

            <div style={S.sideTitle}>Price Range</div>
            <div style={S.priceRow}>
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <input
              type="range" min="0" max="500" step="10"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              style={S.rangeInput}
            />

            <div style={S.sideTitle}>Sort By</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { v: 'created_at', l: 'Featured' },
                { v: 'newest',     l: 'Newest First' },
                { v: 'price_asc',  l: 'Price: Low to High' },
                { v: 'price_desc', l: 'Price: High to Low' },
                { v: 'rating',     l: 'Top Rated' },
              ].map(o => (
                <button
                  key={o.v}
                  style={{
                    ...S.filterCatBtn,
                    background: sortBy === o.v ? 'var(--red-light)' : 'transparent',
                    color: sortBy === o.v ? 'var(--red)' : 'var(--ink)',
                    fontWeight: sortBy === o.v ? 600 : 400,
                  }}
                  onClick={() => setSortBy(o.v)}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GRID */}
        <div style={S.main} className="rsp-shop-main">
          <div style={S.sortRow}>
            <div style={S.resultCount}>{loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}</div>
            <select style={S.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="created_at">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div style={S.grid} className="rsp-3col">
            {loading ? (
              <div style={S.noResults}><div style={{ fontSize: '1.5rem', marginBottom: 12 }}>⋯</div>Loading products…</div>
            ) : products.length === 0 ? (
              <div style={S.noResults}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>∅</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No products found</div>
                <div style={{ fontSize: '0.85rem' }}>Try adjusting your filters</div>
              </div>
            ) : (
              products.map(p => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
