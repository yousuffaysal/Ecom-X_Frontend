import { SignJWT, jwtVerify } from 'jose'

export type Role = 'admin' | 'moderator' | 'staff' | 'user'

export type JWTPayload = {
  userId: string
  email: string
  role: Role
  name: string
}

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || 'redleaf-secret-key-change-in-production'
  )

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret())
  return payload as unknown as JWTPayload
}
