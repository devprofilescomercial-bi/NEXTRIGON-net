"use client";
import Link from "next/link";
import { IconBolt } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <span className="brand-gradient glow-brand mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white">
          <IconBolt className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-muted">Entre para encontrar seu próximo parceiro.</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">E-mail</span>
          <input type="email" placeholder="voce@escritorio.com.br" className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Senha</span>
          <input type="password" placeholder="••••••••" className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60" />
        </label>
        <Link href="#" className="self-end text-xs text-muted">Esqueci minha senha</Link>
        <Link href="/match" className="brand-gradient glow-brand mt-2 rounded-2xl py-3.5 text-center font-semibold text-white">Entrar</Link>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-dim">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>

      <Link href="/onboarding" className="rounded-2xl border border-line py-3.5 text-center font-semibold text-ink">
        Criar conta
      </Link>
      <p className="mt-6 text-center text-xs text-dim">Colaboração entre advogados · dentro das regras da OAB</p>
    </div>
  );
}
