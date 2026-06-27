"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

function Logo() {
  return (
    <svg viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#logoGrad)" />
      <path d="M23 7L12 22h9l-2 11 11-15h-9z" fill="white" />
      <text x="48" y="27" fontFamily="system-ui,sans-serif" fontWeight="900" fontSize="16" letterSpacing="1" fill="white">NEXTRIGON</text>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Informe seu e-mail."); return; }
    if (!password)     { setError("Informe sua senha."); return; }
    if (password.length < 8) { setError("Senha deve ter pelo menos 8 caracteres."); return; }

    setLoading(true);
    try {
      const result = await signIn.email({ email: email.trim(), password });
      if (result?.error) {
        setError("E-mail ou senha incorretos. Verifique e tente novamente.");
      } else {
        router.replace("/match");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col justify-center px-6 py-10">

      {/* Logo centralizada */}
      <div className="mb-10 flex flex-col items-center gap-5">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="mt-1.5 text-sm text-muted">Entre com seu e-mail e senha cadastrados.</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate autoComplete="on">

        {/* E-mail */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">E-mail profissional</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@escritorio.com.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
          />
        </div>

        {/* Senha */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-muted">Senha</label>
            <Link href="#" className="text-[11px] text-dim underline-offset-2 hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="glass-soft w-full rounded-2xl px-4 py-3.5 pr-14 text-sm text-ink outline-none placeholder:text-dim"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-medium text-dim"
              tabIndex={-1}
            >
              {showPw ? "ocultar" : "mostrar"}
            </button>
          </div>
          {/* Indicador visual da senha */}
          {password.length > 0 && (
            <p className={`mt-1.5 text-[11px] font-medium ${password.length >= 8 ? "text-success" : "text-danger"}`}>
              {password.length >= 8 ? "✓ Senha válida" : `${8 - password.length} caracteres faltando`}
            </p>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-danger/10 px-4 py-3">
            <span className="mt-0.5 text-danger">⚠</span>
            <p className="text-xs font-medium text-danger">{error}</p>
          </div>
        )}

        {/* Botão entrar */}
        <button
          type="submit"
          disabled={loading || !email || !password || password.length < 8}
          className="brand-gradient glow-brand mt-1 rounded-2xl py-4 text-center font-bold text-white disabled:opacity-40 transition-opacity"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Entrando…
            </span>
          ) : "Entrar"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3 text-xs text-dim">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>

      <Link
        href="/register"
        className="rounded-2xl border border-line py-4 text-center font-bold text-ink transition hover:border-brand/40"
      >
        Criar conta grátis
      </Link>

      <p className="mt-8 text-center text-[11px] text-dim leading-relaxed">
        Colaboração entre advogados · dentro das regras da OAB<br />
        Seus dados são protegidos pela LGPD
      </p>
    </div>
  );
}
