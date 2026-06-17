"use client"

import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0, textAlign: "center" }}>
        Pagamento cancelado
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
        O pagamento não foi concluído. Seu plano permanece o mesmo.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Link href="/planos" style={{
          padding: "12px 24px", borderRadius: "var(--radius-sm)", background: "var(--orange)",
          color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14,
        }}>
          Tentar novamente
        </Link>
        <Link href="/app/dashboard" style={{
          padding: "12px 24px", borderRadius: "var(--radius-sm)", background: "var(--bg-card)",
          color: "var(--text)", textDecoration: "none", fontWeight: 600, fontSize: 14,
          border: "1px solid var(--border)",
        }}>
          Ir para o painel
        </Link>
      </div>
    </div>
  )
}
