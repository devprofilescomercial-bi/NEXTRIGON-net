"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconBolt } from "@/components/ui";

type Step = 0 | 1 | 2;

export default function VerificacaoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [oabNumero, setOabNumero] = useState("");
  const [oabUf, setOabUf] = useState("");
  const [docBase64, setDocBase64] = useState("");
  const [selfieBase64, setSelfieBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<{ valido: boolean; nome?: string; mensagem: string } | null>(null);

  const docRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const steps = [
    { t: "Dados da OAB", d: "Número e seccional" },
    { t: "Carteira", d: "Foto do documento" },
    { t: "Selfie", d: "Validação facial" },
  ];

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setDocBase64(b64);
  }

  async function handleSelfieUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setSelfieBase64(b64);
  }

  async function handleContinue() {
    setError("");

    if (step === 0) {
      if (!oabNumero.trim() || !oabUf.trim()) {
        setError("Preencha o número e a seccional.");
        return;
      }
      if (!/^\d{4,8}$/.test(oabNumero.replace(/\D/g, ""))) {
        setError("Número de inscrição inválido.");
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!docBase64) {
        setError("Envie a foto da sua carteira OAB.");
        return;
      }
      setStep(2);
      return;
    }

    // Passo 2: Enviar tudo
    if (!selfieBase64) {
      setError("Tire uma selfie para validação.");
      return;
    }

    setLoading(true);
    try {
      // Upload doc no MinIO
      const docRes = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "doc", data: docBase64, mime: "image/jpeg" }),
      });
      const { url: docUrl } = await docRes.json();

      // Upload selfie no MinIO
      const selfieRes = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "selfie", data: selfieBase64, mime: "image/jpeg" }),
      });
      const { url: selfieUrl } = await selfieRes.json();

      // Verificar OAB via CNA
      const verRes = await fetch("/api/verificar-oab", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oab_numero: oabNumero, oab_uf: oabUf }),
      });
      const data = await verRes.json();
      setResultado(data);
    } catch {
      setError("Erro ao enviar verificação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Tela de resultado
  if (resultado) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center text-center px-4">
        <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${resultado.valido ? "bg-success/20" : "bg-danger/20"}`}>
          {resultado.valido
            ? <IconCheck className="h-10 w-10 text-success" />
            : <span className="text-4xl text-danger">✕</span>
          }
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {resultado.valido ? "OAB verificada!" : "Não encontrada"}
        </h2>
        {resultado.nome && (
          <p className="text-brand font-semibold mb-1">{resultado.nome}</p>
        )}
        <p className="text-sm text-muted mb-8 max-w-[280px]">{resultado.mensagem}</p>
        <button
          onClick={() => router.push("/perfil")}
          className="brand-gradient glow-brand w-full rounded-2xl py-3.5 font-semibold text-white"
        >
          Voltar ao perfil
        </button>
        {!resultado.valido && (
          <button onClick={() => { setResultado(null); setStep(0); }} className="mt-3 text-sm text-dim">
            Tentar novamente
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
      <div className="mb-5 mt-1">
        <h1 className="text-[22px] font-bold leading-tight">Verificação OAB</h1>
        <p className="text-sm text-muted">Confiança é o ativo da plataforma. Leva ~2 minutos.</p>
      </div>

      {/* Progress steps */}
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
        <p className="mt-0.5 text-xs text-muted mb-4">{steps[step].d}</p>

        {/* Passo 0: OAB */}
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <input
              placeholder="Número de inscrição (ex.: 123456)"
              value={oabNumero}
              onChange={e => setOabNumero(e.target.value.replace(/\D/g, ""))}
              maxLength={8}
              inputMode="numeric"
              className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
            />
            <input
              placeholder="Seccional (ex.: SP)"
              value={oabUf}
              onChange={e => setOabUf(e.target.value.toUpperCase().slice(0, 2))}
              maxLength={2}
              className="glass-soft w-full rounded-2xl px-4 py-3.5 text-sm text-ink outline-none placeholder:text-dim"
            />
          </div>
        )}

        {/* Passo 1: Documento */}
        {step === 1 && (
          <div>
            <input ref={docRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleDocUpload} />
            <button
              onClick={() => docRef.current?.click()}
              className={`w-full flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition ${docBase64 ? "border-success/60 bg-success/5" : "border-line"}`}
            >
              {docBase64 ? (
                <>
                  <img src={docBase64} alt="Doc" className="h-28 object-contain rounded-xl" />
                  <span className="text-xs text-success font-medium">Foto enviada — toque para trocar</span>
                </>
              ) : (
                <>
                  <span className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                    <IconBolt className="h-6 w-6" />
                  </span>
                  <span className="text-sm text-muted">Toque para enviar foto da carteira OAB</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Passo 2: Selfie */}
        {step === 2 && (
          <div>
            <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieUpload} />
            <button
              onClick={() => selfieRef.current?.click()}
              className={`w-full flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition ${selfieBase64 ? "border-success/60 bg-success/5" : "border-line"}`}
            >
              {selfieBase64 ? (
                <>
                  <img src={selfieBase64} alt="Selfie" className="h-28 object-contain rounded-xl" />
                  <span className="text-xs text-success font-medium">Selfie enviada — toque para trocar</span>
                </>
              ) : (
                <>
                  <span className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                    <IconBolt className="h-6 w-6" />
                  </span>
                  <span className="text-sm text-muted">Tire uma selfie segurando a carteira</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-danger/10 px-4 py-2.5 text-xs font-medium text-danger">{error}</p>
      )}

      <p className="mt-3 text-center text-[11px] text-dim">
        Seus documentos são criptografados e usados só para verificação (LGPD).
      </p>

      <button
        onClick={handleContinue}
        disabled={loading}
        className="brand-gradient glow-brand mt-auto rounded-2xl py-3.5 text-center font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Verificando…" : step < 2 ? "Continuar" : "Enviar para verificação"}
      </button>
    </section>
  );
}
