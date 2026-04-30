const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const q = (text, params) => pool.query(text, params)

async function seed() {
  console.log('Seeding database...')

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10)
  const userHash  = await bcrypt.hash('user1234', 10)

  const adminRes = await q(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1,$2,$3,'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash=$2, name=$3, role='admin'
     RETURNING id`,
    ['admin@redleaf.com', adminHash, 'Admin']
  )
  const userRes = await q(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1,$2,$3,'user')
     ON CONFLICT (email) DO UPDATE SET password_hash=$2, name=$3
     RETURNING id`,
    ['demo@redleaf.com', userHash, 'Demo User']
  )
  console.log('✓ Users:', adminRes.rows[0].id, userRes.rows[0].id)

  // ── Categories ────────────────────────────────────────────────────────────
  const cats = [
    { name: 'Outerwear', slug: 'outerwear', description: 'Built for the elements',   image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800' },
    { name: 'Tops',      slug: 'tops',      description: 'Layer up or go solo',       image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' },
    { name: 'Bottoms',   slug: 'bottoms',   description: 'Grounded in quality',       image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800' },
    { name: 'Knitwear',  slug: 'knitwear',  description: 'Warmth, refined',           image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800' },
  ]
  const catIds = {}
  for (const c of cats) {
    const r = await q(
      `INSERT INTO categories (name, slug, description, image_url)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET name=$1, description=$3, image_url=$4
       RETURNING id`,
      [c.name, c.slug, c.description, c.image_url]
    )
    catIds[c.slug] = r.rows[0].id
  }
  console.log('✓ Categories')

  // ── Products ──────────────────────────────────────────────────────────────
  const products = [
    {
      slug: 'ember-field-jacket',
      name: 'Ember Field Jacket',
      subtitle: 'The definitive layer for all seasons',
      category: 'outerwear',
      price: 298,
      original_price: 420,
      badge: 'Sale',
      material: 'Waxed Cotton, 300g',
      fit: 'Regular / Relaxed',
      description: 'The Ember Field Jacket is built for the in-between — that shoulder season when you need more than a shirt and less than a parka. Cut from a 300g waxed cotton shell with a quilted thermal liner, it moves with you from city commute to mountain trail without missing a beat.',
      bg: 'oklch(0.92 0.04 27)',
      featured: true,
      colors: [
        { name: 'Crimson Red',    hex: '#b91c1c', position: 0 },
        { name: 'Midnight Black', hex: '#1a1a1a', position: 1 },
        { name: 'Slate Grey',     hex: '#64748b', position: 2 },
        { name: 'Forest Green',   hex: '#166534', position: 3 },
      ],
      sizes: [
        { size: 'XS', available: false, position: 0 },
        { size: 'S',  available: true,  position: 1 },
        { size: 'M',  available: true,  position: 2 },
        { size: 'L',  available: true,  position: 3 },
        { size: 'XL', available: true,  position: 4 },
        { size: 'XXL',available: true,  position: 5 },
      ],
      specs: [
        { key: 'Material', value: 'Waxed Cotton 300g', position: 0 },
        { key: 'Lining',   value: 'Quilted Thermal',   position: 1 },
        { key: 'Fit',      value: 'Regular / Relaxed', position: 2 },
        { key: 'Length',   value: 'Hip Length',        position: 3 },
        { key: 'Pockets',  value: '6 (2 chest, 4 hand)',position: 4 },
        { key: 'Care',     value: 'Re-wax as needed',  position: 5 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800', label: 'Front', position: 0 },
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', label: 'Back',  position: 1 },
        { url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800', label: 'Detail', position: 2 },
      ],
    },
    {
      slug: 'thornton-parka',
      name: 'Thornton Parka',
      subtitle: 'Command winter with confidence',
      category: 'outerwear',
      price: 380,
      original_price: null,
      badge: 'New',
      material: 'Shell: 100% Nylon, Fill: 650-fill Down',
      fit: 'Relaxed',
      description: 'When the temperature drops, the Thornton Parka steps up. 650-fill down insulation, a storm-proof shell and a detachable hood make this the parka you reach for when conditions are serious.',
      bg: 'oklch(0.88 0.01 220)',
      featured: true,
      colors: [
        { name: 'Midnight Black', hex: '#1a1a1a', position: 0 },
        { name: 'Olive',          hex: '#4a5240', position: 1 },
      ],
      sizes: [
        { size: 'S',   available: true, position: 0 },
        { size: 'M',   available: true, position: 1 },
        { size: 'L',   available: true, position: 2 },
        { size: 'XL',  available: true, position: 3 },
        { size: 'XXL', available: true, position: 4 },
      ],
      specs: [
        { key: 'Shell',   value: '100% Nylon',      position: 0 },
        { key: 'Fill',    value: '650-fill Down',   position: 1 },
        { key: 'Fit',     value: 'Relaxed',         position: 2 },
        { key: 'Length',  value: 'Mid-thigh',       position: 3 },
        { key: 'Pockets', value: '5',               position: 4 },
        { key: 'Care',    value: 'Machine wash cold', position: 5 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?w=800', label: 'Front', position: 0 },
        { url: 'https://images.unsplash.com/photo-1547624643-3bf761b09502?w=800', label: 'Side',  position: 1 },
      ],
    },
    {
      slug: 'cascades-vest',
      name: 'Cascades Vest',
      subtitle: 'Insulation without restriction',
      category: 'outerwear',
      price: 165,
      original_price: 210,
      badge: 'Sale',
      material: 'Recycled Polyester Shell',
      fit: 'Regular',
      description: 'The Cascades Vest provides targeted core warmth without restricting arm movement. Ideal for active pursuits or as a mid-layer under a shell.',
      bg: 'oklch(0.93 0.03 27)',
      featured: false,
      colors: [
        { name: 'Crimson Red', hex: '#b91c1c', position: 0 },
        { name: 'Navy',        hex: '#1e3a5f', position: 1 },
        { name: 'Slate Grey',  hex: '#64748b', position: 2 },
      ],
      sizes: [
        { size: 'XS', available: true, position: 0 },
        { size: 'S',  available: true, position: 1 },
        { size: 'M',  available: true, position: 2 },
        { size: 'L',  available: true, position: 3 },
        { size: 'XL', available: true, position: 4 },
      ],
      specs: [
        { key: 'Shell',   value: 'Recycled Polyester', position: 0 },
        { key: 'Fill',    value: 'Synthetic',           position: 1 },
        { key: 'Fit',     value: 'Regular',             position: 2 },
        { key: 'Pockets', value: '4',                   position: 3 },
        { key: 'Care',    value: 'Machine wash cold',   position: 4 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', label: 'Front', position: 0 },
      ],
    },
    {
      slug: 'mesa-overshirt',
      name: 'Mesa Overshirt',
      subtitle: 'The shirt that does everything',
      category: 'tops',
      price: 148,
      original_price: null,
      badge: null,
      material: '100% Brushed Flannel',
      fit: 'Oversized',
      description: 'Heavy-weight brushed flannel in a generous oversized cut. The Mesa Overshirt works alone or layered — equally at home at the trailhead or the table.',
      bg: 'oklch(0.93 0.03 50)',
      featured: true,
      colors: [
        { name: 'Rust',      hex: '#a0522d', position: 0 },
        { name: 'Chambray',  hex: '#4a7fa5', position: 1 },
        { name: 'Olive',     hex: '#4a5240', position: 2 },
      ],
      sizes: [
        { size: 'XS',  available: false, position: 0 },
        { size: 'S',   available: true,  position: 1 },
        { size: 'M',   available: true,  position: 2 },
        { size: 'L',   available: true,  position: 3 },
        { size: 'XL',  available: true,  position: 4 },
        { size: 'XXL', available: true,  position: 5 },
      ],
      specs: [
        { key: 'Material', value: 'Brushed Flannel',   position: 0 },
        { key: 'Weight',   value: '280g',              position: 1 },
        { key: 'Fit',      value: 'Oversized',         position: 2 },
        { key: 'Pockets',  value: '2 chest',           position: 3 },
        { key: 'Care',     value: 'Machine wash warm', position: 4 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', label: 'Front', position: 0 },
        { url: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800', label: 'Back',  position: 1 },
      ],
    },
    {
      slug: 'summit-fleece',
      name: 'Summit Fleece',
      subtitle: 'Soft, fast, built to move',
      category: 'tops',
      price: 195,
      original_price: null,
      badge: 'New',
      material: 'Polartec® Grid Fleece',
      fit: 'Athletic',
      description: 'Polartec® Grid Fleece construction traps warmth while wicking moisture. The Summit Fleece is the mid-layer that disappears under a shell and shines on its own.',
      bg: 'oklch(0.94 0.02 27)',
      featured: false,
      colors: [
        { name: 'Crimson Red',    hex: '#b91c1c', position: 0 },
        { name: 'Midnight Black', hex: '#1a1a1a', position: 1 },
        { name: 'Cloud',          hex: '#e8e5e0', position: 2 },
      ],
      sizes: [
        { size: 'S',   available: true, position: 0 },
        { size: 'M',   available: true, position: 1 },
        { size: 'L',   available: true, position: 2 },
        { size: 'XL',  available: true, position: 3 },
        { size: 'XXL', available: true, position: 4 },
      ],
      specs: [
        { key: 'Material', value: 'Polartec® Grid Fleece', position: 0 },
        { key: 'Fit',      value: 'Athletic',              position: 1 },
        { key: 'Pockets',  value: '2 zip',                 position: 2 },
        { key: 'Care',     value: 'Machine wash cold',     position: 3 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800', label: 'Front', position: 0 },
      ],
    },
    {
      slug: 'valley-tee',
      name: 'Valley Tee',
      subtitle: 'The perfect blank canvas',
      category: 'tops',
      price: 58,
      original_price: null,
      badge: null,
      material: '200g Supima Cotton',
      fit: 'Classic',
      description: '200g Supima cotton jersey for a luxurious hand-feel that lasts. Preshrunk, reinforced seams, and a classic boxy cut make the Valley Tee the one you grab first.',
      bg: 'oklch(0.97 0.005 80)',
      featured: false,
      colors: [
        { name: 'White',          hex: '#f5f2ee', position: 0 },
        { name: 'Midnight Black', hex: '#1a1a1a', position: 1 },
        { name: 'Crimson Red',    hex: '#b91c1c', position: 2 },
        { name: 'Sage',           hex: '#7c8f72', position: 3 },
      ],
      sizes: [
        { size: 'XS',  available: true, position: 0 },
        { size: 'S',   available: true, position: 1 },
        { size: 'M',   available: true, position: 2 },
        { size: 'L',   available: true, position: 3 },
        { size: 'XL',  available: true, position: 4 },
        { size: 'XXL', available: true, position: 5 },
      ],
      specs: [
        { key: 'Material', value: '200g Supima Cotton', position: 0 },
        { key: 'Fit',      value: 'Classic / Boxy',     position: 1 },
        { key: 'Neck',     value: 'Crewneck',           position: 2 },
        { key: 'Care',     value: 'Machine wash cold',  position: 3 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800', label: 'Front', position: 0 },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', label: 'Back',  position: 1 },
      ],
    },
    {
      slug: 'ridge-knit',
      name: 'Ridge Knit',
      subtitle: 'Heritage texture, modern proportions',
      category: 'knitwear',
      price: 188,
      original_price: 240,
      badge: 'Sale',
      material: '100% Merino Wool',
      fit: 'Relaxed',
      description: 'Chunky cable-knit merino in a generous dropped-shoulder silhouette. The Ridge Knit is the sweater you keep reaching for — warm, breathable, and only getting better with age.',
      bg: 'oklch(0.93 0.02 80)',
      featured: true,
      colors: [
        { name: 'Oat',            hex: '#d4c5a9', position: 0 },
        { name: 'Crimson Red',    hex: '#b91c1c', position: 1 },
        { name: 'Midnight Black', hex: '#1a1a1a', position: 2 },
      ],
      sizes: [
        { size: 'S',  available: true,  position: 0 },
        { size: 'M',  available: true,  position: 1 },
        { size: 'L',  available: true,  position: 2 },
        { size: 'XL', available: false, position: 3 },
      ],
      specs: [
        { key: 'Material', value: '100% Merino Wool',        position: 0 },
        { key: 'Gauge',    value: '5GG',                     position: 1 },
        { key: 'Fit',      value: 'Relaxed',                 position: 2 },
        { key: 'Care',     value: 'Hand wash or dry clean',  position: 3 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800', label: 'Front', position: 0 },
        { url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800', label: 'Detail', position: 1 },
      ],
    },
    {
      slug: 'basin-hoodie',
      name: 'Basin Hoodie',
      subtitle: 'The one you never take off',
      category: 'tops',
      price: 135,
      original_price: null,
      badge: null,
      material: '380g French Terry',
      fit: 'Oversized',
      description: '380g French Terry cotton in an oversized silhouette with a garment-dyed finish for a worn-in look from day one. Heavy enough to be a layer, comfortable enough to sleep in.',
      bg: 'oklch(0.91 0.01 220)',
      featured: false,
      colors: [
        { name: 'Midnight Black', hex: '#1a1a1a', position: 0 },
        { name: 'Slate Grey',     hex: '#64748b', position: 1 },
        { name: 'Crimson Red',    hex: '#b91c1c', position: 2 },
      ],
      sizes: [
        { size: 'XS',  available: true, position: 0 },
        { size: 'S',   available: true, position: 1 },
        { size: 'M',   available: true, position: 2 },
        { size: 'L',   available: true, position: 3 },
        { size: 'XL',  available: true, position: 4 },
        { size: 'XXL', available: true, position: 5 },
      ],
      specs: [
        { key: 'Material', value: '380g French Terry',  position: 0 },
        { key: 'Finish',   value: 'Garment Dyed',       position: 1 },
        { key: 'Fit',      value: 'Oversized',          position: 2 },
        { key: 'Pockets',  value: 'Kangaroo',           position: 3 },
        { key: 'Care',     value: 'Machine wash cold',  position: 4 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800', label: 'Front', position: 0 },
      ],
    },
    {
      slug: 'canyon-chinos',
      name: 'Canyon Chinos',
      subtitle: 'From the desk to the trail',
      category: 'bottoms',
      price: 110,
      original_price: null,
      badge: null,
      material: '98% Cotton, 2% Elastane',
      fit: 'Slim Tapered',
      description: 'A technical stretch-cotton twill that looks sharp and moves freely. The Canyon Chino goes from office to outdoor without compromise.',
      bg: 'oklch(0.93 0.02 80)',
      featured: false,
      colors: [
        { name: 'Khaki',          hex: '#c3a882', position: 0 },
        { name: 'Midnight Black', hex: '#1a1a1a', position: 1 },
        { name: 'Olive',          hex: '#4a5240', position: 2 },
      ],
      sizes: [
        { size: '28', available: true,  position: 0 },
        { size: '30', available: true,  position: 1 },
        { size: '32', available: true,  position: 2 },
        { size: '34', available: true,  position: 3 },
        { size: '36', available: true,  position: 4 },
        { size: '38', available: false, position: 5 },
      ],
      specs: [
        { key: 'Material', value: '98% Cotton 2% Elastane', position: 0 },
        { key: 'Weave',    value: 'Twill',                  position: 1 },
        { key: 'Fit',      value: 'Slim Tapered',           position: 2 },
        { key: 'Rise',     value: 'Mid',                    position: 3 },
        { key: 'Care',     value: 'Machine wash cold',      position: 4 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', label: 'Front', position: 0 },
      ],
    },
    {
      slug: 'terrace-polo',
      name: 'Terrace Polo',
      subtitle: 'Refined but never precious',
      category: 'tops',
      price: 95,
      original_price: null,
      badge: null,
      material: 'Piqué Cotton',
      fit: 'Regular',
      description: 'A three-button piqué polo in a relaxed regular fit. The Terrace Polo has the right weight for spring through fall — never too stiff, never too casual.',
      bg: 'oklch(0.95 0.02 27)',
      featured: false,
      colors: [
        { name: 'Crimson Red', hex: '#b91c1c', position: 0 },
        { name: 'White',       hex: '#f5f2ee', position: 1 },
        { name: 'Navy',        hex: '#1e3a5f', position: 2 },
      ],
      sizes: [
        { size: 'XS',  available: true, position: 0 },
        { size: 'S',   available: true, position: 1 },
        { size: 'M',   available: true, position: 2 },
        { size: 'L',   available: true, position: 3 },
        { size: 'XL',  available: true, position: 4 },
        { size: 'XXL', available: true, position: 5 },
      ],
      specs: [
        { key: 'Material', value: 'Piqué Cotton',      position: 0 },
        { key: 'Fit',      value: 'Regular',           position: 1 },
        { key: 'Collar',   value: 'Ribbed',            position: 2 },
        { key: 'Care',     value: 'Machine wash cold', position: 3 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800', label: 'Front', position: 0 },
      ],
    },
    {
      slug: 'ridgeline-shorts',
      name: 'Ridgeline Shorts',
      subtitle: 'Move freely, look sharp',
      category: 'bottoms',
      price: 72,
      original_price: null,
      badge: null,
      material: '4-Way Stretch Nylon',
      fit: 'Athletic',
      description: '4-way stretch nylon with a built-in brief liner and zippered security pocket. The Ridgeline Shorts go from trail to town without a second thought.',
      bg: 'oklch(0.93 0.01 210)',
      featured: false,
      colors: [
        { name: 'Slate Grey',     hex: '#64748b', position: 0 },
        { name: 'Midnight Black', hex: '#1a1a1a', position: 1 },
        { name: 'Olive',          hex: '#4a5240', position: 2 },
      ],
      sizes: [
        { size: 'XS', available: true, position: 0 },
        { size: 'S',  available: true, position: 1 },
        { size: 'M',  available: true, position: 2 },
        { size: 'L',  available: true, position: 3 },
        { size: 'XL', available: true, position: 4 },
      ],
      specs: [
        { key: 'Material', value: '4-Way Stretch Nylon', position: 0 },
        { key: 'Liner',    value: 'Built-in Brief',      position: 1 },
        { key: 'Inseam',   value: '7"',                  position: 2 },
        { key: 'Pockets',  value: '3 + zip',             position: 3 },
        { key: 'Care',     value: 'Machine wash cold',   position: 4 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800', label: 'Front', position: 0 },
      ],
    },
    {
      slug: 'harbor-peacoat',
      name: 'Harbor Peacoat',
      subtitle: 'A classic, re-engineered',
      category: 'outerwear',
      price: 320,
      original_price: null,
      badge: 'New',
      material: '80% Wool, 20% Cashmere',
      fit: 'Tailored',
      description: 'An 80/20 wool-cashmere blend double-breasted peacoat with a modern tailored cut. Brass anchor buttons, a full lining, and structured shoulders make this the coat that anchors any wardrobe.',
      bg: 'oklch(0.88 0.01 80)',
      featured: false,
      colors: [
        { name: 'Midnight Black', hex: '#1a1a1a', position: 0 },
        { name: 'Camel',          hex: '#b8934a', position: 1 },
      ],
      sizes: [
        { size: 'S',   available: true, position: 0 },
        { size: 'M',   available: true, position: 1 },
        { size: 'L',   available: true, position: 2 },
        { size: 'XL',  available: true, position: 3 },
        { size: 'XXL', available: true, position: 4 },
      ],
      specs: [
        { key: 'Material', value: '80% Wool 20% Cashmere', position: 0 },
        { key: 'Lining',   value: 'Full Silk-blend',       position: 1 },
        { key: 'Fit',      value: 'Tailored',              position: 2 },
        { key: 'Buttons',  value: 'Brass',                 position: 3 },
        { key: 'Care',     value: 'Dry clean only',        position: 4 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800', label: 'Front', position: 0 },
        { url: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=800', label: 'Detail', position: 1 },
      ],
    },
  ]

  for (const p of products) {
    const catId = catIds[p.category]
    const pr = await q(
      `INSERT INTO products
         (slug, name, subtitle, description, category_id, price, original_price,
          badge, material, fit, bg, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (slug) DO UPDATE
         SET name=$2, subtitle=$3, description=$4, category_id=$5,
             price=$6, original_price=$7, badge=$8, material=$9,
             fit=$10, bg=$11, featured=$12
       RETURNING id`,
      [p.slug, p.name, p.subtitle, p.description, catId,
       p.price, p.original_price, p.badge, p.material, p.fit, p.bg, p.featured]
    )
    const pid = pr.rows[0].id

    await q(`DELETE FROM product_images WHERE product_id=$1`, [pid])
    await q(`DELETE FROM product_colors WHERE product_id=$1`, [pid])
    await q(`DELETE FROM product_sizes  WHERE product_id=$1`, [pid])
    await q(`DELETE FROM product_specs  WHERE product_id=$1`, [pid])

    for (const img of p.images) {
      await q(
        `INSERT INTO product_images (product_id, url, label, position) VALUES ($1,$2,$3,$4)`,
        [pid, img.url, img.label, img.position]
      )
    }
    for (const c of p.colors) {
      await q(
        `INSERT INTO product_colors (product_id, name, hex, position) VALUES ($1,$2,$3,$4)`,
        [pid, c.name, c.hex, c.position]
      )
    }
    for (const s of p.sizes) {
      await q(
        `INSERT INTO product_sizes (product_id, size, available, position) VALUES ($1,$2,$3,$4)`,
        [pid, s.size, s.available, s.position]
      )
    }
    for (const sp of p.specs) {
      await q(
        `INSERT INTO product_specs (product_id, key, value, position) VALUES ($1,$2,$3,$4)`,
        [pid, sp.key, sp.value, sp.position]
      )
    }
    console.log('  ✓', p.name)
  }

  console.log('✓ All products seeded')
  await pool.end()
}

seed().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
