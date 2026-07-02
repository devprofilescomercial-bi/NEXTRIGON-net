import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

const PLANO_MESES: Record<string, number> = { pro: 1, elite: 1 };

function addMeses(meses: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + meses);
  return d;
}

async function atualizarPlano(userId: string, planId: string) {
  const meses = PLANO_MESES[planId] ?? 1;
  await db.update(user).set({
    plano: planId,
    planoExpiraEm: addMeses(meses),
  }).where(eq(user.id, userId));
}

export async function POST(req: NextRequest) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic") ?? searchParams.get("type");
  const idParam = searchParams.get("id");

  let body: any = {};
  try { body = await req.json(); } catch {}

  const type = topic ?? body.type ?? "";
  const notifId = idParam ?? body.data?.id ?? body.id ?? "";

  try {
    if (type === "payment" && notifId) {
      const paymentApi = new Payment(mp);
      const payment = await paymentApi.get({ id: notifId });

      if (payment.status === "approved") {
        const meta = payment.metadata as any;
        const userId = meta?.user_id ?? meta?.["user-id"];
        const planId = meta?.plan_id ?? meta?.["plan-id"];
        if (userId && planId) {
          await atualizarPlano(userId, planId);
        }
      }
    }

    if ((type === "subscription_preapproval" || type === "preapproval") && notifId) {
      const preApprovalApi = new PreApproval(mp);
      const sub = await preApprovalApi.get({ id: notifId });

      if (sub.status === "authorized" && sub.external_reference) {
        const [userId, planId] = (sub.external_reference as string).split(":");
        if (userId && planId) {
          await atualizarPlano(userId, planId);
        }
      }

      if (sub.status === "cancelled" && sub.external_reference) {
        const [userId] = (sub.external_reference as string).split(":");
        if (userId) {
          await db.update(user).set({ plano: "free", planoExpiraEm: null })
            .where(eq(user.id, userId));
        }
      }
    }
  } catch (e) {
    console.error("[MP Webhook] Erro:", e);
  }

  return NextResponse.json({ ok: true });
}
