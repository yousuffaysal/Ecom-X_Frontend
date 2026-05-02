'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, Variants, useScroll, useTransform } from 'framer-motion'

// ── Replace with your hosted video URL ────────────────────────────────────────
const VIDEO_URL = 'https://res.cloudinary.com/dduyaqvk3/video/upload/v1777668901/girl_is_running_slow_mothion_202605020127_1_adx5zi.mov'
// ─────────────────────────────────────────────────────────────────────────────

export default function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router       = useRouter()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Scroll animations
  const bgScale    = useTransform(scrollYProgress, [0, 1], [1.35, 1.0])
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const textY       = useTransform(scrollYProgress, [0, 0.4], [0, -40])
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 1.5, 
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
        staggerChildren: 0.2
      } 
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <div style={{ padding: '2.5rem 1.5rem' }}>
      <style>{`
        .video-hero-sticky {
          height: calc(100vh - 2.5rem);
          top: 1.25rem;
        }
        .video-hero-container {
          height: 160vh;
        }
        @media screen and (max-width: 768px) {
          .video-hero-sticky {
            height: 60vh !important;
            top: 20vh !important;
          }
          .video-hero-container {
            height: 110vh !important;
          }
        }
      `}</style>

      <div
        className="video-hero-container"
        ref={containerRef}
        style={{ position: 'relative' }}
      >
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="video-hero-sticky" 
          style={{
            position: 'sticky',
            borderRadius: 24,
            overflow: 'hidden',
            background: '#080706',
            boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.18)',
          }}
        >
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
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(150deg, #1e1712 0%, #100d0a 40%, #080706 100%)',
              }} />
            )}
          </motion.div>

          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.58) 100%)',
            borderRadius: 24,
          }} />

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
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.28)' }} />
              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.42)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Spring / Summer 2026
              </span>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.28)' }} />
            </motion.div>

            <motion.h2 variants={itemVariants} style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2.75rem, 7vw, 6.5rem)',
              fontWeight: 900, color: 'white',
              lineHeight: 1.0, letterSpacing: '-0.035em',
              marginBottom: '1.5rem',
            }}>
              Find Your<br />
              <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.38)' }}>Perfect Fit</span>
            </motion.h2>

            <motion.p variants={itemVariants} style={{
              fontSize: 'clamp(0.82rem, 1.4vw, 0.95rem)',
              color: 'rgba(255,255,255,0.38)', maxWidth: 460,
              lineHeight: 1.72, marginBottom: '2.5rem',
            }}>
              Every piece in the SS26 collection is built to last a lifetime — designed with precision, sourced with integrity.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            style={{
              position: 'absolute', bottom: '2rem', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2, display: 'flex', flexDirection: 'column',
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
