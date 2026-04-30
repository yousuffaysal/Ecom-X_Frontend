# Redleaf — AI-Powered Premium Fashion E-Commerce Platform

> A full-stack, production-grade e-commerce platform built with Next.js 14, PostgreSQL, and Groq AI. Redleaf goes beyond a standard online store by embedding AI at every layer — from the storefront to the admin panel.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Live Features](#live-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Database Schema](#database-schema)
8. [AI Features Deep Dive](#ai-features-deep-dive)
9. [Authentication & Security](#authentication--security)
10. [Admin Panel](#admin-panel)
11. [Interview Questions & Answers](#interview-questions--answers)

---

## Project Overview

Redleaf is a premium fashion brand e-commerce platform (Spring/Summer 2026 collection) built from scratch as a full-stack application. The project started as a static HTML prototype and was converted to a Next.js 14 App Router application with a live PostgreSQL database, AI integrations, payment processing, cloud image storage, and a comprehensive admin panel.

The defining characteristic of Redleaf is its **AI-first admin experience** — features that platforms like Shopify, Wix, or WordPress cannot replicate without expensive third-party plugins, because they require direct access to your live database combined with language model reasoning in real time.

---

## Live Features

### Storefront

| Feature | Description |
|---|---|
| **Hero Section** | Full-viewport split-layout hero with animated scroll hint |
| **Video Hero** | Apple-style scroll-driven zoom section — rounded card, narrow margin, 160vh sticky effect |
| **Shop by Category** | Dynamic category grid pulled from DB with images |
| **Featured Products** | Admin-flagged products displayed in a 4-column grid |
| **Product Detail Page** | Gallery with thumbnails, colour swatches, size selector, quantity picker, wishlist, accordion specs, trust badges |
| **AI Review Insights** | Per-product AI-generated summary card above raw reviews (pros, cons, fit consensus, who it suits) |
| **Search & Filter** | Category filtering, sorting, and search on the /shop page |
| **Wishlist** | Auth-gated, persistent wishlist stored in DB |
| **Shopping Cart** | Slide-over cart drawer with qty controls, persistent across session |
| **Checkout** | Multi-step form: shipping → payment → confirm. Pre-fills from user profile |
| **Payment Methods** | Cash on Delivery (COD) always available; Stripe card payment when configured |
| **Order Confirmation** | Post-purchase order summary page |
| **User Authentication** | Register, login, JWT cookie session, role-based access |
| **Account Page** | View + edit profile (name, phone, address, city, zip, country) |
| **Order History** | Per-order progress bar (Ordered → Processing → Shipped → Delivered), expected delivery date, itemised breakdown |
| **Premium Invoice** | Brand-aligned printable PDF receipt with dark header, red gradient accent, Bill To / Ship To / Delivery columns |
| **Newsletter** | Email capture stored in DB |
| **Testimonials** | Auto-rotating customer quotes |
| **Editorial Lookbook** | Hover-reveal lookbook grid |
| **AI Style Advisor** | Dedicated /style-advisor page — ChatGPT-style chat with Aria, live product catalog context, starter question chips |
| **Contact Page** | Contact form stored in DB, readable by admin |

### Admin Panel (`/admin`)

| Feature | Description |
|---|---|
| **Overview Dashboard** | Revenue, orders, users, messages at a glance |
| **Products** | Full CRUD — create, edit, delete. Image upload via Cloudinary, colour swatches, sizes, specs, badges |
| **AI Description Generator** | One-click button in product form generates brand-voice subtitle + description using Groq |
| **Categories** | Create and manage product categories with images |
| **Orders** | Full order list, expandable detail, 3-column receipt view, one-click premium PDF invoice |
| **CSV Export** | Download weekly / monthly / yearly order data as CSV |
| **Users** | View all users, promote/demote roles (user ↔ admin) |
| **Messages** | Read contact form submissions, mark as read/unread, delete |
| **Smart Review Insights** | Per-product AI insight generation button; purple ✦ badge shows which products have summaries |
| **Ask Your Store (AI Chat)** | Natural language query interface — ask anything, AI converts to SQL, executes, and explains results in plain English |
| **Smart Restock Alerts** | 30-day velocity tracking per product, days-left prediction, inline stock quantity editing, risk tier badges |
| **Customer Intelligence (CLV)** | RFM-based CLV scoring for every customer, tier segmentation (Champion → Lost), AI-generated retention strategy for top 5 |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14 (App Router) | Full-stack React framework, server + client components, API routes |
| **React** | 18 | UI component library |
| **TypeScript** | 5 | Static typing throughout — components, API handlers, DB queries |
| **CSS (Custom)** | — | No Tailwind; fully hand-crafted CSS with CSS custom properties (variables) |
| **Playfair Display** | Google Fonts | Editorial serif — headings, product names, prices |
| **DM Sans** | Google Fonts | Clean sans-serif — body text, UI elements |

### Backend (API Routes — all in `/app/api/`)

| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Serverless functions co-located with the frontend (App Router `route.ts` files) |
| **Node.js** | Runtime for server-side logic |
| **`pg` (node-postgres)** | PostgreSQL client with connection pool singleton |

### Database

| Technology | Details |
|---|---|
| **PostgreSQL** | Relational DB — all business data (products, orders, users, reviews, wishlist, etc.) |
| **Neon** | Serverless PostgreSQL hosting (connection pooling, SSL, auto-scaling) |
| **Schema evolution** | `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pattern — zero-downtime, no migration files |

### AI & Language Models

| Technology | Purpose |
|---|---|
| **Groq SDK** (`groq-sdk`) | Fast LLM inference — sub-second response times |
| **`llama-3.3-70b-versatile`** | Primary model for all AI features (70B parameter Llama 3.3 via Groq) |
| **`response_format: json_object`** | Structured JSON output for Review Insights, Description Generator, CLV insights |
| **Text-to-SQL pipeline** | AI Chat converts natural language → safe SELECT SQL → executes → explains in English |

### Authentication

| Technology | Details |
|---|---|
| **JWT (JSON Web Tokens)** | Stateless authentication — signed tokens stored in httpOnly cookies |
| **`jose`** | Edge-compatible JWT library (sign, verify) |
| **httpOnly cookies** | Prevents XSS access to tokens from client JavaScript |
| **Role-based access** | `role: 'user' | 'admin'` column on users table; admin routes check session role |

### Payments

| Technology | Details |
|---|---|
| **Stripe** | Card payment processing (test mode); conditionally shown only when real keys are configured |
| **`@stripe/stripe-js`** | Client-side Stripe.js integration |
| **`stripe`** | Server-side Stripe Node SDK |
| **COD (Cash on Delivery)** | Always-available payment option; no external dependency |

### Media & Storage

| Technology | Details |
|---|---|
| **Cloudinary** | Cloud image storage and CDN — product images, category images |
| **Multipart upload** | `/api/upload` route accepts `multipart/form-data`, streams to Cloudinary |

### Deployment & Infrastructure

| Technology | Details |
|---|---|
| **Vercel** (recommended) | Zero-config Next.js deployment with edge functions |
| **Environment variables** | `.env.local` for all secrets — DB URL, JWT secret, API keys |

---

## Project Structure

```
redleaf-nextjs/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout (fonts, nav, cart)
│   ├── globals.css                 # Global CSS + custom properties
│   ├── shop/page.tsx               # Shop listing with filter/sort
│   ├── product/[id]/page.tsx       # Product detail page
│   ├── checkout/page.tsx           # Checkout flow
│   ├── receipt/[orderId]/page.tsx  # Printable PDF invoice
│   ├── style-advisor/page.tsx      # AI Stylist chat (Aria)
│   ├── account/
│   │   ├── page.tsx                # Profile view + edit
│   │   └── orders/page.tsx         # Order history + tracking
│   ├── auth/
│   │   ├── login/                  # Login page
│   │   └── register/               # Register page
│   ├── admin/
│   │   ├── layout.tsx              # Admin sidebar layout
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── products/               # Product CRUD
│   │   ├── categories/             # Category management
│   │   ├── orders/page.tsx         # Order management + CSV export
│   │   ├── users/page.tsx          # User management
│   │   ├── messages/page.tsx       # Contact messages
│   │   ├── ai-chat/page.tsx        # Ask Your Store AI chat
│   │   ├── restock/page.tsx        # Smart Restock Alerts
│   │   └── customers/page.tsx      # Customer CLV Intelligence
│   └── api/
│       ├── products/               # GET /POST products, GET /PUT /DELETE [id]
│       │   └── [id]/
│       │       ├── reviews/        # GET /POST reviews
│       │       └── summarize/      # POST — AI review summary
│       ├── categories/             # CRUD categories
│       ├── orders/                 # POST order, GET [id]
│       ├── auth/                   # login, register, logout, me
│       ├── profile/                # GET /PATCH user profile
│       ├── wishlist/               # GET /POST /DELETE
│       ├── cart/                   # Cart persistence
│       ├── upload/                 # Cloudinary image upload
│       ├── newsletter/             # Email capture
│       ├── contact/                # Contact form
│       ├── style-advisor/          # Aria AI chat endpoint
│       └── admin/
│           ├── ai-chat/            # Ask Your Store (text-to-SQL)
│           ├── generate-description/ # AI product copywriting
│           ├── restock/            # Inventory velocity + PATCH stock_qty
│           ├── clv/                # Customer Lifetime Value
│           └── export/             # CSV data export
├── components/
│   ├── Nav.tsx                     # Top navigation bar
│   ├── CartDrawer.tsx              # Slide-over cart
│   ├── ProductCard.tsx             # Reusable product card
│   ├── Stars.tsx                   # Star rating component
│   └── VideoHero.tsx               # Scroll-zoom video section
├── lib/
│   ├── db.ts                       # PostgreSQL pool singleton
│   ├── session.ts                  # JWT session helpers
│   ├── AuthContext.tsx             # React auth context + provider
│   ├── CartContext.tsx             # React cart context + provider
│   └── data.ts                     # Static data (testimonials, etc.)
└── public/                         # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon recommended for serverless)
- Groq API key (free at [console.groq.com](https://console.groq.com))
- Cloudinary account (free tier sufficient)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd redleaf-nextjs

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your values (see Environment Variables section)

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

The first request to any API route that touches the database will auto-create all required tables and columns — no manual migration step needed.

---

## Environment Variables

```env
# Database — Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Authentication — long random string, keep secret
JWT_SECRET=your-very-long-random-secret-string

# Cloudinary — for product/category image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI — all AI features (style advisor, review insights, admin tools)
GROQ_API_KEY=gsk_your_groq_api_key

# Stripe — optional; COD is always available without this
STRIPE_SECRET_KEY=sk_test_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Schema

All tables are created automatically on first use via `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` patterns. No migration files required.

```sql
-- Core tables
users           (id, name, email, password_hash, role, phone, address, city, country, zip, created_at)
categories      (id, name, slug, description, image_url, created_at)
products        (id, slug, name, subtitle, description, category_id, price, original_price,
                 material, fit, badge, bg, featured, rating, review_count,
                 stock_qty, review_summary JSONB, created_at)

-- Product variants & media
product_images  (id, product_id, url, label, position)
product_colors  (id, product_id, name, hex, position)
product_sizes   (id, product_id, size, available, position)
product_specs   (id, product_id, key, value, position)

-- Commerce
orders          (id, user_id, status, total, shipping_name, shipping_email,
                 shipping_phone, shipping_address, shipping_city, shipping_country,
                 shipping_zip, payment_method, created_at)
order_items     (id, order_id, product_id, name, qty, price)

-- Community
reviews         (id, product_id, user_id, rating, title, body, verified, created_at)
wishlist        (id, user_id, product_id, created_at)
newsletter      (id, email, created_at)
contact_messages(id, name, email, subject, message, read, created_at)
```

**Design decisions:**
- UUIDs for all primary keys (no integer sequences — safe for distributed environments)
- `review_summary JSONB` on products stores the AI-generated insights object — generated once, queried instantly
- `stock_qty INT` on products enables velocity-based restock prediction
- Soft deletes not used — admin confirmation dialogs protect against accidental deletion

---

## AI Features Deep Dive

### 1. Aria — AI Style Advisor (`/style-advisor`)

**How it works:**
1. On each request, the backend fetches up to 60 products from the DB with full details (colors, sizes, images, price)
2. Products are serialised into a structured text catalog injected into the system prompt
3. Groq's `llama-3.3-70b-versatile` responds with `{ message, product_slugs }` JSON
4. The API resolves slugs → full product rows and returns them alongside the message
5. The UI renders Aria's response and product cards in a ChatGPT-style thread

**Why this is different from standard product search:**
Aria understands context. "I need something for a rainy Edinburgh wedding, I'm the mother of the bride, budget around $300" is processed semantically — not keyword-matched.

---

### 2. Smart Review Insights (per product)

**How it works:**
1. When a review is submitted (POST `/api/products/[id]/reviews`), the route fire-and-forgets `regenerateSummary()`
2. The function fetches all reviews for the product (up to 80)
3. Sends them to Groq with a structured prompt requesting `{ summary, pros, cons, fit, who_for }`
4. Result is stored as JSONB in `products.review_summary`
5. Served instantly on every subsequent product page load (no AI call at read time)
6. Admin can manually regenerate from the Products page with the ✦ button

**Cost model:** One AI call per review submitted (fire-and-forget). After that, zero AI cost for reading the summary. Extremely cheap at scale.

---

### 3. Ask Your Store — Admin AI Chat

**Two-stage pipeline:**

**Stage 1 — Text to SQL:**
```
User question → Groq (schema context + strict SELECT-only rules) → Raw SQL
```

**Stage 2 — SQL to Answer:**
```
SQL → Execute against live DB → Rows → Groq (data context) → Natural language answer
```

**Safety measures:**
- Hard regex check: SQL must start with `SELECT` and contain no `INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE/CREATE`
- Results capped at 100 rows
- Admin-only route (session role check)
- Read-only PostgreSQL user recommended for production

---

### 4. AI Product Description Generator

Triggered by the "Generate with AI" button in the product form. Sends the product's name, category, material, fit, price, badge, and colours to Groq with a brand-voice prompt calibrated to Redleaf's editorial tone (think Cos meets Net-a-Porter). Returns `{ subtitle, description }` which populate the form fields instantly.

---

### 5. Smart Restock Alerts

**Velocity calculation (no AI — pure SQL):**
```sql
SUM(order_items.qty) / 30.0 AS daily_velocity   -- units per day over last 30 days
stock_qty / daily_velocity   AS days_left        -- predicted stockout
```

**Risk tiers:**
- 🔴 Critical — stock = 0, OR days_left ≤ 7
- 🟡 Low Stock — days_left ≤ 21
- 🟢 Healthy — days_left > 21
- ⚪ No Data — stock_qty not yet set by admin

---

### 6. Customer Lifetime Value (CLV)

**RFM scoring model (weighted):**

| Signal | Weight | Formula |
|---|---|---|
| Recency | 30% | `max(0, 100 - days_since_last_order)` |
| Frequency | 25% | `min(100, order_count × 20)` |
| Monetary | 30% | `min(100, total_spend / 10)` |
| Longevity | 15% | `min(100, days_since_first_order / 3.65)` |

**Tiers:** Champion → Loyal → Promising → New → Occasional → At Risk → Lost → Prospect

AI generates a one-sentence personalised retention strategy for the top 5 customers by spend (single Groq call for all 5 at once).

---

## Authentication & Security

- Passwords are hashed with **bcrypt** before storage — plaintext never touches the DB
- JWTs are signed with HS256 using a secret key and stored in **httpOnly, Secure, SameSite=Strict** cookies — inaccessible to client-side JavaScript (XSS protection)
- All admin routes verify `session.role === 'admin'` server-side on every request
- All SQL queries use **parameterised queries** (`$1, $2, ...` placeholders) — immune to SQL injection
- Stripe keys are validated at runtime — card payment option is hidden entirely when placeholder keys are detected
- The AI Chat enforces a hard regex guard against non-SELECT SQL before execution

---

## Admin Panel

Access at `/admin` (requires admin role). The sidebar is split into standard tools and an **AI Tools** section (marked with a red dot indicator):

**Standard:** Overview · Products · Categories · Orders · Users · Messages

**AI Tools:** Customers (CLV) · Restock Alerts · Ask AI

All admin pages are protected by the layout — unauthenticated or non-admin users are redirected to `/auth/login` via `useEffect` on the client, and all API routes double-check the session server-side.

---

## Interview Questions & Answers

These 20 questions are derived directly from architectural decisions made in this project. Each answer references specific implementation details.

---

### Q1. Why did you choose Next.js App Router over Pages Router for this project?

**Answer:** The App Router enables co-located server components — components that fetch data directly from the database without an intermediate API call. For example, the admin dashboard and product listing pages can stream data from PostgreSQL without client-side `useEffect` + loading spinners. It also allows route handlers (`route.ts`) to live alongside page files, keeping related code in one directory. The new layouts system (`layout.tsx`) made it trivial to share the admin sidebar across all `/admin/*` routes without prop drilling.

---

### Q2. How does the authentication system work end-to-end?

**Answer:** On login, the server validates credentials (bcrypt compare), creates a JWT signed with `jose` containing `{ userId, role, name, email }`, and sets it as an httpOnly cookie with `SameSite=Strict`. On every subsequent request, the `getSession()` helper verifies and decodes the JWT from the cookie. Using httpOnly cookies means the token is invisible to JavaScript — XSS attacks cannot steal it. Role checks happen server-side in every API route, so the client cannot bypass them by modifying JavaScript.

---

### Q3. How do you prevent SQL injection?

**Answer:** Every database query uses parameterised statements through the `pg` library. Instead of string interpolation (`WHERE id = '${id}'`), we use placeholders (`WHERE id = $1`) with values passed as a separate array (`query(sql, [id])`). The driver serialises and escapes values at the protocol level before they reach PostgreSQL — the SQL structure is fixed and user input cannot break out of the value context.

---

### Q4. Explain the fire-and-forget pattern used in the review summary feature.

**Answer:** When a user submits a review, we immediately return a `201` response — the user experience is instant. In parallel, we call `regenerateSummary()` without `await`. This function fetches all reviews, calls Groq, and updates `products.review_summary`. If it fails, the review still saved and we retry next time a review is submitted. The key trade-off: the summary may be slightly stale for a few seconds after submission, but the user never waits for an AI call. This is acceptable because summaries are informational, not transactional.

---

### Q5. How does the AI Chat (text-to-SQL) work, and what stops it from running destructive queries?

**Answer:** The pipeline has two stages. First, we send the natural language question to Groq with a strict system prompt containing the DB schema and a rule to only generate SELECT queries. Second, we apply a hard server-side regex guard: `if (!/^SELECT/i.test(sql) || /\b(INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(sql))` — any non-SELECT SQL is rejected before touching the database. This double layer (AI instruction + programmatic guard) ensures the feature remains read-only even if the model misbehaves.

---

### Q6. Why is `review_summary` stored as JSONB in PostgreSQL instead of a separate table?

**Answer:** The summary is always fetched as part of the product — there's no scenario where you want one without the other. A separate table would require a JOIN on every product fetch. JSONB stores the structured AI output (`{ summary, pros, cons, fit, who_for, review_count, generated_at }`) natively queryable in PostgreSQL, and since the product route already does `SELECT p.*`, the summary comes along for free with zero extra queries.

---

### Q7. How did you handle database schema evolution without migration files?

**Answer:** Every API route that introduces a new column runs `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` on first execution. PostgreSQL's `IF NOT EXISTS` makes this idempotent — it's a no-op on subsequent calls and fast enough that it doesn't meaningfully impact response time. This approach trades migration management overhead for simplicity, which is appropriate for a single-developer project. In a team environment, proper migration tooling (Prisma Migrate, Flyway, etc.) would be better.

---

### Q8. How does the scroll-zoom video section work technically?

**Answer:** The outer wrapper is `height: 300vh` with `position: relative`. Inside it is a `position: sticky; top: 0; height: 100vh` element — this "pins" the video while you scroll through the 300vh container. A `scroll` event listener (passive, non-blocking) calculates `progress = (-containerTop) / (containerHeight - windowHeight)` — a 0→1 value. We apply `transform: scale(1 + (1 - progress) * 0.35)` directly to the DOM element via `ref` — no React state updates, so there's no re-render on every scroll event, giving smooth 60fps animation.

---

### Q9. Why did you choose Groq over OpenAI or Anthropic for the AI features?

**Answer:** Groq's inference hardware (LPU — Language Processing Unit) delivers dramatically faster token generation than GPU-based providers — typically under 500ms for a full response versus 2–5 seconds with OpenAI. For a real-time chat interface (Style Advisor) and interactive admin tools, this latency difference is the user experience. The `llama-3.3-70b-versatile` model is capable enough for all use cases in this project (structured JSON output, text-to-SQL, copywriting, analysis). Groq also has a generous free tier.

---

### Q10. How does the Customer Lifetime Value scoring work?

**Answer:** We implement an RFM (Recency, Frequency, Monetary) model extended with Longevity. A single SQL query computes four raw metrics per customer: days since last order, total order count, total spend, and customer age in days. We then normalise each to a 0–100 score and apply weighted averaging: Recency 30%, Frequency 25%, Monetary 30%, Longevity 15%. The weights reflect that spending behaviour and recency are the strongest predictors of future value. Customers are then assigned to tiers (Champion, Loyal, etc.) based on combined threshold rules applied to the raw metrics.

---

### Q11. How is the cart implemented — is it server-side or client-side?

**Answer:** The cart is managed in React context (`CartContext.tsx`) as client-side state, persisted to `localStorage`. This was a deliberate choice: cart state needs to be instantly reactive (add/remove without page reloads), and it doesn't require authentication — a guest should be able to add to cart and checkout. The cart is a simple array of `{ id, name, price, qty, selectedColor, selectedSize }` objects. At checkout, the cart contents are sent to the server and validated against the live product database before the order is created.

---

### Q12. How does the print/PDF receipt work without a PDF library?

**Answer:** We use the browser's native `window.print()` triggered by a button click. The challenge is isolating only the receipt from the full page. The standard approach of `display: none` on `body` children breaks because child elements can't override it with `display: block`. Instead, we use `visibility: hidden` on `body *` (which makes everything invisible but preserves layout) and then `visibility: visible` on `#receipt-root, #receipt-root *` (which makes only the receipt visible). We add `position: absolute; top: 0; left: 0` on the receipt so it occupies the print canvas correctly. `print-color-adjust: exact` preserves dark backgrounds in the PDF output.

---

### Q13. How does Cloudinary image upload work in this project?

**Answer:** The admin product form sends images as `multipart/form-data` to `/api/upload`. The route handler reads the file from the form data, converts it to a Buffer, and streams it to Cloudinary using the SDK's `upload_stream` API. Cloudinary returns a CDN URL that we store in the `product_images` table. The front end receives the URL and displays the image immediately — no local file storage is involved. Cloudinary also handles resizing, format conversion (WebP), and CDN caching automatically.

---

### Q14. Why are there no Tailwind or UI component libraries used?

**Answer:** The entire UI is built with hand-crafted CSS using custom properties (variables). This gives complete control over the design system — every spacing value, colour, border radius, and animation is deliberate. The brand aesthetic (editorial, premium, fashion-forward) requires precise control that utility-first frameworks make harder, not easier. Custom properties like `--red`, `--ink`, `--border`, `--nav-h` propagate consistently across all components. The trade-off is more CSS to write; the benefit is a design that looks genuinely distinctive rather than like a Tailwind template.

---

### Q15. How does role-based access control work for the admin panel?

**Answer:** It operates at three layers. First, the admin layout (`app/admin/layout.tsx`) checks `user.role !== 'admin'` client-side and redirects to login — this handles the user experience. Second, every admin API route calls `getSession()` and checks `session.role !== 'admin'`, returning a `403 Forbidden` if the check fails — this is the actual security layer. Third, sensitive operations (promoting a user to admin, deleting products) additionally verify the session to ensure the client can't bypass the check by crafting a direct API call with a stolen user-level token.

---

### Q16. What is the `getSession()` function and why is it important?

**Answer:** `getSession()` is a server-side helper in `lib/session.ts` that reads the `session` cookie from the current request, verifies the JWT signature using the `JWT_SECRET`, and returns the decoded payload `{ userId, role, name, email }` or `null` if invalid/expired. It's called at the top of every protected API route. The critical property is that it runs **server-side** — the client cannot fake a session by manipulating JavaScript or cookies, because the JWT must be cryptographically valid with the server's secret key.

---

### Q17. How does the Smart Restock velocity calculation handle products with no recent orders?

**Answer:** The SQL uses a `LEFT JOIN` from products to order_items, filtered to the last 30 days. Products with zero recent orders get `SUM(qty) = 0` and `daily_velocity = 0`. In the application layer, `daysLeft = stock && velocity > 0 ? Math.floor(stock / velocity) : null` — we only compute days-left when there's a positive velocity. Products with stock set but zero velocity show `—` in the days-left column and get the `healthy` risk tier (no demand, no urgency). Products with no `stock_qty` set at all get the `no-stock-data` tier, prompting the admin to set a value.

---

### Q18. What architectural pattern is used for the AI Style Advisor, and why?

**Answer:** We use **retrieval-augmented generation (RAG)** — but with the full catalog as context rather than a vector search. On every request, we fetch up to 60 products from the DB and format them as structured text injected into the system prompt. This means Aria always has current, accurate product data without embedding infrastructure. The trade-off: system prompt size grows with catalog size (around 4,000–8,000 tokens for 60 products). For catalogs over a few hundred products, a vector similarity search (pgvector, Pinecone) would be needed. For this catalog size, the simpler approach is faster, cheaper, and more accurate.

---

### Q19. How do you handle the case where Stripe is not configured?

**Answer:** At checkout page load, we attempt to initialise Stripe with `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`. We detect placeholder keys by checking if the key starts with `pk_test_placeholder`. If so, `stripeConfigured = false`, the card option is filtered out of the `PAY_OPTIONS` array entirely, and the default payment method is set to `cod`. The user never sees a broken payment option — COD is always available and the card option simply doesn't exist when Stripe isn't configured. This makes the app fully functional in development without Stripe credentials.

---

### Q20. If you were to scale this project to 100,000 users, what would you change first?

**Answer:** Three changes in priority order:

**1. Add a caching layer.** The AI style advisor fetches 60 products on every request — cache this catalog for 5 minutes in Redis or Vercel KV. Most admin analytics queries are also cacheable for 1–5 minutes.

**2. Move AI calls to a background job queue.** The review summarisation fires in-process. At scale, this risks request timeouts and wastes serverless function execution time. Move to a job queue (BullMQ, Inngest) so AI calls run asynchronously and reliably.

**3. Add database read replicas.** The Neon connection pool handles moderate load, but analytics queries (CLV, restock, AI chat SQL) are expensive full-table scans. Route read-heavy admin queries to a read replica to isolate them from customer-facing write traffic.

Secondary: add a CDN edge cache for product pages, implement proper migration tooling (Prisma Migrate) instead of `ADD COLUMN IF NOT EXISTS`, and add structured logging (Pino) for observability.

---

## License

MIT — built for educational and portfolio purposes.

---

*Redleaf — Quality over quantity. Always.*
