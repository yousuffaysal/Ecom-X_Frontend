'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'
import Stars from './Stars'

export type ApiProduct = {
  id: string
  slug: string
  name: string
  subtitle?: string
  price: number
  original_price?: number | null
  badge?: string | null
  rating: number
  review_count: number
  bg?: string
  images?: { url: string; label?: string }[] | null
  colors?: { name: string; hex: string }[] | null
  sizes?: { size: string; available: boolean }[] | null
}

export default function ProductCard({ product }: { product: ApiProduct }) {
  const router = useRouter()
  const { addToCart } = useCart()

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  const imageUrl = product.images?.[0]?.url
  const bg = product.bg || 'oklch(0.93 0.03 27)'

  return (
    <div className="product-card" onClick={() => router.push('/product/' + product.slug)}>
      <div className="product-card-img">
        <div className="product-card-img-inner" style={{ background: bg, position: 'relative', overflow: 'hidden' }}>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : (
            <span>{product.name}</span>
          )}
        </div>
        {product.badge && (
          <div className={`product-badge ${product.badge === 'Sale' ? 'sale' : 'new'}`}>
            {product.badge === 'Sale' && discount ? `−${discount}%` : product.badge}
          </div>
        )}
        <div className="product-card-quick">
          <button
            className="btn-primary"
            style={{ width: '100%', height: 40, fontSize: '0.7rem' }}
            onClick={e => {
              e.stopPropagation()
              const hasVariants = product.sizes?.length || product.colors?.length
              if (hasVariants) {
                router.push('/product/' + product.slug)
                return
              }
              addToCart({
                id: product.slug,
                name: product.name,
                price: product.price,
                qty: 1,
                bg,
              })
            }}
          >
            {(product.sizes?.length || product.colors?.length) ? 'Select Options' : 'Quick Add'}
          </button>
        </div>
      </div>
      <div className="product-card-name">{product.name}</div>
      <div className="product-card-sub">{product.subtitle}</div>
      <div className="product-card-price">
        <span className="product-card-price-current">${Number(product.price).toFixed(2)}</span>
        {product.original_price && (
          <span className="product-card-price-original">${Number(product.original_price).toFixed(2)}</span>
        )}
      </div>
      <div className="product-card-stars">
        <Stars rating={product.rating} size="0.72rem" />
        <span className="product-card-rating">({product.review_count})</span>
      </div>
      <div className="product-card-mobile-btn">
        <button
          className="btn-outline"
          style={{ width: '100%', height: 40, fontSize: '0.72rem' }}
          onClick={(e) => {
            e.stopPropagation()
            router.push('/product/' + product.slug)
          }}
        >
          View Details
        </button>
      </div>
    </div>
  )
}
