"use client";
import { useState } from "react";
import { IconLayers, IconUser } from "@/components/ui";

const AREAS = ["Civil", "Penal", "Trabalhista", "Tributário", "Empresarial", "Família", "Consumidor", "Outro"];

const INITIAL = [
  { id: "1", title: "Estrutura jurídica para startup", sub: "Societário · Contrato e acordo de sócios", progress: 75, people: 5, status: "Em andamento" },
  { id: "2", title: "Ação Civil — plano de saúde", sub: "Consumidor · Tutela de urgência", progress: 40, people: 3, status: "Em andamento" },
  { id: "3", title: "Defesa Criminal — Inquérito 4587/24", sub: "Penal · Fase de instrução", progress: 20, people: 2, status: "Início" },
  { id: "4", title: "Consultoria Empresarial", sub: "Contratos e compliance", progress: 100, people: 4, status: "Concluído" },
];

type Project = typeof INITIAL[0];

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL);
  const [modal, setModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [area, setArea] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() { setTitulo(""); setDescricao(""); setArea(""); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSaving(true);
    try {
      // Adiciona localmente (integração backend posterior)
      const novo: Project = {
        id: String(Date.now()),
        title: titulo.trim(),
        sub: `${area || "Geral"}`,
        progress: 0,
        people: 1,
        status: "Início",
      };
      setProjects(prev => [novo, ...prev]);
      resetForm();
      setModal(false);
    } finally {
      setSaving(false);
    }
  }

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
        {projects.map((p) => {
          const done = p.progress === 100;
          return (
            <article key={p.id} className="glass rounded-3xl p-4">
              <div className="flex items-start gap-3">
                <span className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
                  <IconLayers className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{p.title}</h2>
                  <p className="truncate text-xs text-muted">{p.sub}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${done ? "bg-success/15 text-success" : "bg-brand/15 text-brand"}`}>
                  {p.status}
                </span>
              </div>
              <div className="mt-3.5 flex items-center justify-between text-xs">
                <span className="text-dim">Progresso</span>
                <span className="font-semibold text-ink">{p.progress}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className={`h-full rounded-full ${done ? "bg-success" : "brand-gradient"}`} style={{ width: `${p.progress}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-dim">
                <IconUser className="h-3.5 w-3.5" /> {p.people} participante{p.people !== 1 ? "s" : ""}
              </div>
            </article>
          );
        })}
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
