"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consented = localStorage.getItem("lgpd_consent")
    if (!consented) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem("lgpd_consent", "true")
    localStorage.setItem("lgpd_consent_at", new Date().toISOString())
    setVisible(false)

    try { fetch("/api/users/me/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aceito: true, versao_politica: "1.0" }) }).catch(() => {}) } catch {}
  }

  if (!visible) return null

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#1e293b", borderTop: "1px solid #334155",
      padding: "16px 20px", zIndex: 200,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
          Usamos cookies e dados pessoais para melhorar sua experiência na Nextrigon.
          Ao continuar, você concorda com nossa{" "}
          <Link href="/privacidade" style={{ color: "var(--orange)", textDecoration: "underline" }}>
            Política de Privacidade
          </Link>.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={accept} className="btn-fill" style={{ fontSize: 13, padding: "10px 0", flex: 1 }}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
