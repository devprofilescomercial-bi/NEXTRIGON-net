import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [u] = await db
    .select({ plano: user.plano, planoExpiraEm: user.planoExpiraEm })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return NextResponse.json(u ?? { plano: "free", planoExpiraEm: null });
}
