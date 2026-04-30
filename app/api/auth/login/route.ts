import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const result = await query(
    'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  )

  const user = result.rows[0]
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })

  res.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return res
}
