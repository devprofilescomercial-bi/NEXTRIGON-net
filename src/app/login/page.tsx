"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-white/10">
        <img src="/logo.png" alt="Nextrigon" className="h-full w-full object-cover" />
      </span>
      <span className="text-[22px] font-black tracking-[0.12em] text-white">NEXTRIGON</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
        const msg = result.error.message ?? "";
        const code = (result.error as { code?: string }).code ?? "";
        if (msg.toLowerCase().includes("too many")) {
          setError("Muitas tentativas. Aguarde alguns segundos e tente novamente.");
        } else if (code === "EMAIL_NOT_VERIFIED" || msg.toLowerCase().includes("not verified")) {
          setError("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de ativação.");
        } else {
          setError("E-mail ou senha incorretos. Verifique e tente novamente.");
        }
      } else {
        router.replace("/match");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/match",
      });
      if (result?.error) {
        setError("Erro ao conectar com Google. Verifique a configuração e tente novamente.");
        setGoogleLoading(false);
      }
      // Se sem erro, redirect está acontecendo — não resetar loading
    } catch {
      setError("Erro ao acessar login com Google. Tente novamente.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col justify-center px-6 py-10">

      <div className="mb-10 flex flex-col items-center gap-5">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="mt-1.5 text-sm text-muted">Entre com sua conta para continuar.</p>
        </div>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="glass-soft mb-4 flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-sm font-semibold transition hover:border-brand/30 disabled:opacity-50"
      >
        {googleLoading
          ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          : <GoogleIcon />
        }
        Continuar com Google
      </button>

      <div className="mb-4 flex items-center gap-3 text-xs text-dim">
        <span className="h-px flex-1 bg-line" /> ou entre com e-mail <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate autoComplete="on">

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">E-mail profissional</label>
          <input
            type="email" inputMode="email" autoComplete="email"
            placeholder="voce@escritorio.com.br"
            value={email} onChange={e => setEmail(e.target.value)} required
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-muted">Senha</label>
            <Link href="/forgot-password" className="text-[11px] text-brand underline-offset-2 hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Mínimo 8 caracteres"
              value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8}
              className="glass-soft w-full rounded-2xl px-4 py-3.5 pr-14 text-sm text-ink outline-none placeholder:text-dim"
            />
            <button
              type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-medium text-dim"
            >
              {showPw ? "ocultar" : "mostrar"}
            </button>
          </div>
          {password.length > 0 && (
            <p className={`mt-1.5 text-[11px] font-medium ${password.length >= 8 ? "text-success" : "text-danger"}`}>
              {password.length >= 8 ? "✓ Senha válida" : `${8 - password.length} caracteres faltando`}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-danger/10 px-4 py-3">
            <span className="mt-0.5 text-danger">⚠</span>
            <p className="text-xs font-medium text-danger">{error}</p>
          </div>
        )}

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

      <Link href="/register" className="rounded-2xl border border-line py-4 text-center font-bold text-ink transition hover:border-brand/40">
        Criar conta grátis
      </Link>

      <p className="mt-8 text-center text-[11px] text-dim leading-relaxed">
        Colaboração entre advogados · dentro das regras da OAB<br />
        Seus dados são protegidos pela LGPD
      </p>
    </div>
  );
}
