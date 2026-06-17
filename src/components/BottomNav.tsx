"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/app/match", label: "Match", icon: "♡" },
  { href: "/app/dashboard", label: "Painel", icon: "📊" },
  { href: "/app/chat", label: "Chat", icon: "●" },
  { href: "/app/perfil", label: "Perfil", icon: "○" },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      display: "flex", background: "#0f172a", borderTop: "1px solid #1e293b",
      zIndex: 50, paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(t => {
        const active = path.startsWith(t.href)
        return (
          <Link key={t.href} href={t.href} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            padding: "8px 0 4px", textDecoration: "none", gap: 2,
            color: active ? "var(--orange)" : "#64748b",
            fontSize: active ? 13 : 12, fontWeight: active ? 600 : 400,
            transition: "color .2s",
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
