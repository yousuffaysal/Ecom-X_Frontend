'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function FadeIn({ children, delay = 0, y = 24 }: { children: React.ReactNode, delay?: number, y?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

export default function AboutPage() {
  const router = useRouter()

  const S: Record<string, React.CSSProperties> = {
    hero: {
      minHeight: '70vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      borderBottom: '1.5px solid var(--border)',
    },
    heroLeft: {
      padding: '80px 48px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      background: 'var(--red)',
    },
    heroEyebrow: {
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
      marginBottom: 20,
    },
    heroTitle: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: 'clamp(2.8rem,5vw,4.5rem)', fontWeight: 900,
      lineHeight: 1.05, letterSpacing: '-0.02em', color: 'white',
      marginBottom: 24,
    },
    heroDesc: {
      fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.85)',
      maxWidth: 440,
    },
    heroRight: {
      background: 'var(--offwhite)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 10, position: 'relative',
    },
    heroRightBg: {
      position: 'absolute', inset: 0,
      background: `url(/images/about/about_hero.png) center/cover`,
    },
    story: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
      borderBottom: '1.5px solid var(--border)',
    },
    storyLeft: { padding: '80px 48px', borderRight: '1.5px solid var(--border)' },
    storyRight: { padding: '80px 48px' },
    storyImg: {
      height: 320, borderRadius: 4, marginBottom: 28,
      background: `url(/images/about/about_story.png) center/cover`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    storyImgLabel: {
      fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.14em', color: 'var(--red)',
      background: 'white', padding: '6px 14px', borderRadius: 2,
    },
    bodyTitle: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '1.8rem', fontWeight: 700, marginBottom: 20, lineHeight: 1.2,
    },
    bodyText: {
      fontSize: '0.9rem', lineHeight: 1.85, color: 'var(--ink-mid)',
      marginBottom: 16,
    },
    pullQuote: {
      borderLeft: '3px solid var(--red)', paddingLeft: 20,
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '1.2rem', fontStyle: 'italic', lineHeight: 1.5,
      color: 'var(--ink)', margin: '24px 0',
    },
    values: {
      padding: '80px 48px', borderBottom: '1.5px solid var(--border)',
      background: 'var(--offwhite)',
    },
    valuesHeader: { textAlign: 'center', marginBottom: 56 },
    valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 },
    valueCard: {
      padding: '32px', border: '1.5px solid var(--border)',
      borderRadius: 4, background: 'white', position: 'relative',
      overflow: 'hidden',
    },
    valueNum: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '4rem', fontWeight: 900, color: 'var(--red-light)',
      position: 'absolute', top: 12, right: 20, lineHeight: 1,
    },
    valueIcon: {
      width: 48, height: 48, background: 'var(--red-light)',
      borderRadius: 3, display: 'flex', alignItems: 'center',
      justifyContent: 'center', marginBottom: 16, fontSize: '1.3rem',
    },
    valueTitle: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '1.2rem', fontWeight: 700, marginBottom: 10,
    },
    valueText: { fontSize: '0.85rem', lineHeight: 1.75, color: 'var(--ink-mid)' },
    timeline: { padding: '80px 48px', borderBottom: '1.5px solid var(--border)' },
    timelineInner: { maxWidth: 800, margin: '0 auto' },
    timelineItems: { position: 'relative', marginTop: 48 },
    timelineLine: { position: 'absolute', left: 80, top: 0, bottom: 0, width: 1.5, background: 'var(--border)' },
    timelineItem: { display: 'flex', gap: 32, marginBottom: 48, position: 'relative' },
    timelineYear: {
      width: 60, flexShrink: 0, textAlign: 'right',
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '1rem', fontWeight: 700, color: 'var(--red)', paddingTop: 2,
    },
    timelineDot: {
      width: 12, height: 12, borderRadius: '50%', background: 'var(--red)',
      position: 'absolute', left: 74, top: 6,
      border: '2px solid white', boxShadow: '0 0 0 1.5px var(--red)',
      flexShrink: 0,
    },
    timelineContent: { paddingLeft: 20 },
    timelineTitle: { fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 },
    timelineText: { fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--ink-mid)' },
    team: { padding: '80px 48px', background: 'var(--offwhite)', borderBottom: '1.5px solid var(--border)' },
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginTop: 48 },
    teamCard: { textAlign: 'center' },
    teamPhoto: {
      width: '100%', aspectRatio: '1' as const, borderRadius: '50%',
      marginBottom: 16, overflow: 'hidden', maxWidth: 160, margin: '0 auto 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--red)',
    },
    teamName: { fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 },
    teamRole: { fontSize: '0.78rem', color: 'var(--red)', fontWeight: 600, marginBottom: 6 },
    teamBio: { fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--ink-soft)' },
    cta: {
      padding: '80px 48px', background: 'var(--ink)', color: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 24,
    },
    ctaTitle: {
      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
      fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.02em',
    },
    ctaSub: { fontSize: '1rem', color: 'oklch(0.65 0.01 30)', maxWidth: 480, lineHeight: 1.7 },
  }

  const values = [
    { icon: '✦', title: 'Lasting Quality', text: 'Every material is chosen for longevity. We refuse to cut corners where it matters — in the fabric, the thread, the hardware.' },
    { icon: '⬡', title: 'Thoughtful Design', text: 'Form follows function. Our pieces earn their details through utility and proportion, never decoration for its own sake.' },
    { icon: '◈', title: 'Honest Pricing', text: 'We show you what things cost to make. No phantom markups, no fake discounts. Just fair prices for quality work.' },
    { icon: '△', title: 'Responsible Sourcing', text: 'Our supply chain is audited, documented, and improving every year. We work only with partners who treat people fairly.' },
    { icon: '◎', title: 'Transparent Trade', text: 'We publish our factory partners, our material origins, and our impact reports — because accountability starts with honesty.' },
    { icon: '⊕', title: 'Community First', text: "We're nothing without the people who wear Redleaf. Every decision is made with our community's feedback at the table." },
  ]

  const timeline = [
    { year: '2014', title: 'Founded in Portland', text: 'Two friends with a shared frustration: great-looking clothes that fell apart after a season. Redleaf started in a garage.' },
    { year: '2016', title: 'First Factory Partnership', text: 'We found our first manufacturing partner in Portugal — a family-run factory with 60 years of experience in waxed cotton.' },
    { year: '2018', title: '10,000 Orders', text: 'Word spread through hiking communities, design circles, and slow-fashion advocates. We hit 10,000 orders without a single paid ad.' },
    { year: '2021', title: 'B Corp Certified', text: 'After three years of work, Redleaf became a certified B Corporation — meeting rigorous standards of social and environmental performance.' },
    { year: '2023', title: 'Global Expansion', text: 'Opened fulfilment in the UK and EU. Now shipping to 48 countries, with local return centres in London and Berlin.' },
    { year: '2026', title: 'SS26 Collection', text: 'Our largest collection to date — 12 new pieces, all designed for permanence. This is the Redleaf we always imagined.' },
  ]

  const team = [
    { name: 'Eliot Ward', role: 'Co-Founder & CEO', bio: 'Former outdoor gear designer. Believes in buying one good thing instead of ten cheap ones.', bg: 'url(/images/about/team_1.png) center/cover' },
    { name: 'Dana Cho', role: 'Co-Founder & Creative Director', bio: 'Trained in textile design at Central Saint Martins. Obsessed with material honesty.', bg: 'url(/images/about/team_2.png) center/cover' },
    { name: 'Rémy Laurent', role: 'Head of Production', bio: 'Built factory relationships across Portugal, Japan, and Peru over 15 years of sourcing.', bg: 'url(/images/about/team_3.png) center/cover' },
    { name: 'Ama Ofori', role: 'Head of Community', bio: 'Turned a 5,000-person email list into the most engaged community in slow fashion.', bg: 'url(/images/about/team_4.png) center/cover' },
  ]

  return (
    <div className="page-enter">
      {/* HERO */}
      <section style={S.hero} className="rsp-hero">
        <div style={S.heroLeft}>
          <FadeIn delay={0.1}>
            <div style={S.heroEyebrow}>Our Story</div>
            <h1 style={S.heroTitle}>Made to<br />Last. Built<br />with Care.</h1>
            <p style={S.heroDesc}>
              Redleaf started with a simple conviction: the clothing industry was making things wrong. We set out to prove there was a better way.
            </p>
          </FadeIn>
        </div>
        <div style={S.heroRight}>
          <div style={S.heroRightBg} />
          <FadeIn delay={0.3} y={10}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'white', padding: '8px 18px', borderRadius: 2, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--red)', fontWeight: 700 }}>
                Brand Photography
              </div>
              <div style={{ fontSize: '0.58rem', color: 'var(--ink-soft)', letterSpacing: '0.06em' }}>Studio / Portland, OR</div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STORY */}
      <section style={S.story} className="rsp-2col">
        <div style={S.storyLeft}>
          <FadeIn delay={0.1}>
            <div style={S.storyImg}>
              <div style={S.storyImgLabel}>Founders — 2014</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={S.bodyTitle}>A Garage in Portland</div>
            <p style={S.bodyText}>
              In 2014, Eliot Ward and Dana Cho were fed up. They'd both spent years in the fashion industry — Eliot in technical outerwear, Dana in textile design — watching brands cut corners, inflate margins, and cynically market "sustainable" collections while business-as-usual continued behind the scenes.
            </p>
            <p style={S.bodyText}>
              So they quit. They pooled their savings, rented a Portland garage, and started calling factories. The brief was simple: make one jacket. Make it perfectly. Don't rush it.
            </p>
            <div style={S.pullQuote}>
              "We wanted to make something our grandchildren would find in an attic and think someone really cared about this."
              <div style={{ fontSize: '0.75rem', marginTop: 8, fontStyle: 'normal', fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", color: 'var(--ink-soft)', fontWeight: 600 }}>— Eliot Ward, Co-Founder</div>
            </div>
          </FadeIn>
        </div>
        <div style={S.storyRight}>
          <div style={{ height: 32 }} />
          <FadeIn delay={0.3}>
            <div style={S.bodyTitle}>The Redleaf Standard</div>
            <p style={S.bodyText}>
              The first jacket took eight months. Eight months of sourcing waxed cotton from Scottish mills, finding a family-run Portuguese factory that understood what they were trying to do, and iterating on a pattern until it was right.
            </p>
            <p style={S.bodyText}>
              When it launched, they made 200. They sold out in 11 days, without a single ad. Every customer was a referral. That told them everything they needed to know.
            </p>
            <p style={S.bodyText}>
              Today, Redleaf makes 12 core pieces and a small seasonal collection. We've deliberately stayed small. We audit every factory. We publish every material origin. We offer a two-year warranty because we believe in what we make.
            </p>
            <p style={S.bodyText}>
              Fast fashion optimises for transactions. We optimise for trust — with our makers, with the environment, and with you.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn-primary" onClick={() => router.push('/shop')}>Shop the Collection</button>
              <button className="btn-outline" onClick={() => router.push('/contact')}>Get in Touch</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* VALUES */}
      <section style={S.values} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={S.valuesHeader}>
            <div className="section-eyebrow">What We Stand For</div>
            <div className="section-title">Our Six Commitments</div>
          </div>
        </FadeIn>
        <div style={S.valuesGrid} className="rsp-3col">
          {values.map((v, i) => (
            <FadeIn key={i} delay={0.1 + (i * 0.1)}>
              <div style={S.valueCard}>
                <div style={S.valueNum}>0{i + 1}</div>
                <div style={S.valueIcon}>{v.icon}</div>
                <div style={S.valueTitle}>{v.title}</div>
                <p style={S.valueText}>{v.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section style={S.timeline} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div className="section-eyebrow">Our Journey</div>
            <div className="section-title">From Garage to Global</div>
          </div>
        </FadeIn>
        <div style={S.timelineInner}>
          <div style={S.timelineItems}>
            <div style={S.timelineLine} />
            {timeline.map((t, i) => (
              <FadeIn key={i} delay={0.1 + (i * 0.1)}>
                <div style={S.timelineItem}>
                  <div style={S.timelineYear}>{t.year}</div>
                  <div style={S.timelineDot} />
                  <div style={S.timelineContent}>
                    <div style={S.timelineTitle}>{t.title}</div>
                    <div style={S.timelineText}>{t.text}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={S.team} className="rsp-px">
        <FadeIn delay={0.1}>
          <div style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">The People Behind Redleaf</div>
            <div className="section-title">Meet the Team</div>
          </div>
        </FadeIn>
        <div style={S.teamGrid} className="rsp-4col">
          {team.map((m, i) => (
            <FadeIn key={i} delay={0.1 + (i * 0.1)}>
              <div style={S.teamCard}>
                <div style={{ ...S.teamPhoto, background: m.bg }}></div>
                <div style={S.teamName}>{m.name}</div>
                <div style={S.teamRole}>{m.role}</div>
                <p style={S.teamBio}>{m.bio}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={S.cta}>
        <FadeIn delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div className="section-eyebrow" style={{ color: 'var(--red)' }}>Ready to wear better?</div>
            <div style={S.ctaTitle}>Shop the Collection</div>
            <p style={S.ctaSub}>Every piece is in stock, ships in 24 hours, and comes with our two-year guarantee.</p>
            <button className="btn-primary" style={{ height: 54, fontSize: '0.82rem' }} onClick={() => router.push('/shop')}>
              Explore All Products →
            </button>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
