"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function ResultadosPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editData, setEditData] = useState({ conexoes: 0, parcerias_fechadas: 0, honorarios_receita: 0, oportunidades_recebidas: 0, valor_negociacao: 0 })
  const [saving, setSaving] = useState(false)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    if (!token) return
    fetch("/api/financial/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        if (data.length > 0) setEditData(data[0])
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/financial/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      })
      window.location.reload()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const currentMonth = stats[0]
  const precoPlano = 49
  const roi = currentMonth
    ? ((currentMonth.honorarios_receita - precoPlano) / precoPlano * 100).toFixed(0)
    : 0

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 16, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>💰 Meus Resultados</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        Acompanhe o retorno do seu investimento na plataforma
      </p>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Carregando...</p>
      ) : (
        <>
          {/* ROI Card */}
          {currentMonth && (
            <div style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))",
              borderRadius: "var(--radius)", padding: 20, marginBottom: 20,
              border: "1px solid rgba(34,197,94,0.3)", textAlign: "center",
            }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>ROI deste mês</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: "var(--green)", margin: "4px 0" }}>
                {roi}%
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                Você investiu R$ {precoPlano} e gerou R$ {currentMonth.honorarios_receita || 0} em oportunidades
              </p>
            </div>
          )}

          {/* Current month form */}
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 16, marginBottom: 20, border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>Dados deste mês</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "conexoes", label: "Conexões feitas" },
                { key: "parcerias_fechadas", label: "Parcerias fechadas" },
                { key: "honorarios_receita", label: "Honorários/receita gerada (R$)" },
                { key: "oportunidades_recebidas", label: "Oportunidades recebidas" },
                { key: "valor_negociacao", label: "Valor em negociação (R$)" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>{field.label}</label>
                  <input
                    type="number"
                    value={(editData as any)[field.key] || ""}
                    onChange={(e) => setEditData({ ...editData, [field.key]: Number(e.target.value) })}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)", background: "var(--bg-input)",
                      color: "var(--text)", fontSize: 14, outline: "none",
                    }}
                  />
                </div>
              ))}
              <button onClick={handleSave} disabled={saving} className="btn-fill" style={{ marginTop: 8, fontSize: 13 }}>
                {saving ? "Salvando..." : "Salvar dados do mês"}
              </button>
            </div>
          </div>

          {/* History */}
          {stats.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Histórico mensal</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {stats.map((s: any, i: number) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "var(--bg-card)", padding: "12px 16px",
                    borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                        {s.mes}/{s.ano}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                        {s.conexoes} conexões · {s.parcerias_fechadas} parcerias
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", margin: 0 }}>
                        R$ {s.honorarios_receita}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                        Receita
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}>
              <p>Nenhum registro ainda. Preencha os dados do mês acima para começar.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
