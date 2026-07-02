"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";


function PasswordStrengthBar({ pw }: { pw: string }) {
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  const colors = ["", "bg-danger", "bg-warning", "bg-brand/80", "bg-success"];
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-line"}`} />
        ))}
      </div>
      {pw.length > 0 && (
        <p className={`text-[11px] font-medium ${score >= 3 ? "text-success" : score >= 2 ? "text-brand" : "text-danger"}`}>
          {labels[score]}
        </p>
      )}
    </div>
  );
}

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!token) setError("Link inválido ou expirado. Solicite uma nova recuperação.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Senha deve ter pelo menos 8 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.replace("/login"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("expired") || msg.includes("invalid")
        ? "Link expirado ou inválido. Solicite uma nova recuperação."
        : "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="brand-gradient glow-brand flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white">✓</div>
        <div>
          <p className="font-semibold text-ink">Senha redefinida!</p>
          <p className="mt-2 text-sm text-muted">Redirecionando para o login em instantes…</p>
        </div>
        <Link href="/login" className="text-sm font-semibold text-brand">Entrar agora →</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">Nova senha</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required minLength={8}
            className="glass-soft w-full rounded-2xl px-4 py-3.5 pr-14 text-sm text-ink outline-none placeholder:text-dim"
          />
          <button
            type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-dim"
          >
            {showPw ? "ocultar" : "mostrar"}
          </button>
        </div>
        <PasswordStrengthBar pw={password} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">Confirmar nova senha</label>
        <input
          type={showPw ? "text" : "password"}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repita a senha"
          required
          className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
        />
        {confirm.length > 0 && (
          <p className={`mt-1.5 text-[11px] font-medium ${confirm === password ? "text-success" : "text-danger"}`}>
            {confirm === password ? "✓ Senhas coincidem" : "Senhas não coincidem"}
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
        disabled={loading || !password || !confirm || password !== confirm || password.length < 8 || !token}
        className="brand-gradient glow-brand mt-1 rounded-2xl py-4 font-bold text-white disabled:opacity-40 transition-opacity"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Salvando…
          </span>
        ) : "Salvar nova senha"}
      </button>

      <Link href="/login" className="mt-2 text-center text-sm font-semibold text-dim">← Voltar ao login</Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col justify-center px-6 py-10">
      <div className="mb-10 flex flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-white/10">
            <img src="/logo.png" alt="Nextrigon" className="h-full w-full object-cover" />
          </span>
          <span className="text-[22px] font-black tracking-[0.12em] text-white">NEXTRIGON</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Nova senha</h1>
          <p className="mt-1.5 text-sm text-muted">Crie uma senha forte para proteger sua conta.</p>
        </div>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-line/20" />}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
