"use client"

import { useState, useEffect, useRef } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import CameraCapture from "@/components/CameraCapture"
import type { ProfileData, VerificationStatus } from "@/lib/types"

export default function PerfilPage() {
  const { user, logout, isAdmin } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [verStatus, setVerStatus] = useState<VerificationStatus | null>(null)
  const [showFacialCam, setShowFacialCam] = useState(false)
  const [foto, setFoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.users.me().then(p => { setProfile(p); if (p.foto) setFoto(p.foto) }).catch(() => {})
    api.verification.status().then(setVerStatus).catch(() => {})
  }, [])

  const initials = profile?.nome?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"

  const isAdv = (profile?.areas_atuacao?.length || 0) > 0 || verStatus?.oab_numero

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setFoto(dataUrl)
      try { await api.users.updateProfile({ foto: dataUrl }) } catch {}
    }
    reader.readAsDataURL(file)
  }

  const oabBadge = () => {
    const s = verStatus?.status
    if (s === "approved") return { label: "OAB Verificada", color: "#22c55e" }
    if (s === "pending") return { label: "OAB em analise", color: "#f59e0b" }
    return { label: "Verificar OAB", color: "#64748b" }
  }

  const facialBadge = () => {
    if (verStatus?.facial_verified) return { label: "Facial verificada", color: "#22c55e" }
    return { label: "Verificacao facial", color: "#64748b" }
  }

  return (
    <>
      <Header title="Perfil" />

      <div style={{ padding: 24, textAlign: "center", paddingBottom: 80 }}>
        <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
          {foto ? (
            <img src={foto} alt="foto" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #1e293b" }} />
          ) : (
            <div className="avatar" style={{ width: 80, height: 80, margin: "0 auto", borderRadius: "50%", background: "linear-gradient(135deg, #1e293b, #334155)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#f97316" }}>
              👤
            </div>
          )}
          <div style={{ position: "absolute", bottom: 0, right: 0, background: "#f97316", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>+</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
        </div>

        <h2 style={{ margin: "12px 0 4px", fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>
          {profile?.nome || "Carregando..."}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#f97316", fontWeight: 500 }}>
          {isAdv ? "Advogado(a)" : "Cliente"}
        </p>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          {profile?.cidade ? `${profile.cidade} — ${profile.uf}` : profile?.areas_atuacao?.[0] || "Nextrigon"}
        </p>

        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>
              {profile?.nota ? `${profile.nota}` : "--"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Avaliacoes</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>
              {profile?.projetos_concluidos || 0}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Projetos</p>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          <Link href="/app/verificacao" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#1a2338", borderRadius: 8, textDecoration: "none", border: "1px solid #1e293b" }}>
            <span style={{ color: "#f8fafc", fontSize: 14 }}>Verificacao OAB</span>
            <span style={{ color: oabBadge().color, fontSize: 13, fontWeight: 500 }}>{oabBadge().label}</span>
          </Link>

          <div onClick={() => setShowFacialCam(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#1a2338", borderRadius: 8, cursor: "pointer", border: "1px solid #1e293b" }}>
            <span style={{ color: "#f8fafc", fontSize: 14 }}>Identidade facial</span>
            <span style={{ color: facialBadge().color, fontSize: 13, fontWeight: 500 }}>{facialBadge().label}</span>
          </div>

          <MenuItem label="Areas de atuacao" value={profile?.areas_atuacao?.join(", ") || "---"} />

          {isAdv && (
            <Link href="/app/verificacao" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#1a2338", borderRadius: 8, textDecoration: "none", border: "1px solid #1e293b" }}>
              <span style={{ color: "#f8fafc", fontSize: 14 }}>Configuracoes</span>
              <span style={{ color: "#64748b", fontSize: 12 }}>{">"}</span>
            </Link>
          )}

          {isAdmin && (
            <Link href="/app/admin" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#1a2338", borderRadius: 8, textDecoration: "none", border: "1px solid #1e293b" }}>
              <span style={{ color: "#f97316", fontSize: 14, fontWeight: 600 }}>Painel Admin</span>
              <span style={{ color: "#64748b", fontSize: 12 }}>{">"}</span>
            </Link>
          )}

          <MenuItem label="Sair" valueColor="#ef4444" value="Sair da conta" onClick={logout} />
        </div>
      </div>

      {showFacialCam && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div className="card" style={{ maxWidth: 360, width: "100%", background: "#1a2338", padding: 20, borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#f8fafc" }}>Verificacao facial</h3>
            <CameraCapture onCapture={async (url) => {
              try { await api.verification.facial({ selfie_url: url }); setVerStatus(await api.verification.status()) } catch {}
              setShowFacialCam(false)
            }} onClose={() => setShowFacialCam(false)} />
          </div>
        </div>
      )}
      <BottomNav />
    </>
  )
}

function MenuItem({ label, value, valueColor, onClick }: {
  label: string; value?: string; valueColor?: string; onClick?: () => void
}) {
  return (
    <div onClick={onClick} style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 16px", background: "#1a2338", borderRadius: 8,
      cursor: onClick ? "pointer" : "default", border: "1px solid #1e293b",
    }}>
      <span style={{ color: "#f8fafc", fontSize: 14 }}>{label}</span>
      {value && <span style={{ color: valueColor || "#64748b", fontSize: 13 }}>{value}</span>}
    </div>
  )
}
