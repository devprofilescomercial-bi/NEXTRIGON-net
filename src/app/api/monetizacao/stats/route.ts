import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { swipe, match, user } from "@/db/schema";
import { eq, and, gte, count, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const mesPassado = new Date();
  mesPassado.setDate(mesPassado.getDate() - 30);

  const semanaPassada = new Date();
  semanaPassada.setDate(semanaPassada.getDate() - 7);

  // Quantas pessoas deram like em mim neste mês (interesse recebido)
  const [{ total: likesRecebidos }] = await db
    .select({ total: count() })
    .from(swipe)
    .where(and(eq(swipe.toUser, userId), eq(swipe.direction, "like"), gte(swipe.createdAt, mesPassado)));

  // Quantas pessoas deram like em mim esta semana
  const [{ total: likesSemana }] = await db
    .select({ total: count() })
    .from(swipe)
    .where(and(eq(swipe.toUser, userId), eq(swipe.direction, "like"), gte(swipe.createdAt, semanaPassada)));

  // Quantos matches ativos tenho
  const [{ total: matchesAtivos }] = await db
    .select({ total: count() })
    .from(match)
    .where(and(or(eq(match.userA, userId), eq(match.userB, userId)), eq(match.status, "active")));

  // Quantos swipes fiz este mês (para controle de limite free)
  const inicioDomes = new Date();
  inicioDomes.setDate(1);
  inicioDomes.setHours(0, 0, 0, 0);

  const [{ total: swipesMes }] = await db
    .select({ total: count() })
    .from(swipe)
    .where(and(eq(swipe.fromUser, userId), gte(swipe.createdAt, inicioDomes)));

  // Plano do usuário
  const [u] = await db
    .select({ plano: user.plano })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const plano = u?.plano ?? "free";
  const limiteSwipes = plano === "free" ? 5 : Infinity;
  const swipesRestantes = plano === "free" ? Math.max(0, limiteSwipes - Number(swipesMes)) : null;

  return NextResponse.json({
    likesRecebidos: Number(likesRecebidos),
    likesSemana: Number(likesSemana),
    matchesAtivos: Number(matchesAtivos),
    swipesMes: Number(swipesMes),
    swipesRestantes,
    plano,
  });
}
