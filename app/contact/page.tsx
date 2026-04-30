'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setSubmitError(d.error || 'Failed to send message')
      } else {
        setSubmitted(true)
      }
    } catch {
      setSubmitError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const S: Record<string, React.CSSProperties> = {
    hero: {
      background: 'var(--ink)', color: 'white',
      padding: '80px 48px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      borderBottom: '1.5px solid oklch(0.2 0.01 30)',
    },
    heroEyebrow: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 16 },
    heroTitle: { fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 'clamp(2.5rem,4vw,3.8rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20 },
    heroDesc: { fontSize: '0.95rem', lineHeight: 1.75, color: 'oklch(0.65 0.01 30)' },
    infoCards: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
    infoCard: {
      padding: '20px 24px', border: '1px solid oklch(0.22 0.01 30)',
      borderRadius: 4, display: 'flex', alignItems: 'flex-start', gap: 16,
    },
    infoIcon: {
      width: 40, height: 40, borderRadius: 3,
      background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: '1rem',
    },
    infoLabel: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'oklch(0.5 0.01 30)', marginBottom: 4 },
    infoValue: { fontSize: '0.9rem', color: 'white', fontWeight: 500 },
    infoSub: { fontSize: '0.75rem', color: 'oklch(0.5 0.01 30)', marginTop: 2 },
    formSection: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
      borderBottom: '1.5px solid var(--border)',
    },
    formCol: { padding: '64px 48px', borderRight: '1.5px solid var(--border)' },
    formTitle: { fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 },
    formSub: { fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 36, lineHeight: 1.6 },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
    label: { fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mid)' },
    input: {
      height: 48, border: '1.5px solid var(--border)', borderRadius: 3,
      padding: '0 16px', fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: '0.9rem',
      outline: 'none', transition: 'border-color 0.2s', background: 'white', color: 'var(--ink)',
    },
    textarea: {
      height: 140, border: '1.5px solid var(--border)', borderRadius: 3,
      padding: '14px 16px', fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: '0.9rem',
      outline: 'none', transition: 'border-color 0.2s', resize: 'vertical' as const,
      background: 'white', color: 'var(--ink)', lineHeight: 1.6,
    },
    select: {
      height: 48, border: '1.5px solid var(--border)', borderRadius: 3,
      padding: '0 16px', fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: '0.9rem',
      outline: 'none', cursor: 'pointer', background: 'white', color: 'var(--ink)',
    },
    success: {
      background: 'var(--red-light)', border: '1.5px solid var(--red)',
      borderRadius: 4, padding: '28px', textAlign: 'center',
    },
    rightCol: { padding: '64px 48px' },
    faqSection: {
      padding: '64px 48px', background: 'var(--offwhite)',
      borderBottom: '1.5px solid var(--border)',
    },
    faqHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 },
    faqBody: { padding: '0 24px 20px', fontSize: '0.83rem', lineHeight: 1.7, color: 'var(--ink-mid)' },
    mapSection: { height: 320, background: 'var(--offwhite)', position: 'relative', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    mapBg: {
      position: 'absolute', inset: 0,
      background: `repeating-linear-gradient(0deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 40px),
                   repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 40px)`,
      opacity: 0.5,
    },
    mapPin: {
      position: 'relative', zIndex: 2, textAlign: 'center',
      background: 'white', padding: '20px 28px', borderRadius: 4,
      border: '1.5px solid var(--border)',
      boxShadow: '0 8px 32px oklch(0 0 0 / 0.08)',
    },
  }

  const faqs = [
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3–5 business days in the US, 5–8 internationally. Express 2-day shipping is available at checkout.' },
    { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery. Items must be unworn with tags attached. Return shipping is free — a label is included with your order.' },
    { q: 'Do you offer size exchanges?', a: "Yes! Exchanges ship within 24 hours of receiving your return. Contact us and we'll hold the new size for you." },
    { q: 'How do I care for waxed cotton?', a: 'Re-wax annually or when water stops beading. Spot clean with a damp cloth — never machine wash, as this strips the wax coating.' },
    { q: 'Are your factories audited?', a: 'Yes. All Redleaf manufacturing partners are audited annually against our Supplier Code of Conduct. We publish factory names on our transparency page.' },
    { q: 'What does the 2-year warranty cover?', a: "Our warranty covers any manufacturing defect in materials or workmanship. We'll repair or replace — your choice. Normal wear and mis-use are not covered." },
  ]

  const subjects = ['General Inquiry', 'Order Support', 'Returns & Exchanges', 'Size & Fit', 'Wholesale', 'Press & Media', 'Other']

  return (
    <div className="page-enter">
      {/* HERO */}
      <section style={S.hero} className="rsp-2col rsp-px">
        <div>
          <div style={S.heroEyebrow}>Get in Touch</div>
          <h1 style={S.heroTitle}>We'd Love to Hear From You</h1>
          <p style={S.heroDesc}>
            Real people read every message. We aim to respond within one business day. For urgent order issues, include your order number and we'll prioritise your request.
          </p>
        </div>
        <div style={S.infoCards}>
          {[
            { icon: '✉', label: 'Email', value: 'hello@redleaf.co', sub: 'Response within 24 hours' },
            { icon: '☎', label: 'Phone', value: '+1 (503) 555 0182', sub: 'Mon–Fri, 9am–6pm PST' },
            { icon: '◎', label: 'Headquarters', value: '2840 NW Thurman St.', sub: 'Portland, OR 97210, USA' },
          ].map(c => (
            <div key={c.label} style={S.infoCard}>
              <div style={S.infoIcon}>{c.icon}</div>
              <div>
                <div style={S.infoLabel}>{c.label}</div>
                <div style={S.infoValue}>{c.value}</div>
                <div style={S.infoSub}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FORM + SIDEBAR */}
      <section style={S.formSection} className="rsp-2col">
        <div style={S.formCol} className="rsp-contact-col">
          <div style={S.formTitle}>Send a Message</div>
          <p style={S.formSub}>Fill in the form below and we'll get back to you as soon as possible.</p>

          {submitted ? (
            <div style={S.success}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>✓</div>
              <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 8, color: 'var(--red)' }}>
                Message Received
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-mid)', lineHeight: 1.65 }}>
                Thanks, {form.name.split(' ')[0]}! We've received your message and will reply to <strong>{form.email}</strong> within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={S.formRow}>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Full Name *</label>
                  <input
                    style={{ ...S.input, borderColor: focused === 'name' ? 'var(--red)' : 'var(--border)' }}
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    required
                  />
                </div>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Email Address *</label>
                  <input
                    type="email"
                    style={{ ...S.input, borderColor: focused === 'email' ? 'var(--red)' : 'var(--border)' }}
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    required
                  />
                </div>
              </div>

              <div style={S.fieldWrap}>
                <label style={S.label}>Subject</label>
                <select
                  style={{ ...S.select, borderColor: focused === 'subject' ? 'var(--red)' : 'var(--border)' }}
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused(null)}
                >
                  <option value="">Select a topic…</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={S.fieldWrap}>
                <label style={S.label}>Message *</label>
                <textarea
                  style={{ ...S.textarea, borderColor: focused === 'message' ? 'var(--red)' : 'var(--border)' }}
                  placeholder="Tell us how we can help…"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>

              {submitError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 4, marginBottom: 12, fontSize: '0.85rem' }}>
                  {submitError}
                </div>
              )}
              <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', height: 52, marginTop: 4, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Sending…' : 'Send Message →'}
              </button>
              <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: 12, textAlign: 'center' }}>
                We respect your privacy and will never share your information.
              </p>
            </form>
          )}
        </div>

        {/* RIGHT */}
        <div style={S.rightCol} className="rsp-contact-col">
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 24 }}>Hours & Response Times</div>
          {[
            { label: 'Email Support', val: 'Mon–Fri · Replies within 24h' },
            { label: 'Live Chat',     val: 'Mon–Fri · 10am–5pm PST' },
            { label: 'Phone Support', val: 'Mon–Fri · 9am–6pm PST' },
            { label: 'Weekends',      val: 'Email only · Replies Monday' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600 }}>{r.label}</span>
              <span style={{ color: 'var(--ink-soft)' }}>{r.val}</span>
            </div>
          ))}

          <div style={{ marginTop: 36, padding: '24px', background: 'var(--red-light)', borderRadius: 4, border: '1.5px solid oklch(0.88 0.05 27)' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--red)', fontSize: '0.88rem' }}>Order Support</div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.65, color: 'var(--ink-mid)', marginBottom: 12 }}>
              For the fastest order help, include your order number (e.g. RL-12345) in your message subject line.
            </p>
            <button className="btn-ghost">Track My Order →</button>
          </div>

          <div style={{ marginTop: 28, padding: '24px', border: '1.5px solid var(--border)', borderRadius: 4 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.88rem' }}>Wholesale Inquiries</div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.65, color: 'var(--ink-mid)', marginBottom: 12 }}>
              We work with a select number of independent retailers. Minimum orders and terms available on request.
            </p>
            <button className="btn-ghost">Wholesale Info →</button>
          </div>
        </div>
      </section>

      {/* MAP */}
      <div style={S.mapSection}>
        <div style={S.mapBg} />
        <div style={S.mapPin}>
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📍</div>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>Redleaf HQ</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>2840 NW Thurman St, Portland, OR 97210</div>
        </div>
      </div>

      {/* FAQ */}
      <section style={S.faqSection} className="rsp-px">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="section-eyebrow">Common Questions</div>
          <div className="section-title">FAQ</div>
        </div>
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginTop: 40 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1.5px solid var(--border)' : 'none' }}>
              <div
                style={S.faqHeader}
                onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
              >
                {faq.q}
                <span style={{ color: 'var(--red)', fontSize: '1.1rem', transform: activeAccordion === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', flexShrink: 0, marginLeft: 12 }}>+</span>
              </div>
              {activeAccordion === i && (
                <div style={S.faqBody}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
