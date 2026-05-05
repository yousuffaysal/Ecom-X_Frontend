const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9c8HFtSyPIsq@ep-round-sky-aout730b-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const categories = {
  outerwear: '4691ff35-958b-4813-b812-333bf3e472fd',
  tops: '52363d2d-6303-47f2-b368-bd5e89dd7117',
  bottoms: 'fc29c5e9-a72a-4146-b37b-26463509c679',
  knitwear: 'cc78aecc-9ae6-4673-8e01-0af8d1cc0656'
};

const products = [
  // Outerwear
  {
    slug: 'alpine-technical-parka',
    name: 'Alpine Technical Parka',
    subtitle: 'Weather-resistant performance',
    description: 'A high-performance parka designed for extreme conditions. Features a waterproof shell, insulated lining, and multiple utility pockets.',
    category_id: categories.outerwear,
    price: 345,
    material: 'Technical Nylon, Synthetic Insulation',
    fit: 'Relaxed Fit',
    bg: 'oklch(0.95 0.01 200)',
    featured: true,
    image: '/products/alpine-parka-navy.png'
  },
  {
    slug: 'heritage-wool-overcoat',
    name: 'Heritage Wool Overcoat',
    subtitle: 'Timeless elegance',
    description: 'Crafted from premium Italian wool, this overcoat offers a sharp silhouette and exceptional warmth for the modern gentleman.',
    category_id: categories.outerwear,
    price: 420,
    material: '100% Virgin Wool',
    fit: 'Tailored Fit',
    bg: 'oklch(0.94 0.02 40)',
    featured: true,
    image: '/products/wool-overcoat-charcoal.png'
  },
  {
    slug: 'waxed-canvas-field-jacket',
    name: 'Waxed Canvas Field Jacket',
    subtitle: 'Rugged durability',
    description: 'A durable field jacket made from heavy waxed canvas that develops a unique patina over time. Water-resistant and functional.',
    category_id: categories.outerwear,
    price: 290,
    material: 'Waxed Cotton Canvas',
    fit: 'Regular Fit',
    bg: 'oklch(0.96 0.01 80)',
    featured: false,
    image: '/products/field-jacket-olive.png'
  },
  {
    slug: 'luxe-shearling-aviator',
    name: 'Luxe Shearling Aviator',
    subtitle: 'Premium warmth',
    description: 'A luxurious take on the classic aviator jacket, featuring thick shearling lining and premium leather exterior.',
    category_id: categories.outerwear,
    price: 580,
    material: 'Sheepskin Leather, Shearling',
    fit: 'Classic Fit',
    bg: 'oklch(0.92 0.03 30)',
    featured: true,
    image: '/products/aviator-jacket-tan.png'
  },
  {
    slug: 'modern-harrington-jacket',
    name: 'Modern Harrington Jacket',
    subtitle: 'Lightweight versatile',
    description: 'A contemporary update to the iconic Harrington, with a refined fit and minimalist hardware.',
    category_id: categories.outerwear,
    price: 210,
    material: 'Polyester-Cotton Blend',
    fit: 'Slim Fit',
    bg: 'oklch(0.94 0.02 240)',
    featured: false,
    image: '/products/harrington-jacket-black.png'
  },
  // Tops
  {
    slug: 'essential-oxford-shirt',
    name: 'Essential Oxford Shirt',
    subtitle: 'The wardrobe foundation',
    description: 'A crisp, well-fitted Oxford shirt made from high-grade cotton. Perfect for both casual and formal settings.',
    category_id: categories.tops,
    price: 95,
    material: '100% Supima Cotton',
    fit: 'Slim Fit',
    bg: 'oklch(0.97 0.01 0)',
    featured: true,
    image: '/products/oxford-shirt-white.png'
  },
  {
    slug: 'supima-cotton-tee',
    name: 'Supima Cotton Tee',
    subtitle: 'Elevated basic',
    description: 'The ultimate T-shirt. Soft, durable, and retains its shape wash after wash.',
    category_id: categories.tops,
    price: 45,
    material: '100% Supima Cotton',
    fit: 'Regular Fit',
    bg: 'oklch(0.93 0.02 220)',
    featured: false,
    image: '/products/supima-tee-slate.png'
  },
  {
    slug: 'heavyweight-flannel-shirt',
    name: 'Heavyweight Flannel Shirt',
    subtitle: 'Workwear inspired',
    description: 'A thick, brushed flannel shirt that provides warmth and comfort during colder months.',
    category_id: categories.tops,
    price: 110,
    material: 'Brushed Cotton Flannel',
    fit: 'Regular Fit',
    bg: 'oklch(0.91 0.03 20)',
    featured: false,
    image: '/products/flannel-shirt-red.png'
  },
  {
    slug: 'silk-linen-blend-polo',
    name: 'Silk-Linen Blend Polo',
    subtitle: 'Summer luxury',
    description: 'A refined polo shirt crafted from a breathable silk and linen blend, offering a sophisticated drape.',
    category_id: categories.tops,
    price: 135,
    material: 'Silk-Linen Blend',
    fit: 'Slim Fit',
    bg: 'oklch(0.95 0.03 70)',
    featured: true,
    image: '/products/polo-shirt-cream.png'
  },
  {
    slug: 'structured-denim-shirt',
    name: 'Structured Denim Shirt',
    subtitle: 'Refined workwear',
    description: 'A rugged yet refined denim shirt with clean lines and premium hardware.',
    category_id: categories.tops,
    price: 125,
    material: '12oz Selvedge Denim',
    fit: 'Regular Fit',
    bg: 'oklch(0.94 0.01 210)',
    featured: false,
    image: '/products/denim-shirt-indigo.png'
  },
  // Bottoms
  {
    slug: 'japanese-selvedge-denim',
    name: 'Japanese Selvedge Denim',
    subtitle: 'Raw indigo',
    description: 'Premium raw denim sourced from Okayama, Japan. Designed to be broken in and customized by the wearer.',
    category_id: categories.bottoms,
    price: 195,
    material: '14oz Japanese Selvedge Denim',
    fit: 'Straight Fit',
    bg: 'oklch(0.96 0.01 0)',
    featured: true,
    image: '/products/selvedge-denim-indigo.png'
  },
  {
    slug: 'luxury-wool-trousers',
    name: 'Luxury Wool Trousers',
    subtitle: 'Tailored perfection',
    description: 'Elegant wool trousers with a slight taper, perfect for professional or formal occasions.',
    category_id: categories.bottoms,
    price: 220,
    material: 'Super 120s Wool',
    fit: 'Tailored Taper',
    bg: 'oklch(0.92 0.01 0)',
    featured: true,
    image: '/products/wool-trousers-grey.png'
  },
  {
    slug: 'slim-fit-chinos',
    name: 'Slim-Fit Chinos',
    subtitle: 'The everyday essential',
    description: 'Versatile chinos with a hint of stretch for comfort and a modern slim silhouette.',
    category_id: categories.bottoms,
    price: 85,
    material: 'Cotton-Elastane Blend',
    fit: 'Slim Fit',
    bg: 'oklch(0.94 0.03 120)',
    featured: false,
    image: '/products/chinos-khaki.png'
  },
  {
    slug: 'technical-cargo-pants',
    name: 'Technical Cargo Pants',
    subtitle: 'Functional design',
    description: 'Modern cargo pants with streamlined pockets and a technical fabric that repels water.',
    category_id: categories.bottoms,
    price: 160,
    material: 'Technical Nylon Stretch',
    fit: 'Tapered Fit',
    bg: 'oklch(0.95 0.02 50)',
    featured: false,
    image: '/products/cargo-pants-moss.png'
  },
  {
    slug: 'heavy-corduroy-trousers',
    name: 'Heavy Corduroy Trousers',
    subtitle: 'Textured comfort',
    description: 'Rich, wide-wale corduroy trousers that bring texture and warmth to your autumn wardrobe.',
    category_id: categories.bottoms,
    price: 140,
    material: 'Heavyweight Cotton Corduroy',
    fit: 'Regular Straight',
    bg: 'oklch(0.92 0.02 10)',
    featured: false,
    image: '/products/corduroy-trousers-burgundy.png'
  },
  // Knitwear
  {
    slug: 'cashmere-crewneck-sweater',
    name: 'Cashmere Crewneck Sweater',
    subtitle: 'Unmatched softness',
    description: 'The pinnacle of comfort. 100% Grade-A Mongolian cashmere in a classic crewneck design.',
    category_id: categories.knitwear,
    price: 265,
    material: '100% Cashmere',
    fit: 'Regular Fit',
    bg: 'oklch(0.96 0.02 80)',
    featured: true,
    image: '/products/cashmere-sweater-camel.png'
  },
  {
    slug: 'merino-wool-cardigan',
    name: 'Merino Wool Cardigan',
    subtitle: 'Layering essential',
    description: 'Fine-gauge merino wool cardigan that works perfectly over a shirt or under a jacket.',
    category_id: categories.knitwear,
    price: 185,
    material: '100% Extra-Fine Merino Wool',
    fit: 'Slim Fit',
    bg: 'oklch(0.94 0.01 220)',
    featured: false,
    image: '/products/merino-cardigan-navy.png'
  },
  {
    slug: 'chunky-fishermans-knit',
    name: 'Chunky Fisherman\'s Knit',
    subtitle: 'Traditional texture',
    description: 'A heavy, textured knit inspired by traditional maritime sweaters. Provides incredible warmth.',
    category_id: categories.knitwear,
    price: 210,
    material: 'Heavyweight British Wool',
    fit: 'Relaxed Fit',
    bg: 'oklch(0.95 0.02 200)',
    featured: true,
    image: '/products/cashmere-sweater-camel.png' // Reused image
  },
  {
    slug: 'silk-cashmere-turtleneck',
    name: 'Silk-Cashmere Turtleneck',
    subtitle: 'Elegant layering',
    description: 'A luxurious blend of silk and cashmere, offering a smooth finish and a refined look.',
    category_id: categories.knitwear,
    price: 240,
    material: '70% Cashmere, 30% Silk',
    fit: 'Slim Fit',
    bg: 'oklch(0.94 0.03 60)',
    featured: false,
    image: '/products/merino-cardigan-navy.png' // Reused image
  },
  {
    slug: 'textured-mohair-sweater',
    name: 'Textured Mohair Sweater',
    subtitle: 'Contemporary fuzz',
    description: 'A soft, fuzzy mohair blend sweater with a unique textured knit pattern.',
    category_id: categories.knitwear,
    price: 230,
    material: 'Mohair-Wool Blend',
    fit: 'Oversized Fit',
    bg: 'oklch(0.95 0.01 0)',
    featured: false,
    image: '/products/cashmere-sweater-camel.png' // Reused image
  }
];

async function seed() {
  try {
    console.log('Seeding products...');
    for (const p of products) {
      const res = await pool.query(
        `INSERT INTO products (slug, name, subtitle, description, category_id, price, material, fit, bg, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           subtitle = EXCLUDED.subtitle,
           description = EXCLUDED.description,
           category_id = EXCLUDED.category_id,
           price = EXCLUDED.price,
           material = EXCLUDED.material,
           fit = EXCLUDED.fit,
           bg = EXCLUDED.bg,
           featured = EXCLUDED.featured
         RETURNING id`,
        [p.slug, p.name, p.subtitle, p.description, p.category_id, p.price, p.material, p.fit, p.bg, p.featured]
      );
      const pid = res.rows[0].id;
      
      // Clear existing images for this product
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [pid]);
      
      // Insert image
      await pool.query(
        'INSERT INTO product_images (product_id, url, label, position) VALUES ($1, $2, $3, $4)',
        [pid, p.image, 'Primary Image', 0]
      );
      
      console.log(`- Seeded: ${p.name}`);
    }
    console.log('Done!');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    await pool.end();
  }
}

seed();
