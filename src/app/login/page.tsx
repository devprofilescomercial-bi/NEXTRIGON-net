"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

function Logo() {
  return (
    <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-auto">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* Ícone raio */}
      <rect width="36" height="36" rx="10" fill="url(#lg)" />
      <path d="M21 6L11 20h8l-2 10 10-14h-8z" fill="white" />
      {/* Texto */}
      <text x="44" y="24" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15" letterSpacing="0.5" fill="white">NEXTRIGON</text>
    </svg>
  );
}

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    const s = strength(password);
    if (password.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError("E-mail ou senha incorretos.");
      } else {
        router.push("/match");
      }
    } catch {
      setError("Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-muted">Entre para encontrar seu próximo parceiro.</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3" noValidate>
        {/* E-mail */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">E-mail</span>
          <input
            type="email"
            placeholder="voce@escritorio.com.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60"
          />
        </label>

        {/* Senha */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Senha</span>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="glass-soft w-full rounded-2xl px-4 py-3.5 pr-12 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dim text-xs"
            >
              {showPw ? "ocultar" : "ver"}
            </button>
          </div>
        </label>

        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-xs font-medium text-danger">{error}</p>
        )}

        <Link href="#" className="self-end text-xs text-muted">Esqueci minha senha</Link>

        <button
          type="submit"
          disabled={loading}
          className="brand-gradient glow-brand mt-2 rounded-2xl py-3.5 text-center font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-dim">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>

      <Link href="/register" className="rounded-2xl border border-line py-3.5 text-center font-semibold text-ink">
        Criar conta grátis
      </Link>

      <p className="mt-6 text-center text-xs text-dim">Colaboração entre advogados · dentro das regras da OAB</p>
    </div>
  );
}
