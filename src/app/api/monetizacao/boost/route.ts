import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { boost, user } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const agora = new Date();

  const [boostAtivo] = await db
    .select()
    .from(boost)
    .where(and(eq(boost.userId, userId), gte(boost.expiresAt, agora)))
    .limit(1);

  return NextResponse.json({ boostAtivo: boostAtivo ?? null });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [u] = await db
    .select({ plano: user.plano })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (u.plano === "free") {
    return NextResponse.json({ error: "Boost disponível apenas nos planos Pro e Elite." }, { status: 403 });
  }

  const agora = new Date();
  const expira = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // 24 horas

  await db.insert(boost).values({
    userId,
    expiresAt: expira,
    tipo: "plan",
  });

  return NextResponse.json({ ok: true, expiresAt: expira });
}
