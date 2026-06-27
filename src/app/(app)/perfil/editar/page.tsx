"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const AREAS = [
  "Direito Civil", "Direito Penal", "Direito Trabalhista", "Direito Tributário",
  "Direito Empresarial", "Direito de Família", "Direito Imobiliário",
  "Direito do Consumidor", "Direito Previdenciário", "Direito Ambiental",
  "Direito Digital", "Direito Constitucional", "Direito Administrativo",
  "Direito Internacional", "Compliance", "M&A", "Recuperação Judicial",
];

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function EditarPerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [nome, setNome] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleArea(a: string) {
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio, cidade, uf, areas }),
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); router.push("/perfil"); }, 1200);
    } catch {
      // ignorar
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      {/* Sub-header */}
      <div className="mt-1 mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="text-xl font-bold">Editar perfil</h1>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Nome completo</span>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Dr. João Silva"
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Sobre você</span>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={280}
            placeholder="Descreva sua experiência e especialidade..."
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim resize-none" />
          <span className="mt-1 block text-right text-[11px] text-dim">{bio.length}/280</span>
        </label>

        <div className="flex gap-3">
          <label className="block flex-1">
            <span className="mb-1.5 block text-xs font-medium text-muted">Cidade</span>
            <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="São Paulo"
              className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim" />
          </label>
          <label className="block w-24">
            <span className="mb-1.5 block text-xs font-medium text-muted">UF</span>
            <select value={uf} onChange={e => setUf(e.target.value)}
              className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none bg-transparent">
              <option value="">—</option>
              {UFS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium text-muted">Áreas de atuação</span>
          <div className="flex flex-wrap gap-2">
            {AREAS.map(a => (
              <button key={a} type="button" onClick={() => toggleArea(a)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${areas.includes(a) ? "brand-gradient text-white" : "glass-soft text-muted border border-line"}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="brand-gradient glow-brand mt-2 rounded-2xl py-3.5 text-center font-semibold text-white disabled:opacity-60">
          {saved ? "Salvo!" : saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}
