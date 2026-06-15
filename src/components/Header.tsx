"use client"

import Link from "next/link"

interface Props {
  title: string
  right?: React.ReactNode
  backHref?: string
  onMenu?: () => void
}

export default function Header({ title, right, backHref, onMenu }: Props) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 16px", background: "#0f172a", borderBottom: "1px solid #1e293b",
      position: "sticky", top: 0, zIndex: 40, minHeight: 48,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {backHref ? (
          <Link href={backHref} style={{ color: "#94a3b8", fontSize: 22, textDecoration: "none", lineHeight: 1 }}>←</Link>
        ) : onMenu ? (
          <button onClick={onMenu} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>☰</button>
        ) : null}
        <span style={{ color: "var(--orange)", fontSize: 18, fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {right || (
          <Link href="/app/perfil" style={{ color: "#64748b", fontSize: 20, textDecoration: "none", lineHeight: 1 }}>○</Link>
        )}
      </div>
    </header>
  )
}
