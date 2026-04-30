'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/CartContext'

export default function CartDrawer() {
  const router = useRouter()
  const { cart, setCart, cartOpen, setCartOpen } = useCart()
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], qty: Math.max(1, next[idx].qty + delta) }
      return next
    })
  }

  const remove = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx))

  return (
    <>
      <div
        className={`cart-overlay ${cartOpen ? 'open' : ''}`}
        onClick={() => setCartOpen(false)}
      />
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">Your Cart ({cart.length})</div>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--border)' }}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <div style={{ fontWeight: 600 }}>Your cart is empty</div>
            <div style={{ fontSize: '0.82rem' }}>Discover something you'll love</div>
            <button
              className="btn-primary"
              style={{ marginTop: 8 }}
              onClick={() => { setCartOpen(false); router.push('/shop') }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, idx) => (
                <div className="cart-item" key={idx}>
                  <div className="cart-item-img" style={{ background: item.bg }}>
                    {item.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-meta">
                      {item.selectedColor && `${item.selectedColor} · `}{item.selectedSize}
                    </div>
                    <div className="cart-item-row">
                      <div className="cart-item-qty">
                        <button className="cart-item-qty-btn" onClick={() => updateQty(idx, -1)}>−</button>
                        <div className="cart-item-qty-val">{item.qty}</div>
                        <button className="cart-item-qty-btn" onClick={() => updateQty(idx, 1)}>+</button>
                      </div>
                      <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
                    </div>
                    <button className="cart-item-remove" onClick={() => remove(idx)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-subtotal">
                <span className="cart-subtotal-label">Subtotal</span>
                <span className="cart-subtotal-val">${total.toFixed(2)}</span>
              </div>
              <div className="cart-note">Shipping & taxes calculated at checkout</div>
              <button
                className="btn-primary cart-checkout"
                style={{ height: 52 }}
                onClick={() => { setCartOpen(false); router.push('/checkout') }}
              >
                Checkout · ${total.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
