"use client";

import { useState } from "react";
import { lawyers, type Lawyer } from "@/lib/mock";
import {
  Avatar, Stars, Tag, VerifiedBadge,
  IconClose, IconPin, IconBolt, IconStar,
} from "@/components/ui";

function compat(l: Lawyer) {
  return Math.min(99, Math.round(l.rating * 20));
}

export default function MatchPage() {
  const [i, setI] = useState(0);
  const [matched, setMatched] = useState<Lawyer | null>(null);
  const deck = lawyers.slice(i);
  const current = deck[0];

  function next() {
    setI((v) => v + 1);
  }
  function like() {
    if (current?.mutual) setMatched(current);
    next();
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* sub-header */}
      <div className="mb-4 mt-1 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight">Match</h1>
          <p className="text-sm text-muted">Parceiros compatíveis com você</p>
        </div>
        <span className="glass-soft rounded-full px-3 py-1.5 text-xs font-medium text-muted">
          {deck.length} perfis
        </span>
      </div>

      {/* deck */}
      <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-y-auto pb-2">
        {current ? (
          <div className="relative w-full" style={{ minHeight: 400 }}>
            {/* peeking cards behind */}
            {deck.slice(1, 3).map((l, idx) => (
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
                  <IconStar className="h-3.5 w-3.5 text-gold" /> {compat(current)}% compatível
                </span>
                <div className="absolute -bottom-7 left-5">
                  <span className="block rounded-3xl ring-4 ring-[#0b1322]">
                    <Avatar initials={current.initials} grad={current.grad} size={72} />
                  </span>
                </div>
              </div>

              {/* body */}
              <div className="px-5 pb-5 pt-9">
                <h2 className="text-xl font-bold">{current.name}</h2>
                <p className="mt-0.5 font-semibold text-brand">{current.area}</p>

                <div className="mt-2 flex items-center gap-3 text-sm text-muted">
                  <span className="inline-flex items-center gap-1">
                    <IconPin className="h-4 w-4 text-dim" /> {current.city} · {current.uf}
                  </span>
                  <Stars rating={current.rating} reviews={current.reviews} />
                </div>

                {current.verified && <VerifiedBadge className="mt-3" />}

                <div className="mt-3 flex flex-wrap gap-2">
                  {current.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>

                <div className="glass-soft mt-4 flex items-center gap-2 rounded-2xl px-3.5 py-3 text-sm text-muted">
                  <IconBolt className="h-4 w-4 shrink-0 text-brand" />
                  <span>{current.reason}</span>
                </div>
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
      {current && (
        <div className="flex shrink-0 items-center justify-center gap-6 pt-4 pb-2">
          <button
            onClick={next}
            aria-label="Passar"
            className="glass flex h-14 w-14 items-center justify-center rounded-full text-danger transition active:scale-90"
          >
            <IconClose className="h-6 w-6" />
          </button>
          <button
            onClick={like}
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

      {/* match overlay */}
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
              onClick={() => setMatched(null)}
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
