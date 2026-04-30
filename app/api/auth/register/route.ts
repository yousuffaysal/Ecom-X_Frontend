import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()])
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)
  const result = await query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'user') RETURNING id, email, name, role`,
    [email.toLowerCase().trim(), hash, name.trim()]
  )

  const user = result.rows[0]
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const res = NextResponse.json({ user }, { status: 201 })
  res.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return res
}
