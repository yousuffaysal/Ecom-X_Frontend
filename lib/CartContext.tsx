'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { CartItem } from './data'

type ToastState = { visible: boolean; message: string }

type CartContextType = {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  cartOpen: boolean
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>
  toast: ToastState
  showToast: (msg: string) => void
  addToCart: (product: CartItem & { qty?: number }) => void
  clearCart: () => void
  cartTotal: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' })

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg })
    setTimeout(() => setToast({ visible: false, message: '' }), 2200)
  }

  const addToCart = (product: CartItem & { qty?: number }) => {
    setCart(prev => {
      const idx = prev.findIndex(
        i => i.id === product.id &&
          i.selectedColor === product.selectedColor &&
          i.selectedSize === product.selectedSize
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + (product.qty || 1) }
        return next
      }
      return [...prev, { ...product, qty: product.qty || 1 }]
    })
    showToast(`${product.name} added to cart`)
    setCartOpen(true)
  }

  const clearCart = () => setCart([])
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, setCart, cartOpen, setCartOpen, toast, showToast, addToCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
