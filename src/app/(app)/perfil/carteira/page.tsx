"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PLANOS = [
  {
    id: "pro", name: "Pro", price: "R$ 49", period: "/mês", popular: false,
    cor: "#fb923c",
    features: [
      "Matches ilimitados",
      "Ver quem demonstrou interesse",
      "Chat ilimitado",
      "2 Boosts por mês",
      "Calculadora de ganhos",
      "Acesso completo às oportunidades",
    ],
  },
  {
    id: "elite", name: "Elite", price: "R$ 129", period: "/mês", popular: true,
    cor: "#a855f7",
    features: [
      "Tudo do Plano Pro",
      "5 Boosts por mês",
      "Destaque nacional",
      "✨ Primeira Impressão",
      "Perfil verificado",
      "Ranking Premium",
      "Relatórios completos",
      "Prioridade nas recomendações",
    ],
  },
];

const BOOST_PACKS = [
  { id: "b1", qtd: 1, price: "R$ 19", label: "1 Boost" },
  { id: "b5", qtd: 5, price: "R$ 69", label: "5 Boosts" },
  { id: "b10", qtd: 10, price: "R$ 119", label: "10 Boosts" },
];

const PLANO_LABEL: Record<string, string> = { free: "Gratuito", pro: "Pro", elite: "Elite" };
const PLANO_COR: Record<string, string> = { free: "#6b7280", pro: "#fb923c", elite: "#a855f7" };

type PlanInfo = { plano: string; planoExpiraEm: string | null };
type PixData = { qr_code: string; qr_code_base64: string; payment_id: string };

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function CarteiraPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [pix, setPix] = useState<PixData | null>(null);
  const [pixPlanId, setPixPlanId] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");
  const [copied, setCopied] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [boostAtivo, setBoostAtivo] = useState<{ expiresAt: string } | null>(null);
  const [ativandoBoost, setAtivandoBoost] = useState(false);

  useEffect(() => {
    fetch("/api/perfil/plano", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setPlanInfo);
    fetch("/api/monetizacao/boost", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.boostAtivo && setBoostAtivo(d.boostAtivo));
  }, []);

  useEffect(() => {
    if (params.get("status") === "sucesso") setSucesso(true);
  }, [params]);

  async function handlePix(planId: string) {
    setLoadingPlan(`pix-${planId}`);
    try {
      const res = await fetch("/api/mercadopago/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json();
      if (data.qr_code) {
        setPix({ qr_code: data.qr_code, qr_code_base64: data.qr_code_base64, payment_id: data.payment_id });
        setPixPlanId(planId);
      } else {
        alert("Erro ao gerar PIX. Verifique a configuração do Mercado Pago.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setLoadingPlan("");
    }
  }

  async function handleCartao(planId: string) {
    setLoadingPlan(`cartao-${planId}`);
    try {
      const res = await fetch("/api/mercadopago/assinatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.open(data.init_point, "_blank");
      } else {
        alert("Erro ao iniciar assinatura.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setLoadingPlan("");
    }
  }

  async function ativarBoost() {
    setAtivandoBoost(true);
    try {
      const res = await fetch("/api/monetizacao/boost", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) {
        setBoostAtivo({ expiresAt: data.expiresAt });
        alert("🚀 Boost ativado! Seu perfil estará em destaque por 24 horas.");
      } else {
        alert(data.error || "Erro ao ativar boost.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setAtivandoBoost(false);
    }
  }

  function copiarPix() {
    if (!pix?.qr_code) return;
    navigator.clipboard.writeText(pix.qr_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const planoAtual = planInfo?.plano ?? "free";
  const isPaid = planoAtual === "pro" || planoAtual === "elite";
  const expira = planInfo?.planoExpiraEm
    ? new Date(planInfo.planoExpiraEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const boostExpiraEm = boostAtivo?.expiresAt
    ? new Date(boostAtivo.expiresAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      {/* Header */}
      <div className="mt-1 mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="text-xl font-bold">Carteira e plano</h1>
      </div>

      {/* Sucesso */}
      {sucesso && (
        <div className="mb-4 rounded-2xl bg-success/10 px-4 py-3 flex items-center gap-2.5">
          <span className="text-success text-lg">✓</span>
          <p className="text-sm font-medium text-success">Assinatura confirmada! Seu plano foi ativado.</p>
        </div>
      )}

      {/* Plano atual */}
      <div className="glass rounded-3xl p-5 mb-4 text-center">
        <p className="text-xs text-muted mb-1">Plano atual</p>
        <p className="text-3xl font-black" style={{ color: PLANO_COR[planoAtual] }}>
          {PLANO_LABEL[planoAtual] ?? planoAtual}
        </p>
        {expira && <p className="text-xs text-dim mt-1">Válido até {expira}</p>}
        {planoAtual === "free" && (
          <p className="text-xs text-dim mt-1">5 matches por mês · Funcionalidades básicas</p>
        )}
      </div>

      {/* Boost Profissional */}
      {isPaid ? (
        <div className="glass rounded-3xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-sm">🚀 Boost Profissional</p>
              <p className="text-xs text-muted">Destaque seu perfil por 24 horas</p>
            </div>
            {boostAtivo ? (
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
                Ativo até {boostExpiraEm}
              </span>
            ) : (
              <span className="text-xs text-muted">{planoAtual === "elite" ? "5/mês" : "2/mês"}</span>
            )}
          </div>

          {!boostAtivo && (
            <button
              onClick={ativarBoost}
              disabled={ativandoBoost}
              className="brand-gradient glow-brand w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {ativandoBoost
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : "🚀 Ativar Boost agora"}
            </button>
          )}
          {boostAtivo && (
            <div className="rounded-2xl bg-success/8 border border-success/20 px-3 py-2.5 text-center">
              <p className="text-xs text-success font-medium">Seu perfil está em destaque nas buscas até às {boostExpiraEm}</p>
            </div>
          )}
        </div>
      ) : (
        /* Boost avulso para usuários free */
        <div className="glass rounded-3xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-sm">🚀 Boost Profissional</p>
              <p className="text-xs text-muted">Destaque seu perfil por 24 horas</p>
            </div>
          </div>
          <p className="text-xs text-muted mb-3">
            Perfis impulsionados recebem até 5× mais visualizações e solicitações de conexão.
          </p>
          <div className="flex gap-2">
            {BOOST_PACKS.map(pack => (
              <button
                key={pack.id}
                onClick={() => router.push("/perfil/carteira")}
                className="flex-1 glass-soft rounded-2xl py-2.5 text-center border border-line"
              >
                <p className="text-xs font-bold">{pack.label}</p>
                <p className="text-[11px] text-brand font-semibold">{pack.price}</p>
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-dim mt-2">Ou incluso nos planos Pro e Elite</p>
        </div>
      )}

      {/* Planos disponíveis */}
      {planoAtual !== "elite" && (
        <>
          <h2 className="text-sm font-semibold text-muted mb-3">
            {planoAtual === "free" ? "Fazer upgrade" : "Trocar plano"}
          </h2>
          <div className="flex flex-col gap-3">
            {PLANOS.filter(p => p.id !== planoAtual).map(plano => (
              <div key={plano.id} className="glass rounded-3xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-lg">{plano.name}</span>
                    <span className="text-2xl font-black ml-2" style={{ color: plano.cor }}>{plano.price}</span>
                    <span className="text-xs text-muted">{plano.period}</span>
                  </div>
                  {plano.popular && (
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${plano.cor}20`, color: plano.cor }}>
                      Popular
                    </span>
                  )}
                </div>

                <ul className="flex flex-col gap-1.5 mb-4">
                  {plano.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted">
                      <span className="text-success">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePix(plano.id)}
                    disabled={!!loadingPlan}
                    className="brand-gradient glow-brand flex-1 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loadingPlan === `pix-${plano.id}`
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : "Pagar com PIX"}
                  </button>
                  <button
                    onClick={() => handleCartao(plano.id)}
                    disabled={!!loadingPlan}
                    className="glass-soft flex-1 rounded-2xl py-3 text-sm font-semibold text-muted border border-line disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loadingPlan === `cartao-${plano.id}`
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      : "Cartão / Boleto"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-6 text-center text-[11px] text-dim">
        Pagamentos processados com segurança via Mercado Pago · LGPD
      </p>

      {/* Modal PIX */}
      {pix && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4 pb-6">
          <div className="w-full max-w-[400px] glass rounded-3xl p-6 animate-pop">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">Pagar com PIX</h2>
                <p className="text-xs text-muted">
                  Plano {PLANO_LABEL[pixPlanId]} · Expira em 30 min
                </p>
              </div>
              <button
                onClick={() => setPix(null)}
                className="glass-soft h-8 w-8 flex items-center justify-center rounded-xl text-dim text-lg"
              >×</button>
            </div>

            {pix.qr_code_base64 ? (
              <div className="flex justify-center mb-4">
                <div className="rounded-2xl bg-white p-3">
                  <img src={`data:image/png;base64,${pix.qr_code_base64}`} alt="QR Code PIX" className="h-48 w-48" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="rounded-2xl bg-white/10 h-48 w-48 flex items-center justify-center text-dim text-sm">
                  QR Code indisponível
                </div>
              </div>
            )}

            <p className="text-center text-xs text-muted mb-3">
              Ou copie o código PIX abaixo e cole no app do seu banco
            </p>

            <div className="glass-soft rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
              <p className="flex-1 truncate text-xs text-dim font-mono">{pix.qr_code}</p>
              <button onClick={copiarPix} className="shrink-0 flex items-center gap-1.5 rounded-xl bg-brand/15 px-3 py-2 text-xs font-semibold text-brand transition active:scale-95">
                <CopyIcon />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <p className="text-center text-[11px] text-dim">
              Após o pagamento o plano é ativado automaticamente em até 1 minuto.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
