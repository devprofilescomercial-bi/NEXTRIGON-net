"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { api } from "@/services/api"
import type { AdminVerification } from "@/lib/types"

export default function AdminPage() {
  const [verifications, setVerifications] = useState<AdminVerification[]>([])
  const [msg, setMsg] = useState("")

  useEffect(() => { api.admin.verifications().then(setVerifications).catch(() => setMsg("Acesso restrito a administradores")) }, [])

  const approve = async (id: string) => {
    try { await api.admin.approveVerification(id); setVerifications(v => v.filter(x => x.id !== id)); setMsg("Aprovado!") } catch { setMsg("Erro ao aprovar") }
  }

  const reject = async (id: string) => {
    try { await api.admin.rejectVerification(id); setVerifications(v => v.filter(x => x.id !== id)); setMsg("Rejeitado!") } catch { setMsg("Erro ao rejeitar") }
  }

  return (
    <>
      <Header title="⚙️ Admin" backHref="/app/perfil" />

      <div style={{ padding: 16, maxWidth: 400, margin: "0 auto" }}>
        {msg && <p style={{ fontSize: 13, color: msg.includes("Erro") ? "var(--red)" : "var(--green)", marginBottom: 12 }}>{msg}</p>}

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Verificações pendentes ({verifications.length})</h2>

        {verifications.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: 40 }}>
            Nenhuma verificação pendente.
          </p>
        )}

        {verifications.map(v => (
          <div key={v.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{v.nome}</h3>
                <p style={{ margin: "2px 0", fontSize: 13, color: "var(--text-dim)" }}>
                  OAB {v.oab_numero} — {v.oab_uf}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
                  ID: {v.user_id?.slice(0, 8)}...
                </p>
              </div>
              <span style={{ fontSize: 12, padding: "4px 8px", background: "#f59e0b20", color: "#f59e0b", borderRadius: 4, fontWeight: 600 }}>
                {v.status}
              </span>
            </div>

            {v.selfie_url && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>Selfie:</p>
                <img src={v.selfie_url} alt="Selfie" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => approve(v.id)} className="btn-fill" style={{ fontSize: 13, padding: "10px 0", flex: 1, background: "var(--green)" }}>
                ✓ Aprovar
              </button>
              <button onClick={() => reject(v.id)} className="btn-outline" style={{ fontSize: 13, padding: "10px 0", flex: 1, borderColor: "var(--red)", color: "var(--red)" }}>
                ✕ Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
