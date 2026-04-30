import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || 'redleaf-secret-key-change-in-production'
  )

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login?redirect=' + encodeURIComponent(pathname), request.url)
      )
    }
    try {
      const { payload } = await jwtVerify(token, secret())
      if (!['admin', 'moderator', 'staff'].includes(payload.role as string)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login?redirect=' + encodeURIComponent(pathname), request.url)
      )
    }
    try {
      await jwtVerify(token, secret())
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*'],
}
