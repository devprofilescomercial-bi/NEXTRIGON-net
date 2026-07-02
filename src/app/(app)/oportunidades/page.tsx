"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";

type Stats = {
  likesRecebidos: number;
  likesSemana: number;
  matchesAtivos: number;
  plano: string;
};

const PERFIS_MOCK = [
  { id: "1", area: "Direito Tributário", city: "São Paulo", uf: "SP", initials: "AT", grad: ["#60a5fa", "#2563eb"] as [string, string], horasAtras: 2 },
  { id: "2", area: "Perícia Contábil", city: "Campinas", uf: "SP", initials: "PC", grad: ["#34d399", "#059669"] as [string, string], horasAtras: 5 },
  { id: "3", area: "LGPD e Privacidade", city: "Rio de Janeiro", uf: "RJ", initials: "LG", grad: ["#c084fc", "#7c3aed"] as [string, string], horasAtras: 18 },
  { id: "4", area: "Recuperação Judicial", city: "Belo Horizonte", uf: "MG", initials: "RJ", grad: ["#fb923c", "#ea580c"] as [string, string], horasAtras: 32 },
  { id: "5", area: "Direito Trabalhista", city: "Porto Alegre", uf: "RS", initials: "DT", grad: ["#f472b6", "#db2777"] as [string, string], horasAtras: 47 },
];

function TempoAtras({ horas }: { horas: number }) {
  if (horas < 24) return <span>{horas}h atrás</span>;
  return <span>{Math.floor(horas / 24)}d atrás</span>;
}

export default function OportunidadesPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/monetizacao/stats", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {});
  }, []);

  const plano = stats?.plano ?? "free";
  const isPaid = plano === "pro" || plano === "elite";
  const total = stats?.likesRecebidos ?? PERFIS_MOCK.length;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      {/* Header */}
      <div className="mt-1 mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold">Oportunidades</h1>
          <p className="text-xs text-muted">Profissionais que querem trabalhar com você</p>
        </div>
      </div>

      {/* Stats banner */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-brand">{total}</div>
          <div className="text-xs text-muted mt-0.5">Este mês</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-brand">{stats?.likesSemana ?? 0}</div>
          <div className="text-xs text-muted mt-0.5">Esta semana</div>
        </div>
      </div>

      {/* FOMO lock para free */}
      {!isPaid && (
        <div className="mb-4 rounded-2xl border border-brand/30 bg-brand/8 px-4 py-4">
          <p className="text-sm font-semibold text-ink mb-1">
            🔒 {total} profissiona{total === 1 ? "l quer" : "is querem"} trabalhar com você
          </p>
          <p className="text-xs text-muted mb-3">
            Assine o Plano Pro para ver os nomes, perfis completos e iniciar conversa.
          </p>
          <button
            onClick={() => router.push("/perfil/carteira")}
            className="brand-gradient glow-brand w-full rounded-2xl py-3 text-sm font-semibold text-white"
          >
            Desbloquear oportunidades · R$ 49/mês
          </button>
        </div>
      )}

      {/* Lista de perfis */}
      <div className="flex flex-col gap-2">
        {PERFIS_MOCK.map((p, idx) => (
          <div
            key={p.id}
            className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
          >
            {/* Avatar: real para paid, blur para free */}
            <div className="relative shrink-0">
              <div style={{ filter: !isPaid ? "blur(8px)" : "none" }}>
                <Avatar initials={p.initials} grad={p.grad} size={48} />
              </div>
              {!isPaid && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg">🔒</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isPaid ? (
                <>
                  <p className="font-semibold text-sm text-ink truncate">{p.area}</p>
                  <p className="text-xs text-muted">{p.city} · {p.uf}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm text-ink truncate" style={{ filter: "blur(5px)", userSelect: "none" }}>
                    Especialista Anônimo
                  </p>
                  <p className="text-xs text-muted">{p.city} · {p.uf}</p>
                </>
              )}
            </div>

            {/* Tempo */}
            <div className="text-right shrink-0">
              <p className="text-[11px] text-dim"><TempoAtras horas={p.horasAtras} /></p>
              {isPaid ? (
                <button
                  onClick={() => router.push("/chat")}
                  className="mt-1 rounded-lg bg-brand/15 px-2.5 py-1 text-[11px] font-semibold text-brand"
                >
                  Conversar
                </button>
              ) : (
                <button
                  onClick={() => router.push("/perfil/carteira")}
                  className="mt-1 rounded-lg bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand/70"
                >
                  Ver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FOMO adicional para free */}
      {!isPaid && (
        <div className="mt-4 rounded-2xl border border-line bg-white/3 px-4 py-4 text-center">
          <p className="text-sm font-semibold mb-1">Você perdeu oportunidades esta semana</p>
          <p className="text-xs text-muted mb-3">
            {stats?.likesSemana ?? 0} profissiona{(stats?.likesSemana ?? 0) === 1 ? "l tentou" : "is tentaram"} falar com você. Sem o Plano Pro, elas expiram em 7 dias.
          </p>
          <button
            onClick={() => router.push("/perfil/carteira")}
            className="brand-gradient glow-brand w-full rounded-2xl py-3 text-sm font-semibold text-white"
          >
            Assinar Plano Pro
          </button>
        </div>
      )}
    </section>
  );
}
