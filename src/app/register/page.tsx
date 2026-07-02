"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

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
  const [emailSent, setEmailSent] = useState("");

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
        const msg = result.error.message ?? "";
        if (msg.toLowerCase().includes("too many")) {
          setError("Muitas tentativas. Aguarde alguns segundos e tente novamente.");
        } else if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
          setError("Este e-mail já está cadastrado. Verifique sua caixa de entrada — enviamos instruções.");
          fetch("/api/notify/existing-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }).catch(() => {});
        } else {
          setError(msg || "Erro ao criar conta. Tente novamente.");
        }
      } else {
        setEmailSent(email);
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-[440px] flex-col items-center justify-center px-6 py-10 text-center">
        <Logo />
        <div className="mt-8 glass rounded-3xl px-6 py-8 w-full">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl mx-auto text-4xl"
            style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}>
            ✉️
          </div>
          <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Enviamos um link de confirmação para<br />
            <strong className="text-ink">{emailSent}</strong>
          </p>
          <p className="mt-4 text-xs text-dim leading-relaxed">
            Clique no link no e-mail para ativar sua conta.<br />
            Verifique também a pasta de spam.
          </p>
          <Link href="/login" className="mt-6 block rounded-2xl border border-line py-3.5 text-center font-semibold text-ink">
            Ir para o login
          </Link>
        </div>
      </div>
    );
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
