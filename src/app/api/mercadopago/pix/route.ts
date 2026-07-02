import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MercadoPagoConfig, Payment } from "mercadopago";

const PLANOS: Record<string, { valor: number; nome: string; meses: number }> = {
  pro:   { valor: 49.00,  nome: "Nextrigon Pro — Mensal",   meses: 1 },
  elite: { valor: 129.00, nome: "Nextrigon Elite — Mensal", meses: 1 },
};

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan_id } = await req.json();
  const plano = PLANOS[plan_id];
  if (!plano) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const paymentApi = new Payment(mp);

  const payment = await paymentApi.create({
    body: {
      transaction_amount: plano.valor,
      description: plano.nome,
      payment_method_id: "pix",
      payer: { email: session.user.email },
      metadata: { user_id: session.user.id, plan_id },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
    },
  });

  return NextResponse.json({
    payment_id: payment.id,
    status: payment.status,
    qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
    qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
    ticket_url: payment.point_of_interaction?.transaction_data?.ticket_url,
    expires_at: payment.date_of_expiration,
  });
}
