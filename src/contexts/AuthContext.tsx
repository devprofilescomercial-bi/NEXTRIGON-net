"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "@/services/api"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  nome: string
  email?: string
  foto?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nome: string, tipo?: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("token")
    const storedRole = localStorage.getItem("role")
    if (stored) {
      setToken(stored)
      setIsAdmin(storedRole === "admin")
      api.users.me()
        .then((u) => setUser({ id: u.user_id, nome: u.nome, foto: u.foto, role: storedRole || undefined }))
        .catch(() => { localStorage.removeItem("token"); localStorage.removeItem("role") })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password })
    await supabase.auth.setSession({ access_token: res.access_token, refresh_token: "" }).catch(() => {})
    localStorage.setItem("token", res.access_token)
    if (res.role) localStorage.setItem("role", res.role)
    setToken(res.access_token)
    setIsAdmin(res.role === "admin")
    const u = await api.users.me()
    setUser({ id: res.user_id, nome: u.nome, foto: u.foto, role: res.role })
  }

  const register = async (email: string, password: string, nome: string, tipo?: string) => {
    const res = await api.auth.register({ email, password, nome, tipo })
    if (res.access_token) {
      await supabase.auth.setSession({ access_token: res.access_token, refresh_token: "" }).catch(() => {})
      localStorage.setItem("token", res.access_token)
      setToken(res.access_token)
    }
    setUser({ id: res.user_id, nome, foto: undefined, role: "user" })
  }

  const logout = async () => {
    await supabase.auth.signOut().catch(() => {})
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    setToken(null)
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
