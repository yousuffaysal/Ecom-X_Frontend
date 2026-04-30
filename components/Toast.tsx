'use client'

import { useCart } from '@/lib/CartContext'

export default function Toast() {
  const { toast } = useCart()
  if (!toast.visible) return null
  return (
    <div className="toast">
      <div className="toast-dot" />
      {toast.message}
    </div>
  )
}
