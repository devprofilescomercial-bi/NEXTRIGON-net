"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/services/api"
import type { PlanFeature } from "@/lib/types"

const FEATURES: { key: keyof PlanFeature; label: string; free?: string; pro?: string; elite?: string }[] = [
  { key: "matches_mensais", label: "Matches por mês", free: "5", pro: "Ilimitado", elite: "Ilimitado" },
  { key: "pode_ver_quem_curtiu", label: "Ver quem curtiu" },
  { key: "chat_ilimitado", label: "Chat ilimitado" },
  { key: "boosts_mensais", label: "Boosts mensais" },
  { key: "primeira_impressao", label: "Primeira Impressão" },
  { key: "perfil_verificado", label: "Perfil verificado" },
  { key: "ranking_premium", label: "Ranking Premium" },
  { key: "destaque_nacional", label: "Destaque nacional" },
  { key: "selo_autoridade", label: "Selo de autoridade" },
  { key: "relatorios", label: "Relatórios de oportunidades", free: "❌", pro: "Básico", elite: "Completo" },
]

function formatFeature(key: keyof PlanFeature, plan: PlanFeature): string {
  const val = plan[key]
  if (typeof val === "boolean") return val ? "✅" : "❌"
  if (typeof val === "number" && val > 1000) return "Ilimitado"
  if (typeof val === "number") return String(val)
  if (typeof val === "string") return val === "none" ? "❌" : val.charAt(0).toUpperCase() + val.slice(1)
  return "❌"
}

export default function PlanosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<PlanFeature[]>([])
  const [currentPlan, setCurrentPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/plans").then((r) => r.json()),
      user ? fetch("/api/subscription", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then((r) => r.json()) : Promise.resolve({ plan_id: "free" }),
    ]).then(([plansData, subData]) => {
      setPlans(plansData)
      setCurrentPlan(subData.plan_id || "free")
    }).finally(() => setLoading(false))
  }, [user])

  const handleUpgrade = async (planId: string) => {
    if (!user) return router.push("/login")
    if (planId === currentPlan) return
    setUpgrading(planId)
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ plan_id: planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    }
    setUpgrading(null)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 24, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 4 }}>Planos</h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>
        Escolha o plano ideal para sua carreira
      </p>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Carregando...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan
              const isFree = plan.id === "free"
              return (
                <div key={plan.id} style={{
                  flex: "0 0 280px",
                  background: isCurrent && !isFree ? "linear-gradient(135deg, var(--orange), var(--orange-hover))" : "var(--bg-card)",
                  borderRadius: "var(--radius)",
                  padding: 20,
                  border: isCurrent ? "2px solid var(--orange)" : "1px solid var(--border)",
                  position: "relative",
                }}>
                  {isCurrent && !isFree && (
                    <div style={{
                      position: "absolute", top: -10, right: 12,
                      background: "var(--green)", color: "#fff",
                      padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                    }}>ATUAL</div>
                  )}
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: isCurrent && !isFree ? "#fff" : "var(--text)" }}>
                    {plan.nome}
                  </h2>
                  <p style={{
                    fontSize: 28, fontWeight: 700, margin: "12px 0",
                    color: isCurrent && !isFree ? "#fff" : "var(--orange)",
                  }}>
                    {plan.preco === 0 ? "Grátis" : `R$ ${plan.preco}`}
                    {plan.preco > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: isCurrent && !isFree ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>/mês</span>}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "16px 0" }}>
                    {FEATURES.map((f) => {
                      const val = f.free || f.pro || f.elite || formatFeature(f.key as keyof PlanFeature, plan)
                      return (
                        <div key={f.key} style={{ fontSize: 12, color: isCurrent && !isFree ? "rgba(255,255,255,0.9)" : "var(--text-muted)", display: "flex", gap: 6 }}>
                          <span>{val}</span>
                          <span>{f.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || upgrading === plan.id}
                    style={{
                      width: "100%", padding: "12px", borderRadius: "var(--radius-sm)",
                      border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
                      background: isCurrent ? (isFree ? "var(--border)" : "transparent") : "var(--orange)",
                      color: isCurrent ? (isFree ? "var(--text-muted)" : "#fff") : "#fff",
                      opacity: isCurrent ? 0.6 : 1,
                    }}
                  >
                    {upgrading === plan.id ? "Processando..." : isCurrent ? "Plano atual" : isFree ? "Plano atual" : "Assinar"}
                  </button>
                </div>
              )
            })}
          </div>

          {currentPlan === "free" && (
            <div style={{
              marginTop: 24, padding: 16, background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.05))",
              borderRadius: "var(--radius)", border: "1px solid rgba(249,115,22,0.3)", textAlign: "center",
            }}>
              <p style={{ fontSize: 14, color: "var(--orange)", fontWeight: 600, margin: 0 }}>
                🚀 Desbloqueie todo o potencial da sua carreira
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Assine o Plano Pro e tenha matches ilimitados, chat liberado e muito mais
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
