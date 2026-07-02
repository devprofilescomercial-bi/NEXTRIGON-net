import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const PLANOS: Record<string, { valor: number; nome: string }> = {
  pro:   { valor: 49.00,  nome: "Nextrigon Pro — Mensal"   },
  elite: { valor: 129.00, nome: "Nextrigon Elite — Mensal" },
};

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan_id } = await req.json();
  const plano = PLANOS[plan_id];
  if (!plano) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const preApprovalApi = new PreApproval(mp);

  const sub = await preApprovalApi.create({
    body: {
      reason: plano.nome,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plano.valor,
        currency_id: "BRL",
      },
      payer_email: session.user.email,
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/perfil/carteira?status=sucesso`,
      external_reference: `${session.user.id}:${plan_id}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
    } as any,
  });

  return NextResponse.json({
    subscription_id: sub.id,
    status: sub.status,
    init_point: sub.init_point,
  });
}
