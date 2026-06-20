"use client";
import Link from "next/link";
import { Avatar, IconCheck, IconClose } from "@/components/ui";

function Back() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function Paperclip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
      <path d="M21 11l-8.5 8.5a4 4 0 01-6-6L14 5a2.6 2.6 0 014 4l-8.5 8.5a1.3 1.3 0 01-2-2L14 8" />
    </svg>
  );
}
function Send() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 11l18-8-8 18-2.5-7.5L3 11z" /></svg>
  );
}

export default function ConversaPage() {
  return (
    <section className="-mx-5 flex min-h-0 flex-1 flex-col">
      {/* contact strip */}
      <div className="flex items-center gap-3 border-b border-line px-5 pb-3">
        <Link href="/chat" className="text-muted"><Back /></Link>
        <Avatar initials="MA" grad={["#fb923c", "#ea580c"]} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold leading-tight">Dra. Marina Alves</div>
          <div className="text-[11px] text-success">online agora</div>
        </div>
      </div>

      {/* messages */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4">
        <div className="self-start max-w-[78%] rounded-2xl rounded-tl-md glass-soft px-3.5 py-2.5 text-sm">
          Olá! Recebi seu projeto e já revisei os primeiros pontos.
        </div>
        <div className="self-end max-w-[78%] rounded-2xl rounded-tr-md brand-gradient px-3.5 py-2.5 text-sm text-white">
          Perfeito, obrigado! Pode me enviar a proposta?
        </div>

        {/* file bubble */}
        <div className="self-start flex max-w-[78%] items-center gap-3 rounded-2xl glass px-3.5 py-3">
          <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white">PDF</span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Proposta_Parceria.pdf</div>
            <div className="text-[11px] text-dim">PDF · 1,2 MB</div>
          </div>
        </div>

        {/* proposal card */}
        <div className="self-start w-full max-w-[88%] rounded-2xl glass p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-brand">PROPOSTA DE PARCERIA</span>
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">aguardando</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[11px] text-dim">Honorário</div>
              <div className="font-semibold">R$ 4.500</div>
            </div>
            <div>
              <div className="text-[11px] text-dim">Prazo</div>
              <div className="font-semibold">30 dias</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted">Escopo: elaboração de contrato social + acordo de sócios.</div>
          <div className="mt-4 flex gap-2.5">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-semibold text-danger">
              <IconClose className="h-4 w-4" /> Recusar
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-sm font-semibold text-white">
              <IconCheck className="h-4 w-4" /> Aceitar
            </button>
          </div>
        </div>
      </div>

      {/* input bar */}
      <div className="flex items-center gap-2 border-t border-line px-5 pt-3">
        <button className="text-dim"><Paperclip /></button>
        <input placeholder="Digite uma mensagem..." className="glass-soft flex-1 rounded-full px-4 py-2.5 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60" />
        <button className="brand-gradient glow-brand flex h-10 w-10 items-center justify-center rounded-full text-white"><Send /></button>
      </div>
    </section>
  );
}
