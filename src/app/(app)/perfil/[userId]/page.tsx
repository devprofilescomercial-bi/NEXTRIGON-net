"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tag, VerifiedBadge } from "@/components/ui";

type PublicProfile = {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  profile: {
    bio?: string | null;
    city?: string | null;
    uf?: string | null;
    areas?: string[];
    ratingAvg?: number;
    reviewsCount?: number;
  } | null;
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export default function PublicPerfilPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/perfil/${userId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
        <div className="mt-1 mb-5 flex items-center gap-3">
          <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
        <div className="mt-1 mb-5 flex items-center gap-3">
          <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>
        <p className="mt-10 text-center text-muted">Perfil não encontrado.</p>
      </section>
    );
  }

  const p = data.profile;
  const location = [p?.city, p?.uf].filter(Boolean).join(", ");
  const inits = initials(data.name);
  const memberSince = new Date(data.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      {/* Header */}
      <div className="mt-1 mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="text-xl font-bold">Perfil</h1>
      </div>

      {/* Avatar + nome */}
      <div className="flex flex-col items-center text-center gap-3">
        {data.image ? (
          <img src={data.image} alt={data.name} className="h-24 w-24 rounded-2xl object-cover ring-2 ring-brand/30" />
        ) : (
          <span
            className="inline-flex h-24 w-24 items-center justify-center rounded-2xl font-bold text-white text-3xl"
            style={{ background: "linear-gradient(140deg, #fb923c, #ea580c)" }}
          >
            {inits}
          </span>
        )}
        <div>
          <h2 className="text-2xl font-bold">{data.name}</h2>
          {location && (
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              {location}
            </p>
          )}
          <p className="mt-1 text-xs text-dim">Membro desde {memberSince}</p>
        </div>
        <VerifiedBadge />
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl px-4 py-3.5 text-center">
          <div className="text-xl font-bold">{p?.ratingAvg ? p.ratingAvg.toFixed(1) : "—"}</div>
          <div className="mt-0.5 text-[11px] text-muted">Nota geral</div>
        </div>
        <div className="glass rounded-2xl px-4 py-3.5 text-center">
          <div className="text-xl font-bold">{p?.reviewsCount ?? 0}</div>
          <div className="mt-0.5 text-[11px] text-muted">Avaliações</div>
        </div>
      </div>

      {/* Bio */}
      {p?.bio && (
        <div className="mt-4 glass rounded-2xl px-4 py-4">
          <p className="text-xs font-semibold text-muted mb-2">Sobre</p>
          <p className="text-sm text-ink leading-relaxed">{p.bio}</p>
        </div>
      )}

      {/* Áreas */}
      {p?.areas && p.areas.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted mb-2">Áreas de atuação</p>
          <div className="flex flex-wrap gap-2">
            {p.areas.map(a => <Tag key={a}>{a}</Tag>)}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => router.push("/chat")}
          className="brand-gradient glow-brand rounded-2xl py-3.5 text-center font-semibold text-white"
        >
          💬 Enviar mensagem
        </button>
      </div>
    </section>
  );
}
