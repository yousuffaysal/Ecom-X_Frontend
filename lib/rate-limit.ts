import { NextRequest, NextResponse } from 'next/server'

type Bucket = { count: number; resetAt: number }

class RateLimiter {
  private store = new Map<string, Bucket>()

  check(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
    const now = Date.now()
    const bucket = this.store.get(key)

    if (!bucket || now > bucket.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs })
      return { ok: true, retryAfter: 0 }
    }

    if (bucket.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
    }

    bucket.count++
    return { ok: true, retryAfter: 0 }
  }
}

declare global { var _rateLimiter: RateLimiter | undefined }
const limiter = globalThis._rateLimiter ?? new RateLimiter()
if (process.env.NODE_ENV !== 'production') globalThis._rateLimiter = limiter

// Extract a meaningful key from the request (IP or forwarded IP)
function getKey(req: NextRequest, prefix: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  return `${prefix}:${ip}`
}

// Returns a 429 response if rate-limited, otherwise null
export function rateLimit(
  req: NextRequest,
  prefix: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const { ok, retryAfter } = limiter.check(getKey(req, prefix), limit, windowMs)
  if (ok) return null
  return NextResponse.json(
    { error: `Too many requests. Please wait ${retryAfter}s before trying again.` },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
      },
    }
  )
}
