import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message, conversation } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;

  const msgs = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(asc(message.createdAt));

  return NextResponse.json(msgs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const { content, type = "text", fileUrl } = await req.json();

  if (!content && !fileUrl) {
    return NextResponse.json({ error: "content or fileUrl required" }, { status: 400 });
  }

  const [msg] = await db
    .insert(message)
    .values({
      conversationId,
      senderId: session.user.id,
      type,
      content: content || null,
      fileUrl: fileUrl || null,
    })
    .returning();

  return NextResponse.json(msg);
}
