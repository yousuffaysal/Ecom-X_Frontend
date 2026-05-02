import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { rateLimit } from '@/lib/rate-limit'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

type Message = { role: 'user' | 'assistant'; content: string }

async function buildOrderContext(userId: string, name: string, email: string): Promise<string> {
  const { rows } = await query(
    `SELECT
       o.id, o.status, o.total, o.created_at,
       o.shipping_city, o.shipping_country,
       json_agg(json_build_object(
         'name', oi.product_name,
         'qty',  oi.qty,
         'price', oi.price,
         'color', oi.color_name,
         'size',  oi.size
       ) ORDER BY oi.id) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT 5`,
    [userId]
  )

  if (!rows.length) {
    return `\n\nCUSTOMER: ${name} (${email}) — authenticated, no orders placed yet.`
  }

  const orderLines = rows.map(o => {
    const items = (o.items as Array<{ name: string; qty: number; price: number; color?: string; size?: string }> || [])
      .map(i => `  • ${i.name} ×${i.qty} — $${Number(i.price).toFixed(2)}${i.color ? ` | ${i.color}` : ''}${i.size ? ` | Size ${i.size}` : ''}`)
      .join('\n')
    const dest = [o.shipping_city, o.shipping_country].filter(Boolean).join(', ')
    return [
      `Order #${(o.id as string).slice(-8).toUpperCase()} | ${o.status.toUpperCase()} | $${Number(o.total).toFixed(2)} | ${new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}${dest ? ` | Ships to ${dest}` : ''}`,
      items,
    ].join('\n')
  }).join('\n\n')

  return `\n\nCUSTOMER: ${name} (${email}) — authenticated.\nRECENT ORDERS:\n${orderLines}`
}

const SYSTEM_BASE = `You are a customer support agent for Redleaf, a premium fashion brand. Be warm, direct, and efficient — resolve issues in as few words as possible.

POLICIES:
• Returns: 30-day window from delivery. Items must be unworn with original tags attached. Refunds in 5–7 business days.
• Exchanges: Free size/colour exchanges within 30 days. Direct customers to /contact or support@redleaf.com.
• Shipping: Free standard shipping on orders over $150. Standard 5–7 days. Express 2–3 days ($14.99). International available.
• Warranty: 2-year manufacturing guarantee on all pieces — repair or replace, no receipt needed.
• Sizing: True to size. Size guide on every product page. Size up for outerwear when unsure.
• Payment: Visa, Mastercard, Amex, PayPal — all Stripe-secured.
• Account & order tracking: /account
• Sustainability: Carbon-neutral shipping. Responsible sourcing. Lifetime repair service available.

ESCALATION — for anything you can't fully resolve (payment disputes, complex returns, warranty claims), direct the customer to /contact or support@redleaf.com.

RULES:
- No filler openers ("Of course!", "Great question!") — get straight to the answer
- Use the customer's order data (if provided below) to give specific answers about their orders
- If a customer asks about an order but isn't logged in, tell them to log in at /auth/login or visit /account
- Never invent order details not present in the data
- Keep answers under 4 sentences unless listing multiple items
- Always offer a concrete next step`

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'support', 20, 60_000)
  if (limited) return limited

  try {
    const { messages }: { messages: Message[] } = await req.json()
    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const session = await getSession()

    let orderContext = ''
    if (session?.userId) {
      orderContext = await buildOrderContext(
        session.userId as string,
        session.name as string || '',
        session.email as string || ''
      )
    }

    const systemPrompt = SYSTEM_BASE + orderContext

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.35,
      max_tokens: 512,
    })

    const reply =
      completion.choices[0]?.message?.content ||
      "Something went wrong on my end. Please try again or reach us at /contact."

    return NextResponse.json({ message: reply, authenticated: !!session })
  } catch (err) {
    console.error('support route error', err)
    return NextResponse.json({ error: 'Service error' }, { status: 500 })
  }
}
