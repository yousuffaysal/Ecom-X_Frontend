'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { can } from '@/lib/permissions'
import type { Role } from '@/lib/auth'
import ProductForm from '../ProductForm'

export default function NewProductPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && !can(user.role as Role, 'manageProducts')) {
      router.replace('/admin')
    }
  }, [user, loading, router])

  if (loading || !user || !can(user.role as Role, 'manageProducts')) return null

  return <ProductForm />
}
