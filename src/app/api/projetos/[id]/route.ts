import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db
    .delete(project)
    .where(and(eq(project.id, id), eq(project.ownerId, session.user.id)));

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { titulo, descricao, area, status, progresso, prazo } = body;
  const allowed = Object.fromEntries(
    Object.entries({ titulo, descricao, area, status, progresso, prazo }).filter(([, v]) => v !== undefined)
  );

  const [updated] = await db
    .update(project)
    .set(allowed)
    .where(and(eq(project.id, id), eq(project.ownerId, session.user.id)))
    .returning();

  return NextResponse.json(updated);
}
