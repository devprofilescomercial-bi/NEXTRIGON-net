"use client";
import { useState } from "react";
import Link from "next/link";
import { IconUser, IconBolt, IconLayers, IconChat } from "@/components/ui";

const GOALS = [
  { id: "contratar", title: "Contratar especialistas", desc: "Encontre profissionais para seu caso.", Icon: IconUser },
  { id: "oferecer", title: "Oferecer meus serviços", desc: "Divulgue sua atuação e receba demandas.", Icon: IconBolt },
  { id: "colaborar", title: "Criar projeto colaborativo", desc: "Monte um time para casos complexos.", Icon: IconLayers },
  { id: "parcerias", title: "Buscar parcerias", desc: "Conecte-se com correspondentes e parceiros.", Icon: IconChat },
];

export default function OnboardingPage() {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col px-6 py-8">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="h-1.5 w-9 rounded-full bg-brand" />
        <span className="h-1.5 w-9 rounded-full bg-line" />
        <span className="h-1.5 w-9 rounded-full bg-line" />
      </div>
      <h1 className="mt-6 text-2xl font-bold leading-snug">Qual é o seu objetivo<br />na Nextrigon?</h1>
      <p className="mt-2 text-sm text-muted">Isso ajuda a conectar você com as melhores oportunidades.</p>

      <div className="mt-6 flex flex-col gap-3">
        {GOALS.map(({ id, title, desc, Icon }) => {
          const active = sel === id;
          return (
            <button
              key={id}
              onClick={() => setSel(id)}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${active ? "border-brand/60 bg-brand/10" : "glass-soft border-transparent"}`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? "brand-gradient glow-brand text-white" : "bg-white/5 text-muted"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className={`block font-semibold ${active ? "text-brand" : "text-ink"}`}>{title}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <Link
        href="/match"
        className={`brand-gradient glow-brand mt-auto rounded-2xl py-3.5 text-center font-semibold text-white transition ${sel ? "" : "pointer-events-none opacity-40"}`}
      >
        Continuar
      </Link>
    </div>
  );
}
