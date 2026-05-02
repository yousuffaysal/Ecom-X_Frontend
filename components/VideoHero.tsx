'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'

const VIDEO_URL = 'https://res.cloudinary.com/dduyaqvk3/video/upload/v1777668901/girl_is_running_slow_mothion_202605020127_1_adx5zi.mov'

export default function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // offset: 'start end' → section enters bottom of viewport; 'end start' → section leaves top
  // This makes the animation start immediately as the section scrolls into view
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // ── Mask reveal: completes as section floats up to fill viewport ───────────
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.38],
    ['inset(35% 38% 35% 38% round 28px)', 'inset(0% 0% 0% 0% round 4px)']
  )

  // ── Video zoom-out ─────────────────────────────────────────────────────────
  const bgScale = useTransform(scrollYProgress, [0, 0.7], [1.6, 1.0])

  // ── Text: fades in once fully revealed, fades out as section exits ─────────
  const textOpacity = useTransform(
    scrollYProgress,
    [0.32, 0.46],
    [0,    1   ]
  )
  const textY = useTransform(scrollYProgress, [0.32, 0.46], [28, 0])

  // ── Scroll hint ────────────────────────────────────────────────────────────
  const hintOpacity = useTransform(scrollYProgress, [0.05, 0.18], [1, 0])

  return (
    <div>
      <style>{`
        .video-hero-container { height: 135vh; }
        .video-hero-sticky    { height: 100vh; top: 0; }
        @media (max-width: 768px) {
          .video-hero-sticky    { height: 60vh !important; top: 20vh !important; }
          .video-hero-container { height: 90vh !important; }
        }
      `}</style>

      <div className="video-hero-container" ref={containerRef} style={{ position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="video-hero-sticky"
          style={{
            position: 'sticky',
            overflow: 'hidden',
            background: '#080706',
            clipPath,
            // keep hard border-radius on the div too so overflow:hidden clips video correctly
            borderRadius: 4,
            boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {/* Video layer — zooms out as revealed */}
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              transformOrigin: 'center center',
              scale: bgScale,
              willChange: 'transform',
            }}
          >
            {VIDEO_URL ? (
              <video
                autoPlay muted loop playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              >
                <source src={VIDEO_URL} />
              </video>
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg, #1e1712 0%, #100d0a 40%, #080706 100%)' }} />
            )}
          </motion.div>

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.62) 100%)',
          }} />

          {/* Text — fades in after mask is done, then fades out */}
          <motion.div
            style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0 1.5rem', textAlign: 'center',
              opacity: textOpacity,
              y: textY,
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
              Every piece in the SS26 collection is built to last a lifetime — designed with precision, sourced with integrity.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/shop')}
                style={{
                  padding: '0.8rem 2rem', borderRadius: 4, border: 'none',
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
                  padding: '0.8rem 2rem', borderRadius: 4,
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
          </motion.div>

          {/* Scroll hint — fades out early */}
          <motion.div
            style={{
              position: 'absolute', bottom: '2rem', left: '50%',
              transform: 'translateX(-50%)', zIndex: 2,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.5rem',
              opacity: hintOpacity,
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
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
