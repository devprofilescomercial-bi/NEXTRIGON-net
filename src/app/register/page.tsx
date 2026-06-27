"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

function Logo() {
  return (
    <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-auto">
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#lg2)" />
      <path d="M21 6L11 20h8l-2 10 10-14h-8z" fill="white" />
      <text x="44" y="24" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15" letterSpacing="0.5" fill="white">NEXTRIGON</text>
    </svg>
  );
}

const BARS = [
  { label: "Fraca", color: "#ef4444" },
  { label: "Regular", color: "#f97316" },
  { label: "Boa", color: "#eab308" },
  { label: "Forte", color: "#22c55e" },
];

function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = pwStrength(password);

  const pwReqs = [
    { ok: password.length >= 8, text: "Mínimo 8 caracteres" },
    { ok: /[A-Z]/.test(password), text: "Letra maiúscula" },
    { ok: /[0-9]/.test(password), text: "Número" },
    { ok: /[^A-Za-z0-9]/.test(password), text: "Símbolo (!@#$...)" },
  ];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Informe seu nome completo."); return; }
    if (!email) { setError("Informe um e-mail válido."); return; }
    if (strength < 4) { setError("Sua senha não atende a todos os requisitos."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    try {
      const result = await signUp.email({ name: name.trim(), email, password });
      if (result.error) {
        setError(result.error.message || "Erro ao criar conta. Tente outro e-mail.");
      } else {
        router.push("/onboarding");
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="mt-1 text-sm text-muted">Gratuita. Sem cartão de crédito.</p>
        </div>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-3" noValidate>
        {/* Nome */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Nome completo</span>
          <input
            type="text"
            placeholder="Dr. João Silva"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
          />
        </label>

        {/* E-mail */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">E-mail profissional</span>
          <input
            type="email"
            placeholder="voce@escritorio.com.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
          />
        </label>

        {/* Senha */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Senha</span>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Mín. 8 caracteres, letras, números e símbolo"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              className="glass-soft w-full rounded-2xl px-4 py-3.5 pr-12 text-sm text-ink outline-none placeholder:text-dim"
            />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dim text-xs">
              {showPw ? "ocultar" : "ver"}
            </button>
          </div>

          {/* Barra de força */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i < strength ? BARS[strength - 1]?.color : "rgba(255,255,255,0.1)" }} />
                ))}
              </div>
              <p className="mt-1 text-[11px]" style={{ color: strength > 0 ? BARS[strength - 1]?.color : "#6b7280" }}>
                {strength > 0 ? BARS[strength - 1]?.label : ""}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {pwReqs.map(r => (
                  <span key={r.text} className={`flex items-center gap-1.5 text-[11px] ${r.ok ? "text-success" : "text-dim"}`}>
                    <span className="text-[10px]">{r.ok ? "✓" : "○"}</span> {r.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </label>

        {/* Confirmar senha */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Confirmar senha</span>
          <input
            type={showPw ? "text" : "password"}
            placeholder="Repita a senha"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
          />
          {confirm.length > 0 && password !== confirm && (
            <p className="mt-1 text-[11px] text-danger">As senhas não coincidem</p>
          )}
        </label>

        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-xs font-medium text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || strength < 4 || password !== confirm}
          className="brand-gradient glow-brand mt-2 rounded-2xl py-3.5 text-center font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Criando conta…" : "Criar conta grátis"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-dim">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>

      <Link href="/login" className="rounded-2xl border border-line py-3.5 text-center font-semibold text-ink">
        Já tenho conta
      </Link>

      <p className="mt-6 text-center text-xs text-dim">
        Ao criar conta você concorda com os{" "}
        <Link href="/privacidade" className="text-muted underline underline-offset-2">Termos e Privacidade</Link>
      </p>
    </div>
  );
}
