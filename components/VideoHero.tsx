'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ── Replace with your hosted video URL ────────────────────────────────────────
// Upload to Cloudinary (account: dlvlxrvvd) or any CDN, paste the URL below.
// e.g. 'https://res.cloudinary.com/dlvlxrvvd/video/upload/v1/your-video.mp4'
const VIDEO_URL = ''
// ─────────────────────────────────────────────────────────────────────────────

export default function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgRef        = useRef<HTMLDivElement>(null)
  const textRef      = useRef<HTMLDivElement>(null)
  const scrollRef    = useRef<HTMLDivElement>(null)
  const router       = useRouter()

  useEffect(() => {
    const container  = containerRef.current
    const bg         = bgRef.current
    const text       = textRef.current
    const scrollHint = scrollRef.current
    if (!container || !bg || !text || !scrollHint) return

    function update() {
      const top      = container!.getBoundingClientRect().top
      const scrolled = -top
      const total    = container!.offsetHeight - window.innerHeight
      const p        = Math.max(0, Math.min(1, scrolled / total))

      // zoom: 1.35 → 1.0
      bg!.style.transform = `scale(${1 + (1 - p) * 0.35})`

      // text fades + rises
      text!.style.opacity   = String(Math.max(0, 1 - p * 2.8))
      text!.style.transform = `translateY(${p * -50}px)`

      // scroll hint disappears quickly
      scrollHint!.style.opacity = String(Math.max(0, 1 - p * 8))
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    /* Narrow margin wrapper — gives the side + top/bottom spacing */
    <div style={{ padding: '2.5rem 1.5rem' }}>

      {/* Tall scroll container — shorter than before (160vh total) */}
      <div
        ref={containerRef}
        style={{ height: '160vh', position: 'relative' }}
      >
        {/* Sticky rounded card */}
        <div style={{
          position: 'sticky',
          top: '1.25rem',
          height: 'calc(100vh - 2.5rem)',
          borderRadius: 24,
          overflow: 'hidden',
          background: '#080706',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.18)',
        }}>

          {/* Zoomable background */}
          <div
            ref={bgRef}
            style={{
              position: 'absolute', inset: 0,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            {VIDEO_URL ? (
              <video
                autoPlay muted loop playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              >
                <source src={VIDEO_URL} type="video/mp4" />
              </video>
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `
                  radial-gradient(ellipse 85% 65% at 22% 58%, rgba(185,28,28,0.24) 0%, transparent 62%),
                  radial-gradient(ellipse 50% 80% at 80% 20%, rgba(130,100,70,0.12) 0%, transparent 62%),
                  radial-gradient(ellipse 65% 45% at 58% 82%, rgba(70,50,35,0.18) 0%, transparent 58%),
                  linear-gradient(150deg, #1e1712 0%, #100d0a 40%, #080706 100%)
                `,
              }}>
                {/* Subtle grain */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.035,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: '180px 180px',
                }} />
              </div>
            )}
          </div>

          {/* Depth overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.58) 100%)',
            borderRadius: 24,
          }} />

          {/* Text content */}
          <div
            ref={textRef}
            style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0 1.5rem', textAlign: 'center',
              willChange: 'transform, opacity',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.28)' }} />
              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.42)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Spring / Summer 2026
              </span>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.28)' }} />
            </div>

            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2.75rem, 7vw, 6.5rem)',
              fontWeight: 900, color: 'white',
              lineHeight: 1.0, letterSpacing: '-0.035em',
              marginBottom: '1.5rem',
            }}>
              Find Your<br />
              <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.38)' }}>Perfect Fit</span>
            </h2>

            <p style={{
              fontSize: 'clamp(0.82rem, 1.4vw, 0.95rem)',
              color: 'rgba(255,255,255,0.38)', maxWidth: 460,
              lineHeight: 1.72, marginBottom: '2.5rem',
            }}>
              Every piece in the SS26 collection is built to last a lifetime —<br />
              designed with precision, sourced with integrity.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/shop')}
                style={{
                  padding: '0.8rem 2rem', borderRadius: 3, border: 'none',
                  background: 'white', color: '#0f0e0d',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.02em',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Shop Collection
              </button>
              <button
                onClick={() => router.push('/style-advisor')}
                style={{
                  padding: '0.8rem 2rem', borderRadius: 3,
                  border: '1.5px solid rgba(255,255,255,0.28)',
                  background: 'transparent', color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.52)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
              >
                Ask Aria →
              </button>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            ref={scrollRef}
            style={{
              position: 'absolute', bottom: '2rem', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.5rem',
              willChange: 'opacity',
            }}
          >
            <span style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
              Scroll
            </span>
            <div style={{
              width: 1, height: 40,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)',
              animation: 'scrollPulse 2s ease infinite',
            }} />
          </div>

        </div>
      </div>
    </div>
  )
}
