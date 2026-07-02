"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";

type PlanInfo = { plano: string };

const RANKING_SEMANAL = [
  { pos: 1, name: "Dr. Bruno Tavares", area: "Direito Empresarial", city: "SP", initials: "BT", grad: ["#c084fc", "#7c3aed"] as [string, string], score: 98, verified: true },
  { pos: 2, name: "Dra. Marina Alves", area: "Direito Penal", city: "SP", initials: "MA", grad: ["#fb923c", "#ea580c"] as [string, string], score: 95, verified: true },
  { pos: 3, name: "Dr. Rafael Costa", area: "Direito Tributário", city: "Campinas", initials: "RC", grad: ["#60a5fa", "#2563eb"] as [string, string], score: 91, verified: true },
  { pos: 4, name: "Dra. Helena Dias", area: "Trabalhista", city: "Guarulhos", initials: "HD", grad: ["#34d399", "#059669"] as [string, string], score: 87, verified: false },
  { pos: 5, name: "Dra. Lúcia Pereira", area: "Família e Sucessões", city: "Santo André", initials: "LP", grad: ["#f472b6", "#db2777"] as [string, string], score: 82, verified: true },
];

const MEDALHAS = [
  { emoji: "🏆", label: "Top 10 da semana", desc: "Entre os 10 mais buscados", cor: "#f59e0b" },
  { emoji: "🔥", label: "Perfil em alta", desc: "+200% de visualizações", cor: "#ef4444" },
  { emoji: "⭐", label: "Altamente avaliado", desc: "Média acima de 4.8", cor: "#a855f7" },
  { emoji: "💬", label: "Resposta rápida", desc: "Taxa de resposta acima de 90%", cor: "#3b82f6" },
  { emoji: "🤝", label: "Conector nato", desc: "Mais de 20 matches ativos", cor: "#10b981" },
  { emoji: "✅", label: "OAB verificado", desc: "Identidade confirmada", cor: "#6366f1" },
];

function MedalhaCard({ emoji, label, desc, cor, desbloqueado }: { emoji: string; label: string; desc: string; cor: string; desbloqueado: boolean }) {
  return (
    <div className={`glass rounded-2xl p-3 flex items-center gap-3 ${!desbloqueado ? "opacity-40" : ""}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${cor}20` }}>
        {desbloqueado ? emoji : "🔒"}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{label}</p>
        <p className="text-[11px] text-muted truncate">{desc}</p>
      </div>
      {desbloqueado && (
        <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-success" />
      )}
    </div>
  );
}

export default function RankingPage() {
  const router = useRouter();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [tab, setTab] = useState<"ranking" | "conquistas">("ranking");

  useEffect(() => {
    fetch("/api/perfil/plano", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setPlanInfo)
      .catch(() => {});
  }, []);

  const plano = planInfo?.plano ?? "free";
  const isPaid = plano === "pro" || plano === "elite";

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      {/* Header */}
      <div className="mt-1 mb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold">Ranking e Conquistas</h1>
          <p className="text-xs text-muted">Destaque-se na plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("ranking")}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${tab === "ranking" ? "brand-gradient text-white" : "glass-soft text-muted"}`}
        >
          🏆 Ranking
        </button>
        <button
          onClick={() => setTab("conquistas")}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${tab === "conquistas" ? "brand-gradient text-white" : "glass-soft text-muted"}`}
        >
          ⭐ Conquistas
        </button>
      </div>

      {tab === "ranking" && (
        <>
          {/* Filtros de período */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">Esta semana</p>
            <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[11px] font-medium text-brand">Sua área · SP</span>
          </div>

          {/* Pódio top 3 */}
          <div className="glass rounded-3xl p-4 mb-3">
            <div className="flex items-end justify-center gap-3">
              {/* 2º */}
              <div className="flex flex-col items-center gap-1.5 pb-0">
                <p className="text-[10px] text-muted">2º</p>
                <Avatar initials={RANKING_SEMANAL[1].initials} grad={RANKING_SEMANAL[1].grad} size={52} />
                <p className="text-[11px] font-semibold text-center leading-tight" style={{ maxWidth: 64 }}>
                  {RANKING_SEMANAL[1].name.split(" ")[0]}
                </p>
                <span className="text-lg">🥈</span>
              </div>

              {/* 1º */}
              <div className="flex flex-col items-center gap-1.5 -mt-3">
                <p className="text-[10px] text-muted">1º</p>
                <Avatar initials={RANKING_SEMANAL[0].initials} grad={RANKING_SEMANAL[0].grad} size={64} />
                <p className="text-xs font-bold text-center leading-tight" style={{ maxWidth: 72 }}>
                  {RANKING_SEMANAL[0].name.split(" ").slice(0, 2).join(" ")}
                </p>
                <span className="text-xl">🥇</span>
              </div>

              {/* 3º */}
              <div className="flex flex-col items-center gap-1.5 pb-0">
                <p className="text-[10px] text-muted">3º</p>
                <Avatar initials={RANKING_SEMANAL[2].initials} grad={RANKING_SEMANAL[2].grad} size={52} />
                <p className="text-[11px] font-semibold text-center leading-tight" style={{ maxWidth: 64 }}>
                  {RANKING_SEMANAL[2].name.split(" ")[0]}
                </p>
                <span className="text-lg">🥉</span>
              </div>
            </div>
          </div>

          {/* Lista completa */}
          <div className="flex flex-col gap-2 mb-4">
            {RANKING_SEMANAL.map(p => (
              <div key={p.pos} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                <span className="w-6 text-center text-sm font-black text-dim">#{p.pos}</span>
                <Avatar initials={p.initials} grad={p.grad} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.area} · {p.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black" style={{ color: p.pos === 1 ? "#f59e0b" : p.pos === 2 ? "#9ca3af" : p.pos === 3 ? "#d97706" : "inherit" }}>
                    {p.score}
                  </p>
                  <p className="text-[11px] text-dim">pts</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA para subir no ranking */}
          {!isPaid && (
            <div className="glass rounded-3xl p-4 text-center">
              <p className="text-sm font-bold mb-1">🚀 Entre no ranking Premium</p>
              <p className="text-xs text-muted mb-3">
                Assinantes Pro e Elite têm destaque prioritário e aparecem com maior frequência para outros profissionais.
              </p>
              <button
                onClick={() => router.push("/perfil/carteira")}
                className="brand-gradient glow-brand w-full rounded-2xl py-3 text-sm font-semibold text-white"
              >
                Assinar Plano Pro
              </button>
            </div>
          )}
          {isPaid && (
            <div className="glass rounded-3xl p-4 text-center">
              <p className="text-sm font-bold mb-1">📈 Sua posição atual</p>
              <p className="text-3xl font-black text-brand">#47</p>
              <p className="text-xs text-muted">Continue engajando para subir no ranking</p>
            </div>
          )}
        </>
      )}

      {tab === "conquistas" && (
        <>
          <p className="text-xs text-muted mb-3">Desbloqueie selos completando ações na plataforma</p>

          <div className="flex flex-col gap-2">
            {MEDALHAS.map((m, idx) => (
              <MedalhaCard
                key={m.label}
                {...m}
                desbloqueado={isPaid ? idx < 3 : idx < 1}
              />
            ))}
          </div>

          {!isPaid && (
            <div className="mt-4 glass rounded-3xl p-4 text-center">
              <p className="text-sm font-bold mb-1">👑 Desbloqueie mais conquistas</p>
              <p className="text-xs text-muted mb-3">
                Selos de autoridade aumentam sua visibilidade e geram mais confiança nos parceiros.
              </p>
              <button
                onClick={() => router.push("/perfil/carteira")}
                className="brand-gradient glow-brand w-full rounded-2xl py-3 text-sm font-semibold text-white"
              >
                Assinar Plano Pro
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
