type Entry<T> = { data: T; expiresAt: number }

class MemoryCache {
  private store = new Map<string, Entry<unknown>>()

  get<T>(key: string): T | null {
    const e = this.store.get(key)
    if (!e) return null
    if (Date.now() > e.expiresAt) { this.store.delete(key); return null }
    return e.data as T
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  del(key: string): void { this.store.delete(key) }

  // Purge all expired entries (call periodically if needed)
  purge(): void {
    const now = Date.now()
    for (const [k, e] of this.store) if (now > e.expiresAt) this.store.delete(k)
  }
}

// Process-level singleton — survives across requests in the same Node process
declare global { var _memCache: MemoryCache | undefined }
export const cache = globalThis._memCache ?? new MemoryCache()
if (process.env.NODE_ENV !== 'production') globalThis._memCache = cache
