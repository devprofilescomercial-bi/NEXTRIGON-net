"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardData {
  oportunidades_semana: number
  interesses_recebidos: number
  visualizacoes_perfil: number
  matches_restantes: number
  plan_id: string
  plan_nome: string
  matches_used: number
  matches_limit: number
  boost_active: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [badges, setBadges] = useState<{ id: string; label: string; icon: string }[]>([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const isFree = data?.plan_id === "free"

  useEffect(() => {
    if (!token) return
    Promise.all([
      fetch("/api/dashboard/counters", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/badges", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([counters, badgesData]) => {
      setData(counters)
      setBadges(badgesData)
    }).finally(() => setLoading(false))
  }, [token])

  const Block = ({ icon, label, value, blurred }: { icon: string; label: string; value: string | number; blurred?: boolean }) => (
    <div style={{
      background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 20,
      border: "1px solid var(--border)", position: "relative", overflow: "hidden",
      filter: blurred ? "blur(0px)" : "none",
    }}>
      {blurred && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(11,17,32,0.6)",
          backdropFilter: "blur(8px)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", zIndex: 2, gap: 8,
        }}>
          <span style={{ fontSize: 28 }}>🔒</span>
          <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, margin: 0, textAlign: "center" }}>
            {label} bloqueado
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, textAlign: "center" }}>
            Disponível no Plano Pro
          </p>
          <button onClick={() => router.push("/planos")} className="btn-fill" style={{ padding: "8px 16px", fontSize: 12 }}>
            Ver planos
          </button>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
        <div>
          <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>{value}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{label}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 16, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        Plano: <strong style={{ color: "var(--orange)" }}>{data?.plan_nome || "Grátis"}</strong>
        {isFree && (
          <span onClick={() => router.push("/planos")} style={{ color: "var(--orange)", marginLeft: 8, cursor: "pointer", textDecoration: "underline", fontSize: 12 }}>
            Fazer upgrade →
          </span>
        )}
      </p>

      {loading ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Carregando...</p>
      ) : (
        <>
          {/* Curiosity Trigger Blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Block icon="📋" label="Oportunidades esta semana" value={data?.oportunidades_semana || 0} />
              <Block icon="❤️" label="Interesses recebidos" value={data?.interesses_recebidos || 0} blurred={isFree} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Block icon="👁️" label="Visualizações no perfil" value={data?.visualizacoes_perfil || 0} blurred={isFree} />
              <Block icon="🤝" label="Matches restantes" value={data?.matches_restantes || 0} />
            </div>
          </div>

          {/* Match usage bar */}
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16, marginBottom: 24, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 8px" }}>
              Matches usados esse mês: <strong style={{ color: "var(--text)" }}>{data?.matches_used || 0}/{data?.matches_limit || 5}</strong>
            </p>
            <div style={{ height: 8, background: "var(--bg)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: (data?.matches_used || 0) >= (data?.matches_limit || 5) ? "var(--red)" : "var(--orange)",
                width: `${Math.min(100, ((data?.matches_used || 0) / (data?.matches_limit || 5)) * 100)}%`,
                transition: "width 0.5s",
              }} />
            </div>
            {isFree && (data?.matches_used || 0) >= (data?.matches_limit || 5) && (
              <button onClick={() => router.push("/planos")} className="btn-fill" style={{ width: "100%", marginTop: 12, fontSize: 13 }}>
                🔓 Assinar Pro para matches ilimitados
              </button>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Seus badges</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {badges.map((b) => (
                  <div key={b.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "var(--bg-card)", padding: "6px 12px",
                    borderRadius: 20, border: "1px solid var(--border)", fontSize: 12,
                    color: "var(--text)",
                  }}>
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Ações rápidas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => router.push("/app/match")} style={{
              display: "flex", alignItems: "center", gap: 12, padding: 14,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text)",
              fontSize: 14, textAlign: "left",
            }}>
              <span style={{ fontSize: 20 }}>❤️</span>
              <div><strong>Descobrir profissionais</strong><p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Encontre parceiros ideais</p></div>
            </button>
            <button onClick={() => router.push("/planos")} style={{
              display: "flex", alignItems: "center", gap: 12, padding: 14,
              background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.05))",
              border: "1px solid rgba(249,115,22,0.3)", borderRadius: "var(--radius-sm)",
              cursor: "pointer", color: "var(--text)", fontSize: 14, textAlign: "left",
            }}>
              <span style={{ fontSize: 20 }}>🚀</span>
              <div><strong>Impulsionar perfil</strong><p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Apareça em destaque por 24h</p></div>
            </button>
            <button onClick={() => router.push("/app/resultados")} style={{
              display: "flex", alignItems: "center", gap: 12, padding: 14,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text)",
              fontSize: 14, textAlign: "left",
            }}>
              <span style={{ fontSize: 20 }}>💰</span>
              <div><strong>Meus resultados</strong><p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Acompanhe seu ROI na plataforma</p></div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
