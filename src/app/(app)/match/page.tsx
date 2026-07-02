"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar, Tag,
  IconClose, IconPin, IconBolt, IconStar,
} from "@/components/ui";

const GRADS: [string, string][] = [
  ["#fb923c", "#ea580c"], ["#3256a8", "#1e3a8a"],
  ["#7c3aed", "#4c1d95"], ["#0891b2", "#0e7490"],
  ["#16a34a", "#15803d"], ["#dc2626", "#991b1b"],
];

type Profile = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  areas: string[];
  tags: string[];
  city: string | null;
  uf: string | null;
};

type Card = Profile & { initials: string; grad: [string, string]; area: string; compat: number };

function toCard(p: Profile): Card {
  const words = p.name.trim().split(" ");
  const initials = ((words[0]?.[0] ?? "") + (words[words.length - 1]?.[0] ?? "")).toUpperCase();
  const grad = GRADS[p.id.charCodeAt(0) % GRADS.length];
  return { ...p, initials, grad, area: p.areas[0] ?? "Direito", compat: 70 + (p.id.charCodeAt(1) % 28) };
}

type Stats = {
  likesRecebidos: number;
  likesSemana: number;
  matchesAtivos: number;
  swipesMes: number;
  swipesRestantes: number | null;
  plano: string;
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
      <path d="M12 2C6.5 2 2 8 2 12c0 .5.1 1 .3 1.5L7 9l2 2 3-3 2 2 2-2 4.7 4.7c.2-.5.3-1 .3-1.5 0-4-4.5-8.2-9-9z" />
      <path d="M7 16l-3 3M17 16l3 3M7 9l-5 5M17 9l5 5" />
    </svg>
  );
}

export default function MatchPage() {
  const router = useRouter();
  const [deck, setDeck] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [matched, setMatched] = useState<Card | null>(null);
  const [matchedConvId, setMatchedConvId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showPrimeiraImpressao, setShowPrimeiraImpressao] = useState(false);
  const [mensagemPI, setMensagemPI] = useState("");
  const [pendingLike, setPendingLike] = useState<Card | null>(null);

  useEffect(() => {
    fetch("/api/match", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then((profiles: Profile[]) => setDeck(profiles.map(toCard)))
      .catch(() => {});
    fetch("/api/monetizacao/stats", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {});
  }, []);

  const current = deck[i];
  const plano = stats?.plano ?? "free";
  const swipesRestantes = stats?.swipesRestantes;
  const limiteAtingido = plano === "free" && swipesRestantes != null && swipesRestantes <= 0;

  async function registrarSwipe(toUserId: string, direction: "like" | "pass") {
    const res = await fetch("/api/match/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ toUserId, direction }),
    });
    if (res.ok) return res.json() as Promise<{ matched: boolean; conversationId?: string }>;
    return { matched: false };
  }

  async function next() {
    if (current) await registrarSwipe(current.id, "pass");
    setI(v => v + 1);
    setStats(s => s ? { ...s, swipesMes: s.swipesMes + 1, swipesRestantes: s.swipesRestantes !== null ? Math.max(0, s.swipesRestantes - 1) : null } : s);
  }

  function iniciarLike() {
    if (!current) return;
    if (plano === "elite") {
      setPendingLike(current);
      setShowPrimeiraImpressao(true);
    } else {
      confirmarLike(current);
    }
  }

  async function confirmarLike(card: Card, _mensagem?: string) {
    const result = await registrarSwipe(card.id, "like");
    if (result.matched) {
      setMatched(card);
      setMatchedConvId(result.conversationId ?? null);
    }
    setI(v => v + 1);
    setStats(s => s ? { ...s, swipesMes: s.swipesMes + 1, swipesRestantes: s.swipesRestantes !== null ? Math.max(0, s.swipesRestantes - 1) : null } : s);
    setShowPrimeiraImpressao(false);
    setPendingLike(null);
    setMensagemPI("");
  }

  function enviarPrimeiraImpressao() {
    if (!pendingLike) return;
    confirmarLike(pendingLike, mensagemPI);
  }

  const likesRecebidos = stats?.likesRecebidos ?? 0;
  const likesSemana = stats?.likesSemana ?? 0;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* FOMO Banner */}
      {(likesRecebidos > 0 || likesSemana > 0) && (
        <button
          onClick={() => router.push("/oportunidades")}
          className="mb-3 mt-1 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-lg">🔥</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">
              {likesSemana > 0
                ? `${likesSemana} profissional${likesSemana > 1 ? "is" : ""} quer trabalhar com você`
                : `${likesRecebidos} oportunidade${likesRecebidos > 1 ? "s" : ""} recebida${likesRecebidos > 1 ? "s" : ""}`}
            </p>
            <p className="text-xs text-muted truncate">
              {plano === "free" ? "Assine o Pro para ver quem são →" : "Ver oportunidades →"}
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 shrink-0 text-dim">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}

      {/* sub-header */}
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight">Match</h1>
          <p className="text-sm text-muted">Parceiros compatíveis com você</p>
        </div>
        <div className="flex items-center gap-2">
          {plano === "free" && swipesRestantes != null && (
            <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${swipesRestantes <= 2 ? "bg-danger/15 text-danger" : "glass-soft text-muted"}`}>
              {swipesRestantes} de 5 restantes
            </span>
          )}
          {plano !== "free" && (
            <span className="glass-soft rounded-full px-3 py-1.5 text-xs font-medium text-muted">
              {deck.length} perfis
            </span>
          )}
        </div>
      </div>

      {/* Elite Primeira Impressão badge */}
      {plano === "elite" && (
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 px-3 py-2">
          <span className="text-sm">✨</span>
          <p className="text-xs text-purple-300 font-medium">Primeira Impressão ativada — sua mensagem será enviada com o interesse</p>
        </div>
      )}

      {/* deck */}
      <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-y-auto pb-2">
        {limiteAtingido ? (
          /* Paywall card */
          <div className="glass mt-6 flex w-full flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center">
            <span className="brand-gradient glow-brand flex h-14 w-14 items-center justify-center rounded-2xl" style={{ fontSize: 28 }}>
              🔒
            </span>
            <div>
              <h3 className="text-lg font-bold">Limite mensal atingido</h3>
              <p className="mt-1 max-w-[260px] text-sm text-muted">
                Você usou seus 5 matches gratuitos do mês. Assine o Plano Pro para conexões ilimitadas.
              </p>
            </div>

            {/* FOMO dentro do paywall */}
            {likesSemana > 0 && (
              <div className="w-full rounded-2xl border border-brand/25 bg-brand/8 px-4 py-3">
                <p className="text-sm font-semibold text-brand">
                  🔥 {likesSemana} profissional{likesSemana > 1 ? "is" : ""} demonstrou interesse em você esta semana
                </p>
                <p className="text-xs text-muted mt-0.5">Desbloqueie para ver quem são e conversar</p>
              </div>
            )}

            <button
              onClick={() => router.push("/perfil/carteira")}
              className="brand-gradient glow-brand w-full rounded-2xl py-3.5 font-semibold text-white"
            >
              Ver Plano Pro · R$ 49/mês
            </button>
            <button
              onClick={() => router.push("/oportunidades")}
              className="w-full rounded-2xl border border-line py-2.5 text-sm font-medium text-muted"
            >
              Ver oportunidades recebidas
            </button>
          </div>
        ) : current ? (
          <div className="relative w-full" style={{ minHeight: 400 }}>
            {/* peeking cards behind */}
            {deck.slice(i + 1, i + 3).map((l, idx) => (
              <div
                key={l.id}
                className="glass absolute inset-x-0 top-0 rounded-3xl"
                style={{
                  height: 400,
                  transform: `translateY(${(idx + 1) * 14}px) scale(${1 - (idx + 1) * 0.04})`,
                  opacity: 0.5 - idx * 0.2,
                  zIndex: 0,
                }}
              />
            ))}

            {/* top card */}
            <article
              key={current.id}
              className="glass animate-card-in relative z-10 overflow-hidden rounded-3xl"
            >
              {/* media */}
              <div
                className="relative h-40 w-full"
                style={{ background: `radial-gradient(120% 120% at 30% 0%, ${current.grad[0]}, ${current.grad[1]})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  <IconStar className="h-3.5 w-3.5 text-gold" /> {current.compat}% compatível
                </span>
                <div className="absolute -bottom-7 left-5">
                  <span className="block rounded-3xl ring-4 ring-[#0b1322]">
                    <Avatar initials={current.initials} grad={current.grad} size={72} />
                  </span>
                </div>
              </div>

              {/* body */}
              <div className="px-5 pb-5 pt-9">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-bold">{current.name}</h2>
                </div>
                <p className="mt-0.5 font-semibold text-brand">{current.area}</p>

                <div className="mt-2 flex items-center gap-3 text-sm text-muted">
                  {(current.city || current.uf) && (
                    <span className="inline-flex items-center gap-1">
                      <IconPin className="h-4 w-4 text-dim" /> {[current.city, current.uf].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {current.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>

                {current.bio && (
                  <div className="glass-soft mt-4 flex items-center gap-2 rounded-2xl px-3.5 py-3 text-sm text-muted">
                    <IconBolt className="h-4 w-4 shrink-0 text-brand" />
                    <span className="line-clamp-2">{current.bio}</span>
                  </div>
                )}

                {/* Aviso de Primeira Impressão para Elite */}
                {plano === "elite" && (
                  <p className="mt-2 text-center text-[11px] text-purple-400">
                    ✨ Ao demonstrar interesse, você poderá enviar uma mensagem inicial
                  </p>
                )}
              </div>
            </article>
          </div>
        ) : (
          <div className="glass mt-6 flex w-full flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
            <span className="brand-gradient glow-brand flex h-14 w-14 items-center justify-center rounded-2xl" style={{ fontSize: 28 }}>
              🤝
            </span>
            <h3 className="text-lg font-bold">Você viu todos por agora</h3>
            <p className="max-w-[260px] text-sm text-muted">
              Ajuste os filtros ou volte mais tarde — novos parceiros entram toda semana.
            </p>
            <button onClick={() => setI(0)} className="mt-2 rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted">
              Recomeçar
            </button>
          </div>
        )}
      </div>

      {/* actions */}
      {current && !limiteAtingido && (
        <div className="flex shrink-0 items-center justify-center gap-6 pt-4 pb-2">
          <button
            onClick={next}
            aria-label="Passar"
            className="glass flex h-14 w-14 items-center justify-center rounded-full text-danger transition active:scale-90"
          >
            <IconClose className="h-6 w-6" />
          </button>
          <button
            onClick={iniciarLike}
            aria-label="Tenho interesse"
            className="brand-gradient glow-brand flex h-[72px] w-[72px] items-center justify-center rounded-full text-white transition active:scale-90"
            style={{ fontSize: 32 }}
          >
            🤝
          </button>
          <button
            onClick={next}
            aria-label="Super interesse"
            className="glass flex h-14 w-14 items-center justify-center rounded-full text-gold transition active:scale-90"
          >
            <IconStar className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Primeira Impressão modal (Elite) */}
      {showPrimeiraImpressao && pendingLike && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-6 backdrop-blur-sm">
          <div className="w-full max-w-[400px] glass rounded-3xl p-6 animate-pop">
            <div className="mb-4 flex items-center gap-3">
              <Avatar initials={pendingLike.initials} grad={pendingLike.grad} size={48} />
              <div>
                <p className="font-bold text-sm">{pendingLike.name}</p>
                <p className="text-xs text-brand">{pendingLike.area}</p>
              </div>
              <span className="ml-auto rounded-full bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold text-purple-400">✨ Elite</span>
            </div>

            <h2 className="font-bold text-lg mb-1">Primeira Impressão</h2>
            <p className="text-xs text-muted mb-3">
              Envie uma mensagem junto com seu interesse. Isso aumenta muito as chances de resposta.
            </p>

            <textarea
              value={mensagemPI}
              onChange={e => setMensagemPI(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Ex: Tenho 10 anos de experiência em direito tributário e busco parceiros para casos empresariais..."
              className="w-full resize-none rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-ink placeholder:text-dim focus:outline-none focus:border-brand/50 mb-1"
            />
            <p className="text-right text-[11px] text-dim mb-4">{mensagemPI.length}/200</p>

            <div className="flex gap-2">
              <button
                onClick={() => confirmarLike(pendingLike)}
                className="flex-1 rounded-2xl border border-line py-3 text-sm font-medium text-muted"
              >
                Pular
              </button>
              <button
                onClick={enviarPrimeiraImpressao}
                className="flex-1 brand-gradient glow-brand rounded-2xl py-3 text-sm font-semibold text-white"
              >
                Enviar + Interesse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match overlay */}
      {matched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-8 backdrop-blur-sm">
          <div className="animate-pop w-full max-w-[360px] text-center">
            <p className="text-gradient text-3xl font-black tracking-tight">É um match!</p>
            <p className="mt-2 text-sm text-muted">
              Você e {matched.name.split(" ").slice(0, 2).join(" ")} demonstraram interesse.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Avatar initials="EU" grad={["#fb923c", "#ea580c"]} size={72} />
              <span className="brand-gradient glow-brand flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ fontSize: 24 }}>
                🤝
              </span>
              <Avatar initials={matched.initials} grad={matched.grad} size={72} />
            </div>
            <button
              onClick={() => { setMatched(null); router.push(matchedConvId ? `/chat/${matchedConvId}` : "/chat"); }}
              className="brand-gradient glow-brand mt-7 w-full rounded-2xl py-3.5 font-semibold text-white"
            >
              Conversar agora
            </button>
            <button onClick={() => setMatched(null)} className="mt-3 w-full py-2 text-sm text-dim">
              Continuar vendo perfis
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
