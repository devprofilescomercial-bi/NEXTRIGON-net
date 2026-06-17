"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState("processing")

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (sessionId) {
      fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(() => {
        setStatus("success")
        setTimeout(() => router.push("/app/dashboard"), 3000)
      }).catch(() => setStatus("success"))
    }
  }, [searchParams, router])

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>
        {status === "processing" ? "⏳" : "🎉"}
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0, textAlign: "center" }}>
        {status === "processing" ? "Processando pagamento..." : "Pagamento confirmado!"}
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
        {status === "processing"
          ? "Aguarde enquanto confirmamos seu pagamento"
          : "Bem-vindo ao plano selecionado. Redirecionando..."}
      </p>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
