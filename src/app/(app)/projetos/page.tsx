"use client";
import { useState, useEffect } from "react";
import { IconLayers, IconUser } from "@/components/ui";

const AREAS = ["Civil", "Penal", "Trabalhista", "Tributário", "Empresarial", "Família", "Consumidor", "Outro"];

type Project = {
  id: string;
  titulo: string;
  descricao?: string | null;
  area?: string | null;
  progresso: number;
  status: string;
};

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

const STATUS_COLOR: Record<string, string> = {
  ativo: "bg-brand/15 text-brand",
  concluido: "bg-success/15 text-success",
  inativo: "bg-line text-dim",
};

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [area, setArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projetos", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setProjects(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function resetForm() { setTitulo(""); setDescricao(""); setArea(""); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ titulo, descricao, area }),
      });
      if (res.ok) {
        const novo = await res.json();
        setProjects(prev => [novo, ...prev]);
      }
      resetForm();
      setModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    setProjects(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
    try {
      await fetch(`/api/projetos/${id}`, { method: "DELETE", credentials: "include" });
    } catch {
      await loadProjects();
    }
  }

  async function handleProgress(id: string, delta: number) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    const novo = Math.max(0, Math.min(100, p.progresso + delta));
    const status = novo === 100 ? "concluido" : "ativo";
    setProjects(prev => prev.map(x => x.id === id ? { ...x, progresso: novo, status } : x));
    try {
      await fetch(`/api/projetos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ progresso: novo, status }),
      });
    } catch {
      await loadProjects();
    }
  }

  const progressLabel = (p: Project) => {
    if (p.status === "concluido") return "Concluído";
    if (p.status === "inativo") return "Inativo";
    if (p.progresso === 0) return "Início";
    return "Em andamento";
  };

  const progressColor = (p: Project) => {
    if (p.status === "concluido" || p.progresso === 100) return "bg-success";
    return "brand-gradient";
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight">Projetos</h1>
          <p className="text-sm text-muted">Acompanhe o andamento de cada caso</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="brand-gradient glow-brand flex h-10 w-10 items-center justify-center rounded-xl text-2xl leading-none text-white"
        >
          +
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="glass mt-6 flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
            <IconLayers className="h-10 w-10 text-dim" />
            <p className="text-sm text-muted">Nenhum projeto ainda.<br />Crie o primeiro clicando em +</p>
          </div>
        )}

        {projects.map((p) => (
          <article key={p.id} className="glass rounded-3xl p-4">
            <div className="flex items-start gap-3">
              <span className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
                <IconLayers className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{p.titulo}</h2>
                {p.area && <p className="truncate text-xs text-muted">{p.area}{p.descricao ? ` · ${p.descricao}` : ""}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLOR[p.status] ?? "bg-brand/15 text-brand"}`}>
                  {progressLabel(p)}
                </span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${confirmDelete === p.id ? "bg-danger text-white" : "glass-soft text-danger"}`}
                  title={confirmDelete === p.id ? "Confirmar exclusão" : "Excluir projeto"}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            {confirmDelete === p.id && (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-danger/10 px-3 py-2 text-xs">
                <span className="text-danger font-medium">Confirmar exclusão?</span>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(p.id)} className="font-semibold text-danger">Sim</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-dim">Não</button>
                </div>
              </div>
            )}
            <div className="mt-3.5 flex items-center justify-between text-xs">
              <span className="text-dim">Progresso</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleProgress(p.id, -25)}
                  disabled={p.progresso === 0}
                  className="flex h-6 w-6 items-center justify-center rounded-lg glass-soft text-dim text-sm disabled:opacity-30 transition active:scale-90"
                >−</button>
                <span className="w-9 text-center font-semibold text-ink">{p.progresso}%</span>
                <button
                  onClick={() => handleProgress(p.id, 25)}
                  disabled={p.progresso === 100}
                  className="flex h-6 w-6 items-center justify-center rounded-lg glass-soft text-dim text-sm disabled:opacity-30 transition active:scale-90"
                >+</button>
              </div>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className={`h-full rounded-full transition-all duration-300 ${progressColor(p)}`} style={{ width: `${p.progresso}%` }} />
            </div>
          </article>
        ))}
      </div>

      {/* Modal criar projeto */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
          <div className="w-full max-w-[440px] glass rounded-3xl p-6 animate-pop">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Novo projeto</h2>
              <button onClick={() => { setModal(false); resetForm(); }} className="glass-soft h-8 w-8 flex items-center justify-center rounded-xl text-dim text-lg">
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Título do caso</span>
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex.: Defesa Criminal — Inquérito 1234/25"
                  className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
                  autoFocus
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Área</span>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setArea(a)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${area === a ? "brand-gradient text-white" : "glass-soft text-muted border border-line"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Descrição (opcional)</span>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={2}
                  placeholder="Detalhes do caso..."
                  className="glass-soft w-full rounded-2xl px-4 py-3 text-sm text-ink outline-none placeholder:text-dim resize-none"
                />
              </label>

              <button
                type="submit"
                disabled={!titulo.trim() || saving}
                className="brand-gradient glow-brand mt-1 rounded-2xl py-3.5 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Criando…" : "Criar projeto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
