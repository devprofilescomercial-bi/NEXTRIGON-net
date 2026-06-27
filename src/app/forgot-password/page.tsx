"use client";
import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";

function Logo() {
  return (
    <svg viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-auto">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#g)" />
      <path d="M23 7L12 22h9l-2 11 11-15h-9z" fill="white" />
      <text x="48" y="27" fontFamily="system-ui,sans-serif" fontWeight="900" fontSize="16" letterSpacing="1" fill="white">NEXTRIGON</text>
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Informe seu e-mail."); return; }
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(
        email.trim(),
        `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/reset-password`,
      );
      setSent(true);
    } catch {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col justify-center px-6 py-10">

      <div className="mb-10 flex flex-col items-center gap-5">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
          <p className="mt-1.5 text-sm text-muted leading-relaxed">
            Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha.
          </p>
        </div>
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="brand-gradient glow-brand flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white">
            ✉
          </div>
          <div>
            <p className="font-semibold text-ink">E-mail enviado!</p>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Se o e-mail <strong className="text-ink">{email}</strong> estiver cadastrado,<br />
              você receberá o link em instantes.<br />
              Verifique também a caixa de spam.
            </p>
          </div>
          <Link href="/login" className="text-sm font-semibold text-brand">
            ← Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">E-mail cadastrado</label>
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

          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-danger/10 px-4 py-3">
              <span className="mt-0.5 text-danger">⚠</span>
              <p className="text-xs font-medium text-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="brand-gradient glow-brand mt-1 rounded-2xl py-4 font-bold text-white disabled:opacity-40 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enviando…
              </span>
            ) : "Enviar link de recuperação"}
          </button>

          <Link href="/login" className="mt-2 text-center text-sm font-semibold text-dim">
            ← Voltar ao login
          </Link>
        </form>
      )}
    </div>
  );
}
