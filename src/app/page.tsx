"use client"

import Link from "next/link"

export default function Landing() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      textAlign: "center",
      background: "radial-gradient(ellipse at 50% 20%, #151d32 0%, #0b1120 70%)",
    }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/logo.png" alt="Nextrigon" style={{ width: 48, height: 48, borderRadius: 10 }} />
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2, color: "#f8fafc" }}>
            NEXTRIG<span style={{ color: "var(--orange)" }}>ON</span>
          </div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#cbd5e1", marginTop: 2 }}>
            CONECTA. COLABORA. REALIZA.
          </div>
        </div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, marginBottom: 6 }}>
        Conecte-se.<br />Colabore.<br />
        <span style={{ color: "var(--orange)" }}>Realize.</span>
      </div>

      <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 280, lineHeight: 1.5, marginTop: 12 }}>
        Encontre os especialistas certos para tirar seus projetos do papel.
      </p>

      <div style={{ marginTop: 32, width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/register" className="btn-fill">Criar conta</Link>
        <Link href="/login" className="btn-outline">Entrar</Link>
      </div>

      <div className="dots">
        <div className="dot active" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  )
}
