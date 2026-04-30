'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  rows?: Record<string, unknown>[]
  columns?: string[]
}

const EXAMPLES = [
  'What is my total revenue this month?',
  'Which 5 products sold the most in the last 30 days?',
  'How many orders are pending right now?',
  'Who are my top 5 customers by total spend?',
  'What is the average order value this week?',
  'Which products have never been ordered?',
  'How many reviews were submitted this month?',
  'What are the most wishlisted products?',
]

function uid() { return Math.random().toString(36).slice(2) }

export default function AdminAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const userMsg: Message = { id: uid(), role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant',
        content: data.answer || data.error || 'No response.',
        rows: data.rows || [],
        columns: data.columns || [],
      }])
    } catch {
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: 'Server error — please try again.' }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  function handleSubmit(e: FormEvent) { e.preventDefault(); send(input) }
  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }
  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const hasMessages = messages.length > 0

  return (
    <>
      <style>{`
        @keyframes msgSlide { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .ai-msg { animation: msgSlide 0.22s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes dot { 0%,80%,100%{opacity:.25;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        .ai-dot { width:6px;height:6px;border-radius:50%;background:#9ca3af;display:inline-block;animation:dot 1.2s infinite ease-in-out; }
        .ai-dot:nth-child(2){animation-delay:.15s}.ai-dot:nth-child(3){animation-delay:.3s}
        .ex-chip:hover { background:#f0ede8 !important; color:#0f0e0d !important; }
        .send-ai:not(:disabled):hover { background:#1a1a1a !important; }
        .ai-table { border-collapse:collapse; width:100%; font-size:0.75rem; }
        .ai-table th { background:#f5f4f1; color:#6b7280; text-transform:uppercase; font-size:0.62rem; letter-spacing:0.1em; padding:0.5rem 0.75rem; text-align:left; font-weight:700; border-bottom:1px solid #e5e2dc; }
        .ai-table td { padding:0.5rem 0.75rem; border-bottom:1px solid #f0ede8; color:#1a1a1a; }
        .ai-table tr:last-child td { border-bottom:none; }
        .ai-table tr:hover td { background:#faf9f7; }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 0px)', background:'#faf9f7' }}>

        {/* Header */}
        <div style={{ padding:'1.25rem 2rem', borderBottom:'1px solid #e5e2dc', background:'white', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'#0f0e0d', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#e5e2dc" stroke="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:'1rem', color:'#0f0e0d' }}>Ask Your Store</div>
              <div style={{ fontSize:'0.7rem', color:'#9ca3af' }}>Natural language analytics — powered by AI</div>
            </div>
          </div>
          {hasMessages && (
            <button
              onClick={() => setMessages([])}
              style={{ padding:'0.4rem 0.875rem', borderRadius:20, border:'1px solid #e5e2dc', background:'white', color:'#6b7280', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--font-dm-sans)' }}
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.5rem' }}>
          <div style={{ maxWidth:820, margin:'0 auto' }}>

            {!hasMessages && (
              <div style={{ textAlign:'center', paddingTop:'3rem', paddingBottom:'2rem' }}>
                <div style={{ width:64, height:64, borderRadius:18, background:'#0f0e0d', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e5e2dc" strokeWidth="1.5">
                    <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'1.75rem', fontWeight:700, color:'#0f0e0d', letterSpacing:'-0.02em', marginBottom:'0.5rem' }}>
                  Ask anything about your store
                </h2>
                <p style={{ color:'#9ca3af', fontSize:'0.875rem', marginBottom:'2.5rem', maxWidth:440, margin:'0 auto 2.5rem', lineHeight:1.65 }}>
                  Revenue, top products, customer behaviour, order status — get real answers from your live data in seconds.
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', justifyContent:'center', maxWidth:680, margin:'0 auto' }}>
                  {EXAMPLES.map(ex => (
                    <button key={ex} className="ex-chip" onClick={() => send(ex)} style={{ padding:'0.45rem 0.875rem', borderRadius:20, border:'1.5px solid #e5e2dc', background:'white', color:'#374151', fontSize:'0.78rem', cursor:'pointer', fontFamily:'var(--font-dm-sans)', transition:'all 0.15s' }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className="ai-msg" style={{ marginBottom:'1.5rem' }}>
                {msg.role === 'user' ? (
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <div style={{ maxWidth:'70%', padding:'0.75rem 1rem', borderRadius:'16px 4px 16px 16px', background:'#0f0e0d', color:'white', fontSize:'0.875rem', lineHeight:1.65, whiteSpace:'pre-wrap' }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:'#0f0e0d', flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#e5e2dc" stroke="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:'0.72rem', color:'#6b7280', marginBottom:'0.375rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>AI Analysis</div>
                      <div style={{ fontSize:'0.9rem', color:'#1a1a1a', lineHeight:1.75, marginBottom: msg.rows?.length ? '1rem' : 0 }}>
                        {msg.content}
                      </div>
                      {msg.rows && msg.rows.length > 0 && msg.columns && msg.columns.length > 0 && (
                        <div style={{ marginTop:'0.75rem', borderRadius:10, overflow:'hidden', border:'1.5px solid #e5e2dc', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                          <div style={{ overflowX:'auto' }}>
                            <table className="ai-table">
                              <thead>
                                <tr>{msg.columns.map(col => <th key={col}>{col.replace(/_/g,' ')}</th>)}</tr>
                              </thead>
                              <tbody>
                                {msg.rows.slice(0, 20).map((row, i) => (
                                  <tr key={i}>{msg.columns!.map(col => <td key={col}>{String(row[col] ?? '—')}</td>)}</tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {msg.rows.length > 20 && (
                            <div style={{ padding:'0.5rem 0.75rem', fontSize:'0.7rem', color:'#9ca3af', background:'#faf9f7', borderTop:'1px solid #e5e2dc' }}>
                              Showing 20 of {msg.rows.length} rows
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-msg" style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'#0f0e0d', flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#e5e2dc" stroke="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div style={{ paddingTop:8 }}>
                  <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                    <span className="ai-dot"/><span className="ai-dot"/><span className="ai-dot"/>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ padding:'1rem 1.5rem 1.25rem', background:'white', borderTop:'1px solid #e5e2dc', flexShrink:0 }}>
          <div style={{ maxWidth:820, margin:'0 auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:'0.625rem', background:'#faf9f7', border:'1.5px solid #e5e2dc', borderRadius:14, padding:'0.625rem 0.625rem 0.625rem 1rem', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}
                onFocusCapture={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='#9ca3af'; el.style.boxShadow='0 4px 18px rgba(0,0,0,0.08)' }}
                onBlurCapture={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='#e5e2dc'; el.style.boxShadow='0 2px 10px rgba(0,0,0,0.05)' }}
              >
                <textarea
                  ref={inputRef} rows={1} value={input}
                  onChange={e => { setInput(e.target.value); autoResize(e.target) }}
                  onKeyDown={handleKey}
                  placeholder="Ask anything — revenue, products, customers, orders…"
                  disabled={loading}
                  style={{ flex:1, border:'none', background:'transparent', fontSize:'0.875rem', fontFamily:'var(--font-dm-sans)', resize:'none', outline:'none', lineHeight:1.6, color:'#1a1a1a', minHeight:26, maxHeight:120, overflowY:'auto', paddingTop:2 }}
                />
                <button type="submit" className="send-ai" disabled={!input.trim() || loading} style={{ width:34, height:34, borderRadius:9, border:'none', background:!input.trim()||loading?'#e5e2dc':'#0f0e0d', color:'white', cursor:!input.trim()||loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </form>
            <p style={{ textAlign:'center', fontSize:'0.62rem', color:'#d1d5db', marginTop:'0.4rem' }}>
              Reads live Redleaf data · Never modifies your store · Enter to send
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
