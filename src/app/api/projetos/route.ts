import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await db
    .select()
    .from(project)
    .where(eq(project.ownerId, session.user.id))
    .orderBy(desc(project.createdAt));

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { titulo, descricao, area } = await req.json();
  if (!titulo?.trim()) return NextResponse.json({ error: "titulo required" }, { status: 400 });

  const [created] = await db
    .insert(project)
    .values({
      ownerId: session.user.id,
      titulo: titulo.trim(),
      descricao: descricao || null,
      area: area || null,
      status: "ativo",
      progresso: 0,
    })
    .returning();

  return NextResponse.json(created);
}
