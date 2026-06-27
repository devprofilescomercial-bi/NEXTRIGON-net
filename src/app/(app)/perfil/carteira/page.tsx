"use client";
import { useRouter } from "next/navigation";

const PLANOS = [
  { id: "pro", name: "Pro", price: "R$ 49", period: "/mês", popular: false,
    features: ["Matches ilimitados", "2 boosts/mês", "Ver quem curtiu", "Chat ilimitado"] },
  { id: "elite", name: "Elite", price: "R$ 129", period: "/mês", popular: true,
    features: ["Tudo do Pro", "5 boosts/mês", "Destaque nacional", "Selo autoridade", "Relatórios completos"] },
];

export default function CarteiraPage() {
  const router = useRouter();

  async function assinar(planId: string, metodo: "pix" | "cartao") {
    try {
      const endpoint = metodo === "pix" ? "/api/mercadopago/pix" : "/api/mercadopago/assinatura";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan_id: planId, back_url: window.location.href }),
      });
      const data = await res.json();
      if (data.qr_code) {
        alert(`PIX gerado!\n\nCopie o código:\n${data.qr_code}`);
      } else if (data.init_point) {
        window.open(data.init_point, "_blank");
      } else {
        alert("Erro ao gerar pagamento. Tente novamente.");
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      <div className="mt-1 mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="text-xl font-bold">Carteira e créditos</h1>
      </div>

      {/* Saldo atual */}
      <div className="glass rounded-3xl p-5 text-center mb-6">
        <p className="text-xs text-muted mb-1">Plano atual</p>
        <p className="text-3xl font-black text-brand">Gratuito</p>
        <p className="text-xs text-dim mt-1">5 matches restantes este mês</p>
      </div>

      {/* Upgrade */}
      <h2 className="text-sm font-semibold text-muted mb-3">Fazer upgrade</h2>
      <div className="flex flex-col gap-3">
        {PLANOS.map(plano => (
          <div key={plano.id} className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-lg">{plano.name}</span>
                <span className="ml-2 text-2xl font-black text-brand">{plano.price}</span>
                <span className="text-xs text-muted">{plano.period}</span>
              </div>
              {plano.popular && (
                <span className="rounded-full bg-brand/20 px-2.5 py-1 text-[11px] font-semibold text-brand">Popular</span>
              )}
            </div>
            <ul className="flex flex-col gap-1 mb-4">
              {plano.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => assinar(plano.id, "pix")}
                className="brand-gradient glow-brand flex-1 rounded-2xl py-3 text-sm font-semibold text-white"
              >
                PIX
              </button>
              <button
                onClick={() => assinar(plano.id, "cartao")}
                className="glass-soft flex-1 rounded-2xl py-3 text-sm font-semibold text-muted border border-line"
              >
                Cartão / Boleto
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-dim">
        Pagamentos processados com segurança via Mercado Pago.
      </p>
    </section>
  );
}
