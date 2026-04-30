'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'moderator' | 'staff' | 'user'
} | null

type AuthContextType = {
  user: AuthUser
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refetch: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include' })
      if (r.ok) {
        const data = await r.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUser() }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login: setUser, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
