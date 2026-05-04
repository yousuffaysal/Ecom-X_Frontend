'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard, { type ApiProduct } from '@/components/ProductCard'
import Stars from '@/components/Stars'
import { testimonials } from '@/lib/data'
import VideoHero from '@/components/VideoHero'
import Counter from '@/components/Counter'
import { motion, useInView } from 'framer-motion'

function FadeIn({ children, delay = 0, y = 30, className = '', style = {}, duration = 1.2 }: { children: React.ReactNode, delay?: number, y?: number, className?: string, style?: React.CSSProperties, duration?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

const USER_MSG = "I need an outfit for a winter wedding — elegant but not too formal."
const ARIA_MSG = "Perfect for a winter wedding. I'd suggest the Ember Field Jacket layered over slim tailoring — the wool construction keeps it warm without losing elegance. Here are my top picks:"

function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const [userText, setUserText]       = useState('')
  const [userDone, setUserDone]       = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [ariaText, setAriaText]       = useState('')
  const [ariaDone, setAriaDone]       = useState(false)
  const [showCards, setShowCards]     = useState(false)

  useEffect(() => {
    if (!inView) return

    let timeout: ReturnType<typeof setTimeout>
    let interval: ReturnType<typeof setInterval>

    const typeAria = () => {
      let i = 0
      interval = setInterval(() => {
        i++
        setAriaText(ARIA_MSG.slice(0, i))
        if (i >= ARIA_MSG.length) {
          clearInterval(interval)
          setAriaDone(true)
          timeout = setTimeout(() => setShowCards(true), 400)
        }
      }, 22)
    }

    const showThink = () => {
      setShowThinking(true)
      timeout = setTimeout(() => {
        setShowThinking(false)
        timeout = setTimeout(typeAria, 180)
      }, 1100)
    }

    const typeUser = () => {
      let i = 0
      interval = setInterval(() => {
        i++
        setUserText(USER_MSG.slice(0, i))
        if (i >= USER_MSG.length) {
          clearInterval(interval)
          setUserDone(true)
          timeout = setTimeout(showThink, 450)
        }
      }, 36)
    }

    timeout = setTimeout(typeUser, 600)

    return () => { clearTimeout(timeout); clearInterval(interval) }
  }, [inView])

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* User bubble */}
      {userText && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.85)', padding: '0.9rem 1.25rem', borderRadius: '18px 4px 18px 18px', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '82%' }}>
            {userText}{!userDone && <span className="typing-cursor" />}
          </div>
        </div>
      )}

      {/* Thinking dots */}
      {showThinking && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#b91c1c" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          </div>
          <div style={{ background: '#222220', padding: '0.9rem 1.1rem', borderRadius: '4px 18px 18px 18px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#b91c1c' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Aria bubble */}
      {ariaText && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#b91c1c" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          </div>
          <div style={{ background: '#222220', color: 'rgba(255,255,255,0.78)', padding: '0.9rem 1.1rem', borderRadius: '4px 18px 18px 18px', fontSize: '0.92rem', lineHeight: 1.65, maxWidth: '85%', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>Aria · Style Advisor</div>
            {ariaText}{!ariaDone && <span className="typing-cursor" />}
          </div>
        </div>
      )}

      {/* Product cards */}
      {showCards && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingLeft: '2.75rem' }}
        >
          {[
            { name: 'Ember Field Jacket', price: '$298', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80' },
            { name: 'Ridge Knit', price: '$188', img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=500&q=80' },
          ].map(p => (
            <div key={p.name} style={{ background: '#1e1e1c', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ height: 96, overflow: 'hidden' }}>
                <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '0.625rem 0.75rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '0.15rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(185,28,28,0.85)', fontWeight: 700 }}>{p.price}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

type ApiCategory = { id: string; name: string; slug: string; description: string; image_url: string }
type MarketingBanner = { id: string; slot: 1 | 2 | 3; title: string; subtitle: string; link_url: string; image_url: string }

export default function HomePage() {
  const router = useRouter()
  const [featured, setFeatured]   = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [marketingBanners, setMarketingBanners] = useState<Record<number, MarketingBanner>>({})

  useEffect(() => {
    fetch('/api/products?featured=true&limit=4').then(r => r.json()).then(d => setFeatured(d.products || []))
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/marketing').then(r => r.json()).then(d => {
      const map: Record<number, MarketingBanner> = {}
      for (const b of d.banners || []) map[b.slot] = b
      setMarketingBanners(map)
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  const S: Record<string, React.CSSProperties> = {
    hero: {
      minHeight: 'calc(100vh - 68px)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      position: 'relative',
      overflow: 'hidden',
    },
    heroLeft: {
      padding: '80px 48px 80px 48px',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      position: 'relative', zIndex: 2,
    },
    heroEyebrow: {
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.22em',
      textTransform: 'uppercase', color: 'var(--red)',
      marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
    },
    heroLine: { width: 40, height: 1.5, background: 'var(--red)', display: 'inline-block' },
    heroTitle: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
      fontWeight: 900, lineHeight: 1.0,
      letterSpacing: '-0.03em', color: 'var(--ink)',
      marginBottom: 28,
    },
    heroTitleRed: { color: 'var(--red)', fontStyle: 'italic' },
    heroDesc: {
      fontSize: '1rem', lineHeight: 1.7, color: 'var(--ink-mid)',
      maxWidth: 420, marginBottom: 40,
    },
    heroBtns: { display: 'flex', gap: 14, flexWrap: 'wrap' },
    heroRight: {
      background: 'var(--red-light)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    heroPlaceholder: {
      width: '100%', height: '100%',
      background: `repeating-linear-gradient(45deg,
        oklch(0.92 0.04 27) 0px, oklch(0.92 0.04 27) 1px,
        oklch(0.95 0.03 27) 1px, oklch(0.95 0.03 27) 14px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
    },
    heroImgLabel: {
      background: 'white', padding: '8px 18px', borderRadius: 2,
      fontSize: '0.65rem', textTransform: 'uppercase',
      letterSpacing: '0.14em', color: 'var(--red)', fontWeight: 700,
    },
    heroBadge: {
      position: 'absolute', bottom: 40, left: 40,
      background: 'var(--red)', color: 'white',
      padding: '20px 24px', borderRadius: 3,
    },
    heroBadgeNum: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '2rem', fontWeight: 900, lineHeight: 1,
    },
    heroBadgeLbl: { fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85, marginTop: 4 },
    scrollHint: {
      position: 'absolute', bottom: 40, left: 48,
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--ink-soft)',
    },
    scrollLine: {
      width: 1, height: 40, background: 'var(--ink-soft)',
      animation: 'scrollPulse 2s ease infinite',
    },
    catsSection: { padding: '80px 48px', borderBottom: '1.5px solid var(--border)' },
    catsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 40 },
    catCard: {
      position: 'relative', cursor: 'pointer', borderRadius: 4, overflow: 'hidden',
      height: 280, display: 'flex', alignItems: 'flex-end',
      transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    },
    catOverlay: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to top, oklch(0.1 0.01 30 / 0.7) 0%, transparent 60%)',
      zIndex: 1,
    },
    catInfo: { position: 'relative', zIndex: 2, padding: '20px' },
    catLabel: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: 4,
    },
    catDesc: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em' },
    catArrow: {
      width: 28, height: 28, borderRadius: '50%',
      border: '1.5px solid rgba(255,255,255,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginTop: 10, color: 'white', fontSize: '0.75rem',
      transition: 'background 0.2s, border-color 0.2s',
    },
    featuredSection: { padding: '80px 48px' },
    featuredHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 },
    featuredGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 },
    banner: {
      background: 'var(--red)', color: 'white',
      padding: '80px 48px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
    },
    bannerTitle: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: 'clamp(2.5rem,4vw,3.8rem)', fontWeight: 900,
      lineHeight: 1.05, letterSpacing: '-0.02em',
    },
    bannerItalic: { fontStyle: 'italic', opacity: 0.8 },
    bannerRight: { display: 'flex', flexDirection: 'column', gap: 20 },
    bannerStat: { display: 'flex', alignItems: 'baseline', gap: 12 },
    bannerStatNum: { fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '3rem', fontWeight: 900 },
    bannerStatLbl: { fontSize: '0.82rem', opacity: 0.8, lineHeight: 1.4 },
    bannerDivider: { width: '100%', height: 1, background: 'rgba(255,255,255,0.2)' },
    testiSection: { padding: '80px 48px', background: 'var(--offwhite)', borderTop: '1.5px solid var(--border)' },
    testiInner: { maxWidth: 700, margin: '0 auto', textAlign: 'center' },
    testiQuote: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 400,
      lineHeight: 1.55, color: 'var(--ink)', marginBottom: 28,
      minHeight: 80, transition: 'opacity 0.4s',
    },
    testiAuthor: { fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 },
    testiLoc: { fontSize: '0.75rem', color: 'var(--ink-soft)' },
    testiDots: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 },
    newsSection: {
      padding: '80px 48px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
      borderTop: '1.5px solid var(--border)',
    },
    newsInput: {
      width: '100%', height: 50, border: '1.5px solid var(--border)',
      borderRadius: 3, padding: '0 18px',
      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: '0.9rem',
      outline: 'none', transition: 'border-color 0.2s', background: 'white',
    },
    newsRow: { display: 'flex', gap: 12, marginTop: 16 },
  }

  const catColors = [
    'oklch(0.88 0.05 27)',
    'oklch(0.88 0.02 220)',
    'oklch(0.88 0.02 150)',
    'oklch(0.88 0.02 80)',
  ]

  const imgPlaceholder = (hue = 27, sat = 0.04) => ({
    background: `repeating-linear-gradient(45deg,
      oklch(0.88 ${sat} ${hue}) 0px, oklch(0.88 ${sat} ${hue}) 1px,
      oklch(0.92 ${sat * 0.6} ${hue}) 1px, oklch(0.92 ${sat * 0.6} ${hue}) 14px)`,
  })

  return (
    <div className="page-enter">
      {/* HERO */}
      <section style={S.hero} className="rsp-hero">
        <div style={S.heroLeft} className="rsp-hero-left">
          <FadeIn delay={0.3} duration={2.2}>
            <div style={S.heroEyebrow}>
              <span style={S.heroLine} />
              Spring / Summer 2026 Collection
            </div>
          </FadeIn>
          <FadeIn delay={0.6} duration={2.2}>
            <h1 style={S.heroTitle}>
              Wear What<br />
              <span style={S.heroTitleRed}>Endures.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.9} duration={2.2}>
            <p style={S.heroDesc}>
              Redleaf makes clothing for people who are done with disposable fashion. Every piece is designed with precision, sourced with integrity, and built to last a lifetime.
            </p>
          </FadeIn>
          <FadeIn delay={1.2} duration={2.2}>
            <div style={S.heroBtns} className="rsp-btns">
              <button className="btn-primary" onClick={() => router.push('/shop')}>Shop Collection</button>
              <button className="btn-outline" onClick={() => router.push('/about')}>Our Story</button>
            </div>
          </FadeIn>
        </div>
        <div style={S.heroRight} className="rsp-hero-right">
          <motion.img
            initial={{ clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            src="https://ik.imagekit.io/2lax2ytm2/heloLeaf.jpeg"
            alt="Spring/Summer 2026 Campaign"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 0 }}
          />
          <FadeIn delay={0.3} y={0} style={{ ...S.heroBadge, zIndex: 1 }}>
            <div style={S.heroBadgeNum}>
              <Counter value={12} suffix="+" />
            </div>
            <div style={S.heroBadgeLbl}>New Arrivals<br />This Season</div>
          </FadeIn>
        </div>
        <FadeIn delay={0.4} style={S.scrollHint}>
          <div style={S.scrollLine} />
          Scroll to explore
        </FadeIn>
      </section>

      {/* AS SEEN IN */}
      <FadeIn delay={0.1}>
        <section style={{ padding: '32px 48px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 48, overflow: 'hidden' }} className="rsp-px">
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-soft)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            As featured in
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }} className="rsp-hide" />
          <div style={{ display: 'flex', gap: 48, alignItems: 'center', flex: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {['GQ', 'Monocle', 'Esquire', 'The Times', 'Hypebeast', 'Wallpaper*'].map(pub => (
              <div
                key={pub}
                style={{
                  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                  fontSize: pub.length > 6 ? '0.95rem' : '1.15rem',
                  fontWeight: 700, color: 'oklch(0.72 0.01 30)',
                  letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                  transition: 'color 0.2s', cursor: 'default',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.color = 'var(--ink)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.color = 'oklch(0.72 0.01 30)')}
              >
                {pub}
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* VIDEO HERO — scroll-zoom effect */}
      <FadeIn delay={0.1}>
        <VideoHero />
      </FadeIn>

      {/* CATEGORIES */}
      <section style={S.catsSection} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="section-eyebrow">Shop by Category</div>
              <div className="section-title">Find Your Perfect Fit</div>
            </div>
            <button className="btn-ghost" onClick={() => router.push('/shop')}>View All →</button>
          </div>
        </FadeIn>
        <div style={S.catsGrid} className="rsp-4col">
          {categories.map((cat, i) => (
            <FadeIn key={cat.id} delay={0.1 + (i * 0.1)}>
              <div
                style={{
                  ...S.catCard,
                  background: ['bottoms', 'knitwear', 'outerwear', 'tops'].includes(cat.slug) 
                    ? `url(/images/categories/${cat.slug}.png) center/cover`
                    : (cat.image_url ? `url(${cat.image_url}) center/cover` : catColors[i % catColors.length]),
                }}
                onClick={() => router.push('/shop?cat=' + cat.slug)}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-6px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={S.catOverlay} />
                <div style={S.catInfo}>
                  <div style={S.catLabel}>{cat.name}</div>
                  <div style={S.catDesc}>{cat.description}</div>
                  <div style={S.catArrow}>→</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* WHY REDLEAF — USP cards */}
      <section style={{ padding: '80px 48px', background: 'var(--ink)', borderTop: '1.5px solid oklch(0.2 0.01 30)' }} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <div className="section-eyebrow" style={{ color: 'var(--red)' }}>Why Redleaf</div>
              <div className="section-title" style={{ color: 'white' }}>The Standard<br />We Hold Ourselves To</div>
            </div>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, border: '1px solid oklch(0.2 0.01 30)', borderRadius: 4, overflow: 'hidden' }} className="rsp-3col">
          {[
            {
              num: '01',
              title: 'Premium Materials',
              desc: 'We source only from verified mills — Japanese denim, Portuguese wool, waxed British cotton. Every fabric earns its place.',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              ),
            },
            {
              num: '02',
              title: 'Precision Construction',
              desc: 'Twelve-stitch-per-inch minimum. Bar-tacked stress points. Triple-stitched seams. We engineer clothing the way engineers build bridges.',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 1 21 12a10 10 0 0 1-2.93 7.07M4.93 4.93A10 10 0 0 0 3 12a10 10 0 0 0 1.93 7.07"/>
                </svg>
              ),
            },
            {
              num: '03',
              title: '2-Year Guarantee',
              desc: "If it fails due to how we made it — we fix it or replace it. No questions, no receipts required. This is what confidence in your craft looks like.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
            },
          ].map((card, i) => (
            <FadeIn key={card.num} delay={0.1 + (i * 0.1)}>
              <div
                style={{ padding: '40px 36px', background: 'oklch(0.1 0.01 30)', borderRight: '1px solid oklch(0.18 0.01 30)', transition: 'background 0.2s', height: '100%' }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'oklch(0.13 0.01 30)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'oklch(0.1 0.01 30)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div style={{ color: 'var(--red)', opacity: 0.9 }}>{card.icon}</div>
                  <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: 'oklch(0.22 0.01 30)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {card.num}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: 14, letterSpacing: '-0.01em' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.72, color: 'oklch(0.6 0.01 30)' }}>
                  {card.desc}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={S.featuredSection} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={S.featuredHeader}>
            <div>
              <div className="section-eyebrow">Staff Picks</div>
              <div className="section-title">Featured Pieces</div>
            </div>
            <button className="btn-ghost" onClick={() => router.push('/shop')}>All Products →</button>
          </div>
        </FadeIn>
        <div style={S.featuredGrid} className="rsp-4col">
          {featured.map((p, i) => (
            <FadeIn key={p.id} delay={0.1 + (i * 0.1)}>
              <ProductCard product={p} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* MEET ARIA — AI MARKETING SECTION */}
      <section style={{ background: '#0f0e0d', padding: '100px 48px', position: 'relative', overflow: 'hidden' }} className="rsp-px">

        {/* Animated background glows */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -180, right: -180, width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle, rgba(185,28,28,0.35) 0%, transparent 68%)', pointerEvents: 'none' }}
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: -100, left: '15%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(185,28,28,0.25) 0%, transparent 70%)', pointerEvents: 'none' }}
        />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: -60, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }} className="rsp-aria-grid">

          {/* LEFT — slides in from left */}
          <motion.div
            initial={{ opacity: 0, x: -56 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.0, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: 20, background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(185,28,28,0.28)', marginBottom: '2rem' }}
            >
              <motion.svg
                animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                width="10" height="10" viewBox="0 0 24 24" fill="#b91c1c" stroke="none"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </motion.svg>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(185,28,28,0.9)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>New — AI Powered · Free</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2.5rem, 4vw, 3.75rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1.25rem' }}
            >
              Meet Aria,<br />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontWeight: 700 }}>your personal<br />fashion advisor.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.2, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 440 }}
            >
              Aria knows the entire Redleaf collection inside out. Tell her your occasion, your budget, or just a vibe — she&apos;ll find exactly what you need, instantly.
            </motion.p>

            {/* Feature list — each slides from left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2.5rem' }}>
              {[
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>,
                  title: 'Occasion Matching',
                  desc: 'Wedding, office, date night — Aria picks for the moment.',
                },
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
                  title: 'Real-Time Catalog',
                  desc: 'Always up to date with live stock and pricing.',
                },
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
                  title: 'Styled Just for You',
                  desc: 'Recommendations adapt to your preferences and budget.',
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 1.0, delay: 0.68 + i * 0.16, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(185,28,28,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c', flexShrink: 0, marginTop: 1 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white', marginBottom: '0.1rem' }}>{f.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.1, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}
            >
              <button
                onClick={() => router.push('/style-advisor')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.9rem 2rem', borderRadius: 4, border: 'none',
                  background: 'var(--red)', color: 'white',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.01em',
                  transition: 'opacity 0.2s, transform 0.2s',
                  boxShadow: '0 4px 20px rgba(185,28,28,0.4)',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                Talk to Aria — it&apos;s free
              </button>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>No account needed</span>
            </motion.div>
          </motion.div>

          {/* RIGHT — slides in from right, chat card builds itself */}
          <motion.div
            initial={{ opacity: 0, x: 56 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative' }}
          >
            {/* Glow behind card */}
            <motion.div
              animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.06, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: -32, borderRadius: 32, background: 'radial-gradient(ellipse at center, rgba(185,28,28,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}
            />

            <div style={{ background: '#181816', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', position: 'relative' }}>
              {/* Card header */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.55 }}
                style={{ background: '#111110', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>Aria</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }}
                    />
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>AI Style Advisor · Online</span>
                  </div>
                </div>
              </motion.div>

              {/* Live chat demo */}
              <div style={{ padding: '1.75rem 1.5rem' }}>
                <ChatDemo />
              </div>

              {/* Input bar */}
              <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#111110', borderRadius: 10, padding: '0.6rem 0.875rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Ask Aria anything…
                </div>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`.rsp-aria-grid { @media (max-width: 768px) { grid-template-columns: 1fr !important; gap: 2.5rem !important; } }`}</style>
      </section>

      {/* EDITORIAL LOOKBOOK / MARKETING */}
      <section style={{ padding: '80px 48px', borderTop: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)' }} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <div className="section-eyebrow">The Lookbook</div>
              <div className="section-title">SS26 — Wear What Endures</div>
            </div>
            <button className="btn-ghost" onClick={() => router.push(marketingBanners[1]?.link_url || '/shop')}>Shop the Look →</button>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }} className="rsp-1col">
          {/* Slot 1 — Large hero */}
          {(() => {
            const b = marketingBanners[1]
            return (
              <FadeIn delay={0.1}>
                <div
                  style={{
                    position: 'relative', borderRadius: 4, overflow: 'hidden', height: 540, cursor: 'pointer',
                    ...(b?.image_url
                      ? { backgroundImage: `url(${b.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : imgPlaceholder(27, 0.05)),
                  }}
                  onClick={() => router.push(b?.link_url || '/shop')}
                  onMouseEnter={e => { const el = e.currentTarget.querySelector('.look-overlay') as HTMLElement; if (el) el.style.opacity = '1' }}
                  onMouseLeave={e => { const el = e.currentTarget.querySelector('.look-overlay') as HTMLElement; if (el) el.style.opacity = '0' }}
                >
                  <div className="look-overlay" style={{ position: 'absolute', inset: 0, background: 'oklch(0.08 0.01 30 / 0.55)', opacity: 0, transition: 'opacity 0.3s', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ border: '1.5px solid white', color: 'white', padding: '10px 24px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Shop Now
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 28, left: 28, zIndex: 2 }}>
                    {b?.title || b?.subtitle ? (
                      <>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                          Featured Style
                        </div>
                        {b.title && <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>{b.title}</div>}
                        {b.subtitle && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{b.subtitle}</div>}
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Featured Style</div>
                        <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>The Ember Field Jacket</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>$298 — Available in 3 colours</div>
                      </>
                    )}
                  </div>
                </div>
              </FadeIn>
            )
          })()}

          {/* Right column — Slots 2 & 3 */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
            {([
              { slot: 2, defaultLabel: 'The Ridge Knit', defaultSub: '$188 — Heritage texture', hue: 220, sat: 0.03 },
              { slot: 3, defaultLabel: 'Mesa Overshirt', defaultSub: '$148 — The shirt that does everything', hue: 150, sat: 0.02 },
            ] as const).map((item, i) => {
              const b = marketingBanners[item.slot]
              return (
                <FadeIn key={item.slot} delay={0.2 + (i * 0.1)} style={{ height: '100%' }}>
                  <div
                    style={{
                      position: 'relative', borderRadius: 4, overflow: 'hidden', height: '100%', cursor: 'pointer',
                      ...(b?.image_url
                        ? { backgroundImage: `url(${b.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : imgPlaceholder(item.hue, item.sat)),
                    }}
                    onClick={() => router.push(b?.link_url || '/shop')}
                    onMouseEnter={e => { const ov = e.currentTarget.querySelector('.look-overlay') as HTMLElement; if (ov) ov.style.opacity = '1' }}
                    onMouseLeave={e => { const ov = e.currentTarget.querySelector('.look-overlay') as HTMLElement; if (ov) ov.style.opacity = '0' }}
                  >
                    <div className="look-overlay" style={{ position: 'absolute', inset: 0, background: 'oklch(0.08 0.01 30 / 0.55)', opacity: 0, transition: 'opacity 0.3s', zIndex: 1 }} />
                    <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 2 }}>
                      <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: 'white' }}>
                        {b?.title || item.defaultLabel}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                        {b?.subtitle || item.defaultSub}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* RED BANNER */}
      <section style={S.banner} className="rsp-2col rsp-px">
        <FadeIn delay={0.1}>
          <div>
            <div style={S.bannerTitle}>
              Built Different.<br />
              <span style={S.bannerItalic}>Worn Forever.</span>
            </div>
            <div style={{ marginTop: 32, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                className="btn-outline"
                style={{ borderColor: 'white', color: 'white' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                onClick={() => router.push('/about')}
              >
                Our Philosophy
              </button>
            </div>
          </div>
        </FadeIn>
        <div style={S.bannerRight}>
          {[
            { num: 10, suffix: '+', lbl: 'Years of craftsmanship\nand design excellence' },
            { num: 98, suffix: '%', lbl: 'Customer satisfaction\nacross 40,000+ orders' },
            { num: 2, suffix: 'yr', lbl: 'Warranty on every\npiece we make' },
          ].map((stat, i) => (
            <FadeIn key={i} delay={0.1 + (i * 0.1)}>
              <div>
                {i > 0 && <div style={S.bannerDivider} />}
                <div style={S.bannerStat}>
                  <div style={S.bannerStatNum}>
                    <Counter value={stat.num} suffix={stat.suffix} />
                  </div>
                  <div style={S.bannerStatLbl}>{stat.lbl.split('\n').map((l, j) => <div key={j}>{l}</div>)}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* SUSTAINABILITY PLEDGE */}
      <section style={{ padding: '80px 48px', borderBottom: '1.5px solid var(--border)' }} className="rsp-px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="rsp-2col">
          <FadeIn delay={0.1}>
            <div>
              <div className="section-eyebrow">Our Commitment</div>
              <div className="section-title" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}>
                Fashion Can Be<br />
                <span style={{ color: 'var(--red)', fontStyle: 'italic' }}>Part of the Solution.</span>
              </div>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'var(--ink-mid)', marginTop: 20, marginBottom: 32 }}>
                We refuse to make throwaway clothing. Every decision — from the thread count to the shipping box — is measured against its environmental cost. Not because it's trendy. Because it's right.
              </p>
              <button className="btn-ghost" onClick={() => router.push('/about')}>
                Read Our Sustainability Report →
              </button>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="rsp-2col">
            {[
              { icon: '♻', label: <><Counter value={100} suffix="%" /> Traceable</>, desc: 'Every material is tracked from origin to your door' },
              { icon: '✈', label: 'Carbon Neutral Shipping', desc: 'All deliveries offset through verified reforestation' },
              { icon: '♡', label: 'Fair Wages Certified', desc: 'All factory workers paid above living wage' },
              { icon: '⟳', label: 'Lifetime Repair Service', desc: "Send it back — we'll fix it, free of charge" },
            ].map((pledge, i) => (
              <FadeIn key={i} delay={0.1 + (i * 0.1)}>
                <div
                  style={{ padding: '24px', border: '1.5px solid var(--border)', borderRadius: 4, transition: 'border-color 0.2s, box-shadow 0.2s', height: '100%' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>{pledge.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)', marginBottom: 6 }}>{pledge.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-mid)', lineHeight: 1.6 }}>{pledge.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={S.testiSection}>
        <FadeIn delay={0.1}>
          <div style={S.testiInner}>
            <div className="section-eyebrow" style={{ textAlign: 'center', marginBottom: 32 }}>What Our Customers Say</div>
            <div style={S.testiQuote}>"{testimonials[activeTestimonial].text}"</div>
            <Stars rating={5} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 16 }}>
              <div style={S.testiAuthor}>{testimonials[activeTestimonial].name}</div>
              <div style={S.testiLoc}>{testimonials[activeTestimonial].location}</div>
            </div>
            <div style={S.testiDots}>
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  style={{
                    width: i === activeTestimonial ? 24 : 8,
                    height: 8, borderRadius: 4, cursor: 'pointer',
                    background: i === activeTestimonial ? 'var(--red)' : 'var(--border)',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* COMMUNITY / UGC */}
      <section style={{ padding: '80px 48px', borderTop: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)' }} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-eyebrow">The Community</div>
            <div className="section-title">Worn by Real People</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', marginTop: 12 }}>
              Tag <strong style={{ color: 'var(--ink)' }}>#WearRedleaf</strong> to be featured here
            </p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gridAutoRows: '260px', gap: 16 }} className="rsp-bento">
          {[
            { img: '/images/ugc/ugc_jacket.png', size: 'Jacket · M', span: { gridColumn: 'span 2', gridRow: 'span 2' } },
            { img: '/images/ugc/ugc_knit_1.png', size: 'Knit · L', span: { gridColumn: 'span 1', gridRow: 'span 1' } },
            { img: '/images/ugc/ugc_shirt.png', size: 'Shirt · XL', span: { gridColumn: 'span 1', gridRow: 'span 2' } },
            { img: '/images/ugc/ugc_parka.png', size: 'Parka · S', span: { gridColumn: 'span 1', gridRow: 'span 1' } },
            { img: '/images/ugc/ugc_tee.png', size: 'Tee · M', span: { gridColumn: 'span 2', gridRow: 'span 1' } },
            { img: '/images/ugc/ugc_knit_2.png', size: 'Knit · XS', span: { gridColumn: 'span 2', gridRow: 'span 1' } },
          ].map((item, i) => (
            <FadeIn key={i} delay={0.1 + (i * 0.1)} style={{ ...item.span, height: '100%' }} className="rsp-bento-item">
              <div
                style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: `url(${item.img}) center/cover` }}
                onMouseEnter={e => { const ov = e.currentTarget.querySelector('.ugc-ov') as HTMLElement; if (ov) ov.style.opacity = '1' }}
                onMouseLeave={e => { const ov = e.currentTarget.querySelector('.ugc-ov') as HTMLElement; if (ov) ov.style.opacity = '0' }}
                onClick={() => router.push('/shop')}
              >
                <div className="ugc-ov" style={{ position: 'absolute', inset: 0, background: 'oklch(0.1 0.01 30 / 0.6)', opacity: 0, transition: 'opacity 0.25s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white' }}>Shop</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>{item.size}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={S.newsSection} className="rsp-2col rsp-px">
        <FadeIn delay={0.1}>
          <div>
            <div className="section-eyebrow">Stay in the Loop</div>
            <div className="section-title" style={{ fontSize: '2rem' }}>Join the Redleaf Community</div>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--ink-mid)', marginBottom: 8 }}>
              New drops, early access, and field notes from the studio — delivered when it matters.
            </p>
            {subscribed ? (
              <div style={{ padding: '16px 20px', background: 'var(--red-light)', borderRadius: 3, color: 'var(--red)', fontWeight: 600, fontSize: '0.9rem' }}>
                ✓ You're in. Welcome to Redleaf.
              </div>
            ) : (
              <div style={S.newsRow}>
                <input
                  style={S.newsInput}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={e => (e.target.style.borderColor = 'var(--red)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button className="btn-primary" onClick={async () => {
                  if (!email) return
                  await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                  setSubscribed(true)
                }}>
                  Subscribe
                </button>
              </div>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: 10 }}>
              No spam. Unsubscribe anytime. We respect your inbox.
            </p>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
