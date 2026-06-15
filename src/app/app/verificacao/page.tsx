"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { api } from "@/services/api"
import CameraCapture from "@/components/CameraCapture"
import type { VerificationStatus } from "@/lib/types"

const ALL_UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]

export default function VerificacaoPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [oabNumero, setOabNumero] = useState("")
  const [oabUf, setOabUf] = useState("SP")
  const [selfieUrl, setSelfieUrl] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.verification.status().then(s => { setStatus(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const submit = async () => {
    if (!oabNumero.trim()) return
    setMsg("")
    try {
      await api.verification.submit({ oab_numero: oabNumero, oab_uf: oabUf, selfie_url: selfieUrl || undefined })
      setStatus(await api.verification.status())
      setMsg("Verificação enviada com sucesso! Aguarde aprovação.")
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Erro ao enviar")
    }
  }

  if (loading) return <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Carregando...</div>

  return (
    <>
      <Header title="Verificação OAB" backHref="/app/perfil" />

      <div style={{ padding: 16, maxWidth: 400, margin: "0 auto" }}>
        {status?.status === "approved" && (
          <div className="card" style={{ borderLeft: "4px solid var(--green)", marginBottom: 16 }}>
            <p style={{ color: "var(--green)", fontWeight: 600, margin: 0 }}>✅ OAB Verificada</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
              {status.oab_numero} — {status.oab_uf}
            </p>
          </div>
        )}

        {status?.status === "pending" && (
          <div className="card" style={{ borderLeft: "4px solid #f59e0b", marginBottom: 16 }}>
            <p style={{ color: "#f59e0b", fontWeight: 600, margin: 0 }}>⏳ Verificação em análise</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
              {status.oab_numero} — {status.oab_uf}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Seus documentos estão sendo revisados pela equipe Nextrigon.
            </p>
          </div>
        )}

        {status?.status === "rejected" && (
          <div className="card" style={{ borderLeft: "4px solid var(--red)", marginBottom: 16 }}>
            <p style={{ color: "var(--red)", fontWeight: 600, margin: 0 }}>❌ Verificação rejeitada</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Envie novamente com dados corretos.
            </p>
          </div>
        )}

        {status?.status !== "approved" && (
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Enviar verificação OAB</h3>

            <label style={{ fontSize: 13, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>Número OAB</label>
            <input type="text" placeholder="Ex: 123456" value={oabNumero} onChange={e => setOabNumero(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />

            <label style={{ fontSize: 13, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>UF da OAB</label>
            <select value={oabUf} onChange={e => setOabUf(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 16 }}>
              {ALL_UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>

            <label style={{ fontSize: 13, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>Selfie + documento (opcional)</label>
            <CameraCapture onCapture={setSelfieUrl} />

            {msg && <p style={{ fontSize: 13, color: msg.includes("sucesso") ? "var(--green)" : "var(--red)", marginTop: 8 }}>{msg}</p>}

            <button onClick={submit} disabled={!oabNumero.trim() || status?.status === "pending"} className="btn-fill" style={{ marginTop: 12 }}>
              {status?.status === "pending" ? "Já enviado" : "Enviar para verificação"}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
