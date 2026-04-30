-- Redleaf Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  price         NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  badge         VARCHAR(20) CHECK (badge IN ('Sale','New') OR badge IS NULL),
  material      TEXT,
  fit           VARCHAR(255),
  bg            VARCHAR(100) DEFAULT 'oklch(0.93 0.03 27)',
  featured      BOOLEAN DEFAULT false,
  rating        NUMERIC(3,2) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  label      VARCHAR(100) DEFAULT 'Image',
  position   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCT COLORS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_colors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  hex        VARCHAR(20) NOT NULL,
  position   INTEGER DEFAULT 0
);

-- ─── PRODUCT SIZES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_sizes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       VARCHAR(20) NOT NULL,
  available  BOOLEAN DEFAULT true,
  position   INTEGER DEFAULT 0
);

-- ─── PRODUCT SPECS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_specs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key        VARCHAR(100) NOT NULL,
  value      TEXT NOT NULL,
  position   INTEGER DEFAULT 0
);

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title      VARCHAR(255),
  body       TEXT,
  verified   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

-- ─── CART ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100),
  size       VARCHAR(20),
  qty        INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id, color_name, size)
);

-- ─── WISHLIST ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  status           VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  subtotal         NUMERIC(10,2) NOT NULL,
  shipping_cost    NUMERIC(10,2) DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  shipping_name    VARCHAR(255),
  shipping_email   VARCHAR(255),
  shipping_address TEXT,
  shipping_city    VARCHAR(255),
  shipping_country VARCHAR(255),
  shipping_zip     VARCHAR(20),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  color_name   VARCHAR(100),
  size         VARCHAR(20),
  qty          INTEGER NOT NULL,
  price        NUMERIC(10,2) NOT NULL
);

-- ─── NEWSLETTER ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUTO-UPDATE RATING TRIGGER ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating       = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_rating ON reviews;
CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();
