"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import { api } from "@/services/api"
import Link from "next/link"
import type { ProjectData } from "@/lib/types"

export default function ProjetosPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [showModal, setShowModal] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [area, setArea] = useState("")
  const [prazo, setPrazo] = useState("")
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.projects.list().then(data => {
      setProjects(data)
    }).catch(e => {
      setError(e instanceof Error ? e.message : "Erro ao carregar")
    }).finally(() => setLoading(false))
  }, [])

  const createProject = async () => {
    if (!titulo.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await api.projects.create({ titulo, descricao, area, prazo })
      setProjects(prev => [...prev, {
        id: res.id, titulo, descricao: descricao || "", area: area || "", prazo: prazo || "",
        status: "active", progresso: 0,
      }])
      setShowModal(false)
      setTitulo("")
      setDescricao("")
      setArea("")
      setPrazo("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar")
    }
    setCreating(false)
  }

  return (
    <>
      <Header title="Projetos" right={
        <button onClick={() => setShowModal(true)} style={{ background: "none", border: "none", color: "var(--orange)", fontSize: 24, fontWeight: 300, cursor: "pointer", padding: 0 }}>+</button>
      } />

      <div style={{ padding: "12px 16px" }}>
        {error && <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {loading && <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40 }}>Carregando...</p>}
        {!loading && projects.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40 }}>
            Nenhum projeto ainda. Clique em + para criar.
          </p>
        )}
        {projects.map(p => (
          <Link key={p.id} href={`/app/projetos/${p.id}`} style={{ textDecoration: "none" }}>
            <div className="card" style={{ marginBottom: 12, background: "#1a2338", border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f8fafc" }}>{p.titulo}</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>{p.area || p.descricao}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: p.progresso >= 100 ? "#22c55e" : "#f97316" }}>
                  {p.progresso}%
                </span>
              </div>
              <div className="progress-track" style={{ marginTop: 8, background: "#1e293b", height: 4, borderRadius: 2 }}>
                <div className={`progress-bar ${p.status === "completed" ? "done" : ""}`} style={{ width: `${p.progresso}%`, height: 4, borderRadius: 2, background: p.progresso >= 100 ? "#22c55e" : "#f97316", transition: "width .3s" }} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, color: "#64748b" }}>
                <span>📅 {p.prazo || "Sem prazo"}</span>
                <span>👥 1 participante</span>
              </div>
            </div>
          </Link>
        ))}
        {!loading && projects.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button className="btn-outline" style={{ fontSize: 13, padding: "10px 24px" }} onClick={() => setShowModal(true)}>Abrir projeto</button>
          </div>
        )}
      </div>
      <BottomNav />

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 24, width: "100%", maxWidth: 400 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>Novo Projeto</h2>
            <input type="text" placeholder="Título *" value={titulo} onChange={e => setTitulo(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 12, minHeight: 80, resize: "vertical", boxSizing: "border-box" }} />
            <input type="text" placeholder="Área (ex: Direito Civil)" value={area} onChange={e => setArea(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            <input type="text" placeholder="Prazo (ex: 30 dias)" value={prazo} onChange={e => setPrazo(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={createProject} disabled={creating || !titulo.trim()} className="btn-fill" style={{ flex: 1 }}>
                {creating ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
