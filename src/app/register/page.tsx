"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

type Tipo = "cliente" | "advogado" | null

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [tipo, setTipo] = useState<Tipo>(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!lgpdConsent) {
      setError("Você precisa aceitar a Política de Privacidade para criar uma conta.")
      return
    }
    try {
      await register(email, password, nome, tipo || "cliente")
      router.push("/onboarding")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
    }
  }

  if (!tipo) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
        padding: 32, background: "#0b1120"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src="/logo.png" alt="Nextrigon" style={{ width: 56, height: 56, marginBottom: 8, borderRadius: 12 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>Bem-vindo à Nextrigon</h1>
          <p style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 8 }}>Primeiro, nos diga quem você é:</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setTipo("advogado")} className="option" style={{ textAlign: "left", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>⚖️</span>
              <div>
                <b style={{ fontSize: 16 }}>Sou advogado(a)</b>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-dim)" }}>Quero oferecer meus serviços e encontrar clientes</p>
              </div>
            </div>
          </button>
          <button onClick={() => setTipo("cliente")} className="option" style={{ textAlign: "left", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>👤</span>
              <div>
                <b style={{ fontSize: 16 }}>Sou cliente</b>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-dim)" }}>Preciso contratar um advogado para meu caso</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      padding: 32, background: "#0b1120"
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src="/logo.png" alt="Nextrigon" style={{ width: 56, height: 56, marginBottom: 8, borderRadius: 12 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>
          {tipo === "advogado" ? "Cadastro do Advogado" : "Criar conta"}
        </h1>
        <button onClick={() => setTipo(null)} style={{ background: "none", border: "none", color: "var(--orange)", fontSize: 13, cursor: "pointer", marginTop: 4, textDecoration: "underline" }}>
          ← Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none" }} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none" }} />
        <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none" }} />

        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-dim)", cursor: "pointer", lineHeight: 1.4 }}>
          <input type="checkbox" checked={lgpdConsent} onChange={e => setLgpdConsent(e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--orange)" }} />
          <span>Aceito a{" "}
            <Link href="/privacidade" target="_blank" style={{ color: "var(--orange)", textDecoration: "underline" }}>
              Política de Privacidade
            </Link>{" "}e autorizo o tratamento dos meus dados conforme a LGPD.</span>
        </label>

        {error && <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>{error}</p>}

        <button type="submit" disabled={!lgpdConsent} className="btn-fill" style={{ opacity: lgpdConsent ? 1 : 0.5 }}>
          {tipo === "advogado" ? "Criar conta de advogado" : "Criar conta"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--text-dim)" }}>
        Já tem conta?{" "}
        <Link href="/login" style={{ color: "var(--orange)" }}>Entrar</Link>
      </p>
    </div>
  )
}
