import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/session'
import { rateLimit } from '@/lib/rate-limit'
import { can } from '@/lib/permissions'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !can(session.role, 'generateCopy')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rate limit: 10 generations per minute per IP
  const limited = rateLimit(req, 'gen-description', 10, 60_000)
  if (limited) return limited

  const { name, category, material, fit, price, badge, colors } = await req.json()
  if (!name) return NextResponse.json({ error: 'Product name required' }, { status: 400 })

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a copywriter for Redleaf — a premium fashion brand (est. 2024) built around quality over fast fashion. The brand voice is editorial, warm, slightly literary, and specific. Think Cos meets Net-a-Porter. No clichés ("timeless", "effortless", "versatile", "elevate").

Write product copy for this item:
- Name: ${name}
- Category: ${category || 'Fashion'}
${material  ? `- Material: ${material}` : ''}
${fit       ? `- Fit: ${fit}` : ''}
${price     ? `- Price: $${price}` : ''}
${badge     ? `- Badge: ${badge}` : ''}
${colors    ? `- Available in: ${colors}` : ''}

Return valid JSON only — no markdown:
{
  "subtitle": "A punchy, editorial one-liner. 8–12 words. Sell the feeling, not the feature.",
  "description": "2–3 sentences. Evocative and specific. Reference the material or construction if given. Make the reader want to own it."
}`,
      }],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw)
    return NextResponse.json({ subtitle: parsed.subtitle || '', description: parsed.description || '' })
  } catch (err) {
    console.error('generate-description error', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
