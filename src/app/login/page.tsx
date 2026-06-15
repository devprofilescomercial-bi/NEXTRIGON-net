"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      router.push("/app/match")
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      padding: 32, background: "#0b1120"
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src="/logo.png" alt="Nextrigon" style={{ width: 56, height: 56, marginBottom: 8, borderRadius: 12 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>Entrar</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none" }} />
        <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none" }} />

        {error && <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>{error}</p>}

        <button type="submit" className="btn-fill">Entrar</button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--text-dim)" }}>
        Não tem conta?{" "}
        <Link href="/register" style={{ color: "var(--orange)" }}>Criar conta</Link>
      </p>
    </div>
  )
}
