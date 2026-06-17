"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function BoostPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [boostData, setBoostData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    if (!token) return
    fetch("/api/boost", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setBoostData)
      .finally(() => setLoading(false))
  }, [token])

  const handleActivate = async () => {
    setActivating(true)
    try {
      await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "activate" }),
      })
      window.location.reload()
    } catch (e) { console.error(e) }
    setActivating(false)
  }

  const handlePurchase = async (qty: number) => {
    setPurchasing(qty)
    try {
      await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "purchase", quantidade: qty }),
      })
      window.location.reload()
    } catch (e) { console.error(e) }
    setPurchasing(null)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 16, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Impulsionar Perfil</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        Apareça em destaque nos resultados de busca por 24 horas
      </p>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Carregando...</p>
      ) : (
        <>
          <div style={{
            background: boostData?.active ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))" : "var(--bg-card)",
            borderRadius: "var(--radius)", padding: 20, marginBottom: 20,
            border: "1px solid " + (boostData?.active ? "rgba(34,197,94,0.3)" : "var(--border)"),
            textAlign: "center",
          }}>
            {boostData?.active ? (
              <>
                <span style={{ fontSize: 48 }}>🚀</span>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--green)", margin: "8px 0" }}>Perfil em destaque!</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  Ativo até {new Date(boostData.expires_at).toLocaleString("pt-BR")}
                </p>
              </>
            ) : (
              <>
                <span style={{ fontSize: 48, opacity: 0.3 }}>🚀</span>
                <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0" }}>Perfil sem destaque no momento</p>
              </>
            )}
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16, marginBottom: 20, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--text)", margin: "0 0 4px" }}>
              Boosts disponiveis: <strong style={{ color: "var(--orange)" }}>{boostData?.boosts_remaining || 0}</strong>
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              {(boostData?.boosts_mensais_plano || 0) > 0
                ? "Seu plano da " + boostData.boosts_mensais_plano + " boosts por mes"
                : "Assine um plano para receber boosts mensais gratis"}
            </p>
            {(boostData?.boosts_remaining || 0) > 0 && !boostData?.active && (
              <button onClick={handleActivate} disabled={activating} className="btn-fill" style={{ width: "100%", marginTop: 12, fontSize: 13 }}>
                {activating ? "Ativando..." : "Ativar Boost (24h)"}
              </button>
            )}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Comprar Boosts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(boostData?.options || []).map((opt: any) => {
              const precoUnitario = Math.round(opt.preco / opt.quantidade)
              return (
                <div key={opt.quantidade} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16,
                  border: "1px solid var(--border)",
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                      R$ {opt.preco} {opt.quantidade > 1 ? "(R$ " + precoUnitario + " por boost)" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePurchase(opt.quantidade)}
                    disabled={purchasing === opt.quantidade}
                    className="btn-outline"
                    style={{ fontSize: 12, padding: "6px 14px" }}
                  >
                    {purchasing === opt.quantidade ? "..." : "Comprar"}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
