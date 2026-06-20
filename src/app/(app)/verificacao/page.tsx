"use client";
import { useState } from "react";
import { IconCheck, IconBolt } from "@/components/ui";

export default function VerificacaoPage() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "Dados da OAB", d: "Número e seccional" },
    { t: "Carteira", d: "Foto do documento" },
    { t: "Selfie", d: "Validação facial" },
  ];
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
      <div className="mb-5 mt-1">
        <h1 className="text-[22px] font-bold leading-tight">Verificação OAB</h1>
        <p className="text-sm text-muted">Confiança é o ativo da plataforma. Leva ~2 minutos.</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.t} className="flex flex-1 flex-col items-center gap-1.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${i < step ? "bg-success text-white" : i === step ? "brand-gradient glow-brand text-white" : "glass-soft text-dim"}`}>
              {i < step ? <IconCheck className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-[10px] ${i === step ? "text-ink" : "text-dim"}`}>{s.t}</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="font-semibold">{steps[step].t}</h2>
        <p className="mt-0.5 text-xs text-muted">{steps[step].d}</p>

        {step === 0 && (
          <div className="mt-4 flex flex-col gap-3">
            <input placeholder="Número de inscrição (ex.: 123456)" className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60" />
            <input placeholder="Seccional (ex.: SP)" className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60" />
          </div>
        )}
        {step > 0 && (
          <div className="mt-4 flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-center text-sm text-muted">
            <span className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white">
              <IconBolt className="h-6 w-6" />
            </span>
            {step === 1 ? "Toque para enviar a foto da carteira" : "Toque para tirar a selfie de validação"}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-dim">
        Seus documentos são criptografados e usados só para verificação (LGPD).
      </p>

      <button
        onClick={() => setStep((s) => Math.min(2, s + 1))}
        className="brand-gradient glow-brand mt-auto rounded-2xl py-3.5 text-center font-semibold text-white"
      >
        {step < 2 ? "Continuar" : "Enviar para análise"}
      </button>
    </section>
  );
}
