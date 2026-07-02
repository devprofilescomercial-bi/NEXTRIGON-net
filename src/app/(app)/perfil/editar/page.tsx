"use client";
import { useState, useRef, useEffect } from "react";
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

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export default function EditarPerfilPage() {
  const { data: session, refetch: refetchSession } = useSession();
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState(session?.user?.image || "");
  const [previewUrl, setPreviewUrl] = useState(session?.user?.image || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/perfil", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;
        if (data.bio) setBio(data.bio);
        if (data.city) setCidade(data.city);
        if (data.uf) setUf(data.uf);
        if (data.areas) setAreas(data.areas);
      } catch {}
    }
    loadProfile();
  }, []);

  useEffect(() => {
    if (session?.user?.name) setNome(session.user.name);
    if (session?.user?.image) { setImageUrl(session.user.image); setPreviewUrl(session.user.image); }
  }, [session]);

  function toggleArea(a: string) {
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ type: "avatar", data: base64, mime: file.type }),
        });
        if (res.ok) {
          const { url } = await res.json();
          setImageUrl(url);
          setPreviewUrl(url);
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch { setUploadingPhoto(false); }
    e.target.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio, cidade, uf, areas, imageUrl, nome }),
      });
      // Força refresh da sessão para que user.image e user.name apareçam atualizados
      await refetchSession();
      setSaved(true);
      setTimeout(() => { setSaved(false); router.push("/perfil"); }, 1200);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  const inits = nome ? initials(nome) : "EU";

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      <div className="mt-1 mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="text-xl font-bold">Editar perfil</h1>
      </div>

      {/* Avatar upload */}
      <div className="mb-5 flex flex-col items-center gap-2">
        <div className="relative">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-brand/30" />
          ) : (
            <span
              className="inline-flex h-20 w-20 items-center justify-center rounded-2xl font-bold text-white text-2xl"
              style={{ background: "linear-gradient(140deg, #fb923c, #ea580c)" }}
            >
              {inits}
            </span>
          )}
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-2 -right-2 glass flex h-8 w-8 items-center justify-center rounded-xl text-muted border border-line shadow"
          >
            {uploadingPhoto ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            ) : (
              <CameraIcon />
            )}
          </button>
        </div>
        <span className="text-xs text-dim">Toque na câmera para alterar</span>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
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
            <select
              value={uf}
              onChange={e => setUf(e.target.value)}
              className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
              style={{ backgroundColor: "#0b1322", color: uf ? "#f6f8fc" : "#5d6c86" }}
            >
              <option value="" style={{ backgroundColor: "#0b1322", color: "#5d6c86" }}>—</option>
              {UFS.map(u => (
                <option key={u} value={u} style={{ backgroundColor: "#0b1322", color: "#f6f8fc" }}>{u}</option>
              ))}
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

        <button type="submit" disabled={saving || uploadingPhoto}
          className="brand-gradient glow-brand mt-2 rounded-2xl py-3.5 text-center font-semibold text-white disabled:opacity-60">
          {saved ? "Salvo!" : saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}
