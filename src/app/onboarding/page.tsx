"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/services/api"
import CameraCapture from "@/components/CameraCapture"

const ALL_UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]

type Step = "objetivo" | "localizacao" | "facial" | "oab" | "completo"

export default function VerificacaoPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("objetivo")
  const [selected, setSelected] = useState<string | null>(null)
  const [selfieUrl, setSelfieUrl] = useState("")
  const [oabNumero, setOabNumero] = useState("")
  const [oabUf, setOabUf] = useState("SP")
  const [submitting, setSubmitting] = useState(false)

  const objetivos = [
    { id: "P1", emoji: "👥", label: "Contratar especialistas", desc: "Encontre profissionais para seu projeto." },
    { id: "P2", emoji: "🚀", label: "Oferecer meus serviços", desc: "Divulgue suas habilidades e conquiste clientes." },
    { id: "P3", emoji: "🤝", label: "Criar projeto colaborativo", desc: "Monte um time e desenvolva projetos." },
    { id: "P4", emoji: "🔗", label: "Buscar parcerias", desc: "Conecte-se com empresas e profissionais." },
  ]

  const isAdv = selected === "P2"

  const requestLocation = async () => {
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej))
      await api.users.updateProfile({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    } catch {}
    setStep("facial")
  }

  const submitFacial = async (dataUrl: string) => {
    setSelfieUrl(dataUrl)
    try { await api.verification.facial({ selfie_url: dataUrl }) } catch {}
    setStep(isAdv ? "oab" : "completo")
  }

  const submitOab = async () => {
    if (!oabNumero.trim()) return
    setSubmitting(true)
    try {
      await api.verification.submit({ oab_numero: oabNumero, oab_uf: oabUf, selfie_url: selfieUrl })
      setStep("completo")
    } catch {}
    setSubmitting(false)
  }

  const complete = () => {
    router.push("/app/match")
  }

  const totalSteps = isAdv ? 4 : 3
  const stepLabels: Record<Step, number> = { objetivo: 1, localizacao: 2, facial: 3, oab: 4, completo: totalSteps }
  const stepNum = stepLabels[step] || 1

  // Step: Objetivo
  if (step === "objetivo") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32, background: "var(--bg)" }}>
        <div className="topline"><span style={{ color: "var(--text-muted)" }}>Etapa {stepNum} de {totalSteps}</span><span style={{ color: "var(--orange)" }}><img src="/logo.png" alt="Nextrigon" style={{ width: 24, height: 24, borderRadius: 6, verticalAlign: "middle" }} /></span></div>
        <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>Qual é o seu objetivo na Nextrigon?</div>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24 }}>Isso nos ajuda a conectar você com as melhores oportunidades.</p>
        {objetivos.map(obj => {
          const active = selected === obj.id
          return (
            <button key={obj.id} onClick={() => setSelected(obj.id)} className={`option ${active ? "active" : ""}`}>
              <span className="icon">{obj.emoji}</span>
              <div><b>{obj.label}</b><small>{obj.desc}</small></div>
            </button>
          )
        })}
        <button onClick={() => { selected && api.users.updateProfile({ objetivo: selected }); setStep("localizacao") }} disabled={!selected} className="btn-fill" style={{ marginTop: 24 }}>
          Continuar
        </button>
      </div>
    )
  }

  // Step: Localização
  if (step === "localizacao") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32, background: "var(--bg)" }}>
        <div className="topline"><span style={{ color: "var(--text-muted)" }}>Etapa {stepNum} de {totalSteps}</span><span style={{ color: "var(--orange)" }}>📍</span></div>
        <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>Compartilhe sua localização</div>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24 }}>Usamos sua localização para mostrar profissionais próximos a você.</p>
        <div style={{ fontSize: 64, textAlign: "center", marginBottom: 24 }}>📍</div>
        <button onClick={requestLocation} className="btn-fill">Permitir localização</button>
        <button onClick={() => setStep("facial")} className="btn-outline" style={{ marginTop: 8 }}>Pular</button>
      </div>
    )
  }

  // Step: Facial
  if (step === "facial") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32, background: "var(--bg)" }}>
        <div className="topline"><span style={{ color: "var(--text-muted)" }}>Etapa {stepNum} de {totalSteps}</span><span style={{ color: "var(--orange)" }}>📷</span></div>
        <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>Verificação facial</div>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24 }}>Tire uma selfie para confirmar sua identidade na plataforma.</p>
        <CameraCapture onCapture={submitFacial} onClose={() => setStep(isAdv ? "oab" : "completo")} />
      </div>
    )
  }

  // Step: OAB (for lawyers P2)
  if (step === "oab") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32, background: "var(--bg)" }}>
        <div className="topline"><span style={{ color: "var(--text-muted)" }}>Etapa {stepNum} de {totalSteps}</span><span style={{ color: "var(--orange)" }}>⚖️</span></div>
        <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>Dados da OAB</div>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24 }}>Informe seu número da OAB para verificação. Pode pular se não for advogado(a).</p>
        <input type="text" placeholder="Número OAB (ex: 123456)" value={oabNumero} onChange={e => setOabNumero(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 12 }} />
        <select value={oabUf} onChange={e => setOabUf(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 12 }}>
          <option value="">Selecione a UF</option>
          {ALL_UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
        <button onClick={submitOab} disabled={submitting || !oabNumero.trim()} className="btn-fill" style={{ marginBottom: 8 }}>
          {submitting ? "Enviando..." : "Enviar para verificação"}
        </button>
        <button onClick={complete} className="btn-outline">Pular, sou cliente</button>
      </div>
    )
  }

  // Step: Completo
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32, background: "var(--bg)", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>Cadastro completo!</div>
      <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24 }}>
        {selfieUrl ? "Sua selfie foi enviada para verificação. " : ""}
        {oabNumero ? "Seu número OAB está em análise. " : ""}
        Você já pode usar a plataforma.
      </p>
      <button onClick={complete} className="btn-fill">Ir para o Match</button>
    </div>
  )
}
