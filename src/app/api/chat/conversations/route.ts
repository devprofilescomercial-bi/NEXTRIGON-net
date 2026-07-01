import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { conversation, match } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = session.user.id;
  const convs = await db
    .select({ conversation })
    .from(conversation)
    .leftJoin(match, eq(conversation.matchId, match.id))
    .where(or(eq(match.userA, uid), eq(match.userB, uid)))
    .orderBy(desc(conversation.createdAt));

  return NextResponse.json(convs.map(r => r.conversation));
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const existing = await db
    .select()
    .from(conversation)
    .where(eq(conversation.slug, slug))
    .limit(1);

  if (existing.length > 0) return NextResponse.json(existing[0]);

  const [created] = await db
    .insert(conversation)
    .values({ slug })
    .returning();

  return NextResponse.json(created);
}
