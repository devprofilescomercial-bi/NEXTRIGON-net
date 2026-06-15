"use client"

import { useState, useEffect, useCallback, Fragment } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import { api } from "@/services/api"

interface DeckItem {
  id: string; nome: string; foto?: string; bio?: string
  especialidade: string; cidade?: string; uf?: string
  tags: string[]; nota?: number; avaliacoes?: number
  oab_verified?: boolean; taxa_resposta?: string; distancia?: string
}

interface Filters {
  especialidade: string; uf: string; nota_min: string; verificado: boolean; objetivo: string
}

interface FilterOptions {
  especialidades: string[]; ufs: string[]; objetivos: string[]
}

type View = "filters" | "deck" | "profile" | "likes"

export default function MatchPage() {
  const [view, setView] = useState<View>("filters")
  const [deck, setDeck] = useState<DeckItem[]>([])
  const [index, setIndex] = useState(0)
  const [matchMsg, setMatchMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<Filters>({ especialidade: "", uf: "", nota_min: "", verificado: false, objetivo: "" })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ especialidades: [], ufs: [], objetivos: [] })
  const [selectedProfile, setSelectedProfile] = useState<DeckItem | null>(null)
  const [likes, setLikes] = useState<{user_id: string; nome: string; areas_atuacao: string[]; nota: number}[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.match.filters().then(setFilterOptions).catch(() => {})
    api.match.likes().then(setLikes).catch(() => {})
    api.match.deck().then(setDeck).catch(() => {})
  }, [])

  const loadDeck = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.especialidade) params.set("especialidade", filters.especialidade)
      if (filters.uf) params.set("uf", filters.uf)
      if (filters.nota_min) params.set("nota_min", filters.nota_min)
      if (filters.verificado) params.set("verificado", "true")
      if (filters.objetivo) params.set("objetivo", filters.objetivo)

      navigator.geolocation.getCurrentPosition(
        (pos) => { params.set("lat", pos.coords.latitude.toString()); params.set("lng", pos.coords.longitude.toString()) },
        () => {},
        { timeout: 3000 }
      )

      const data = await api.match.deckParams(params.toString())
      setDeck(data)
      setIndex(0)
      setView("deck")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar deck")
    }
    setLoading(false)
  }, [filters])

  const goToDeck = () => {
    if (deck.length > 0) {
      setIndex(0)
      setView("deck")
    } else {
      loadDeck()
    }
  }

  const current = deck[index]
  const initials = current?.nome?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"

  const like = useCallback(async () => {
    if (!current) return
    try {
      const res = await api.match.swipe(current.id, "like")
      if (res.match) { setMatchMsg("Match!"); setTimeout(() => setMatchMsg(null), 2000) }
    } catch {}
    setIndex(i => i + 1)
  }, [current])

  const pass = useCallback(async () => {
    if (!current) return
    try { await api.match.swipe(current.id, "pass") } catch {}
    setIndex(i => i + 1)
  }, [current])

  if (view === "filters") {
    return (
      <Fragment>
        <Header title="Match" />
        <div style={{ padding: 24, paddingBottom: 80 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#f8fafc" }}>Encontrar especialistas</h2>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>Filtre para encontrar os profissionais ideais para seu projeto.</p>

          {error && <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          {likes.length > 0 && (
            <div className="card" style={{ marginBottom: 20, borderLeft: "3px solid var(--orange)", cursor: "pointer", background: "#1a2338" }}
              onClick={goToDeck}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>💌</span>
                <div>
                  <span style={{ fontWeight: 600, color: "var(--orange)" }}>
                    {likes.length} {likes.length === 1 ? "pessoa tem" : "pessoas tem"} interesse em voce
                  </span>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                    {likes.slice(0, 2).map(l => l.nome).join(", ")}
                    {likes.length > 2 ? ` e +${likes.length - 2}` : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: 16, background: "#1a2338" }}>
            <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>Especialidade</label>
            <select value={filters.especialidade} onChange={e => setFilters(f => ({ ...f, especialidade: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0f172a", color: "#f8fafc", fontSize: 14, outline: "none" }}>
              <option value="">Todas</option>
              {filterOptions.especialidades.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="card" style={{ marginBottom: 16, background: "#1a2338" }}>
            <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>UF</label>
            <select value={filters.uf} onChange={e => setFilters(f => ({ ...f, uf: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0f172a", color: "#f8fafc", fontSize: 14, outline: "none" }}>
              <option value="">Todas</option>
              {filterOptions.ufs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="card" style={{ marginBottom: 16, background: "#1a2338" }}>
            <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>
              Nota minima: {filters.nota_min || "0"}
            </label>
            <input type="range" min="0" max="5" step="0.5" value={filters.nota_min || "0"}
              onChange={e => setFilters(f => ({ ...f, nota_min: e.target.value }))}
              style={{ width: "100%" }} />
          </div>

          <div className="card" style={{ marginBottom: 16, background: "#1a2338" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={filters.verificado} onChange={e => setFilters(f => ({ ...f, verificado: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: "var(--orange)" }} />
              <span style={{ fontSize: 14, color: "#f8fafc" }}>Apenas verificados OAB</span>
            </label>
          </div>

          <button className="btn-fill" onClick={goToDeck} disabled={loading} style={{ width: "100%" }}>
            {loading ? "Carregando..." : `Ver especialistas (${deck.length})`}
          </button>
        </div>
        <BottomNav />
      </Fragment>
    )
  }

  if (view === "profile" && selectedProfile) {
    const p = selectedProfile
    return (
      <Fragment>
        <Header title="" backHref="/app/match" />
        <div style={{ padding: 16, maxWidth: 380, margin: "0 auto" }}>
          <div className="card" style={{ padding: 0, overflow: "hidden", background: "#1a2338" }}>
            <div style={{
              height: 240, background: "linear-gradient(135deg, #1e293b, #0f172a)",
              display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 20,
            }}>
              <div className="avatar" style={{ width: 100, height: 100, fontSize: 36 }}>{p.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>{p.nome}</h2>
                  <p style={{ margin: "4px 0", fontSize: 15, color: "var(--orange)", fontWeight: 500 }}>{p.especialidade}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                    {p.cidade}{p.cidade && p.uf ? ` — ${p.uf}` : p.uf || ""}
                  </p>
                </div>
                {p.oab_verified && (
                  <span style={{ fontSize: 20 }} title="Verificado OAB">✅</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
                <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <span style={{ color: "#f59e0b", fontSize: 18 }}>★</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#f8fafc" }}>{p.nota}</span>
                  <span style={{ color: "#64748b", fontSize: 13, marginLeft: 2 }}>({p.avaliacoes})</span>
                </div>
              </div>

              <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 12, lineHeight: 1.5 }}>
                {p.bio}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>

              <div style={{ marginTop: 16, padding: "12px 16px", background: "#0f172a", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
                  <span>{p.distancia}</span>
                  <span>Responde em {p.taxa_resposta}</span>
                </div>
              </div>

              <div className="swipe-buttons" style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center" }}>
                <button className="swipe-btn pass" onClick={() => setView("deck")} style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 22, cursor: "pointer" }}>✕</button>
                <button className="swipe-btn like" onClick={() => { setView("deck"); setTimeout(like, 100) }} style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #22c55e", background: "transparent", color: "#22c55e", fontSize: 22, cursor: "pointer" }}>♥</button>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </Fragment>
    )
  }

  if (!current) {
    return (
      <Fragment>
        <Header title="Match" right={
          <span style={{ color: "#64748b", fontSize: 14, cursor: "pointer" }}
            onClick={() => { setView("filters"); api.match.likes().then(setLikes).catch(() => {}) }}>
            Filtros
          </span>
        } />
        <div style={{ textAlign: "center", padding: 60, paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ color: "#f8fafc", fontSize: 20 }}>Voce ja viu todos!</h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>Novos perfis chegarao em breve.</p>
          <button className="btn-outline" style={{ marginTop: 24, maxWidth: 200, margin: "24px auto 0" }}
            onClick={() => setView("filters")}>Ajustar filtros</button>
        </div>
        <BottomNav />
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Header title="Match" right={
        <span style={{ color: "#64748b", fontSize: 14, cursor: "pointer" }}
          onClick={() => { setView("filters"); api.match.likes().then(setLikes).catch(() => {}) }}>
          Filtros
        </span>
      } />

      {matchMsg && (
        <div style={{
          position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
          background: "#22c55e", color: "#fff", padding: "10px 24px", borderRadius: 8,
          fontWeight: 600, zIndex: 60, animation: "fadeIn .3s", fontSize: 15,
        }}>
          Match!
        </div>
      )}

      <div style={{ padding: "12px 16px", maxWidth: 380, margin: "0 auto", paddingBottom: 80 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {deck.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i === index ? "var(--orange)" : "#1e293b",
              transition: "background .3s",
            }} />
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden", background: "#1a2338", border: "1px solid #1e293b" }}
          onClick={() => { setSelectedProfile(current); setView("profile") }}>
          <div style={{
            height: 180, background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            position: "relative",
          }}>
            <div className="avatar" style={{ width: 72, height: 72, fontSize: 26, borderRadius: "50%", background: "#334155" }}>{initials}</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>{current.nome}</h2>
            <p style={{ margin: 0, fontSize: 14, color: "var(--orange)", fontWeight: 500 }}>{current.especialidade}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              {current.cidade}{current.cidade && current.uf ? ` — ${current.uf}` : current.uf || ""}
            </p>
            {current.oab_verified && (
              <span style={{ position: "absolute", top: 12, right: 12, fontSize: 16, background: "#1e293b", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>✅</span>
            )}
          </div>

          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
              <span style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#f8fafc" }}>{current.nota}</span>
              <span style={{ color: "#64748b", fontSize: 12 }}>({current.avaliacoes} avaliacoes)</span>
            </div>

            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.4 }}>
              {current.bio}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {current.tags.slice(0, 3).map(t => (
                <span key={t} style={{ fontSize: 11, padding: "3px 8px", background: "#1e293b", borderRadius: 4, color: "#cbd5e1" }}>{t}</span>
              ))}
              {current.tags.length > 3 && <span style={{ fontSize: 11, padding: "3px 8px", background: "#1e293b", borderRadius: 4, color: "#64748b" }}>+{current.tags.length - 3}</span>}
            </div>

            <div className="swipe-buttons" onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 16, justifyContent: "center", paddingTop: 8, borderTop: "1px solid #1e293b" }}>
              <button className="swipe-btn pass" onClick={pass} style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <button className="swipe-btn like" onClick={like} style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #22c55e", background: "transparent", color: "#22c55e", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>♥</button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </Fragment>
  )
}
