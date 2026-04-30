import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || secretKey === 'sk_test_placeholder') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' })

  const { amount, currency = 'usd' } = await req.json()
  if (!amount || amount < 50) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: session.userId },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
