import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'
import { rateLimit } from '@/lib/rate-limit'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SCHEMA = `
Redleaf fashion e-commerce PostgreSQL schema:

products(id UUID PK, slug TEXT, name TEXT, subtitle TEXT, description TEXT, price NUMERIC, original_price NUMERIC, material TEXT, fit TEXT, badge TEXT, featured BOOL, rating NUMERIC, review_count INT, stock_qty INT, created_at TIMESTAMPTZ)
categories(id UUID PK, name TEXT, slug TEXT)
orders(id UUID PK, user_id UUID, status TEXT [pending/confirmed/shipped/delivered], total NUMERIC, shipping_name TEXT, shipping_email TEXT, shipping_city TEXT, shipping_country TEXT, created_at TIMESTAMPTZ)
order_items(id UUID PK, order_id UUID FK→orders, product_id UUID FK→products, name TEXT, qty INT, price NUMERIC)
users(id UUID PK, name TEXT, email TEXT, role TEXT [user/admin], created_at TIMESTAMPTZ)
reviews(id UUID PK, product_id UUID FK→products, user_id UUID FK→users, rating INT 1-5, title TEXT, body TEXT, created_at TIMESTAMPTZ)
contact_messages(id UUID PK, name TEXT, email TEXT, subject TEXT, message TEXT, read BOOL, created_at TIMESTAMPTZ)
wishlist(id UUID PK, user_id UUID FK→users, product_id UUID FK→products, created_at TIMESTAMPTZ)
`.trim()

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rate limit: 30 queries per minute per admin IP
  const limited = rateLimit(req, 'admin-ai-chat', 30, 60_000)
  if (limited) return limited

  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()
    const question = messages[messages.length - 1]?.content || ''

    // Step 1: Generate safe SQL from the question
    const sqlRes = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system',
        content: `You are a PostgreSQL expert for a fashion e-commerce store. Convert the user's question into a safe, read-only SQL query.

${SCHEMA}

STRICT RULES:
- Only generate SELECT queries — never INSERT, UPDATE, DELETE, DROP, ALTER, or anything that modifies data
- Always add LIMIT 100 unless the question is a COUNT/SUM aggregation
- Use table aliases for clarity
- Return ONLY the raw SQL — no markdown, no backticks, no explanation`,
      }, { role: 'user', content: question }],
      temperature: 0.05,
      max_tokens: 600,
    })

    let sql = sqlRes.choices[0]?.message?.content?.trim() || ''
    sql = sql.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim()

    // Hard safety guard
    if (!/^SELECT/i.test(sql) || /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE)\b/i.test(sql)) {
      return NextResponse.json({
        answer: 'I can only read your store data — I cannot modify anything. Try asking about revenue, products, customers, or orders.',
        rows: [], columns: [], sql: '',
      })
    }

    // Step 2: Execute query
    let rows: Record<string, unknown>[] = []
    let columns: string[] = []
    let queryError = ''

    try {
      const result = await query(sql)
      rows    = result.rows
      columns = result.fields?.map((f: { name: string }) => f.name) || (rows[0] ? Object.keys(rows[0]) : [])
    } catch (err) {
      queryError = err instanceof Error ? err.message : 'Query failed'
    }

    // Step 3: Natural language answer
    const dataContext = queryError
      ? `The SQL query failed with error: ${queryError}. Apologize briefly and suggest rephrasing.`
      : rows.length === 0
      ? 'The query returned no results.'
      : `Query returned ${rows.length} row(s):\n${JSON.stringify(rows.slice(0, 30), null, 2)}`

    const answerRes = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a sharp business analyst for Redleaf, a premium fashion brand. Answer questions about store data concisely and insightfully. Use specific numbers. Be direct — no filler phrases. Max 3 sentences unless listing items.',
        },
        ...messages.slice(0, -1),
        {
          role: 'user',
          content: `Question: "${question}"\n\nData from database:\n${dataContext}\n\nGive a clear, specific business answer.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 512,
    })

    const answer = answerRes.choices[0]?.message?.content || 'I could not generate an answer — please try rephrasing.'

    return NextResponse.json({ answer, rows, columns, sql })
  } catch (err) {
    console.error('ai-chat error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
