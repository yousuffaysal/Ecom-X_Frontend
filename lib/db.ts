import { Pool } from 'pg'

declare global { var pgPool: Pool | undefined }

const pool = globalThis.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },

  // Connection pool tuning for ~100k users on serverless
  max: 20,                    // max simultaneous connections (Neon supports up to 10k via pooler)
  min: 2,                     // keep 2 warm connections at idle
  idleTimeoutMillis: 20_000,  // release idle connections after 20s
  connectionTimeoutMillis: 5_000, // fail fast if no connection available in 5s
  allowExitOnIdle: true,      // let the process exit cleanly when idle
})

if (process.env.NODE_ENV !== 'production') globalThis.pgPool = pool

export const query = (text: string, params?: unknown[]) => pool.query(text, params)
export default pool

// ── DB Indexes ────────────────────────────────────────────────────────────────
// Run once per process startup. CREATE INDEX IF NOT EXISTS is idempotent and
// a no-op on subsequent calls — adds < 2ms overhead per cold start.
let indexesCreated = false

export async function ensureIndexes() {
  if (indexesCreated) return
  indexesCreated = true

  const indexes = [
    // Products — most common query patterns
    'CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(featured DESC, created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug)',
    'CREATE INDEX IF NOT EXISTS idx_products_created_at  ON products(created_at DESC)',

    // Orders — admin and user history lookups
    'CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status)',

    // Order items — joins from orders and velocity queries
    'CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id)',
    'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)',

    // Reviews
    'CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_reviews_user_id    ON reviews(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC)',

    // Wishlist
    'CREATE INDEX IF NOT EXISTS idx_wishlist_user_id    ON wishlist(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id)',

    // Users
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role)',

    // Contact messages
    'CREATE INDEX IF NOT EXISTS idx_contact_messages_read       ON contact_messages(read)',
    'CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC)',

    // Push Subscriptions
    `CREATE TABLE IF NOT EXISTS push_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    'CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id)',

    // Notifications History
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- null for broadcast/everyone
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      url TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)',
  ]

  // Run all index creations in parallel — each is a DDL no-op if the index exists
  await Promise.all(indexes.map(sql => pool.query(sql).catch(err =>
    console.warn('Index creation skipped:', err.message)
  )))
}

// Kick off index creation in the background on module load — does not block requests
ensureIndexes().catch(err => console.error('ensureIndexes error:', err))
