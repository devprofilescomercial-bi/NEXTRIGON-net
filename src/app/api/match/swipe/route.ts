import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { swipe, match, conversation } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { toUserId, direction } = await req.json();

  if (!toUserId || !["like", "pass"].includes(direction)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Avoid duplicate swipes
  const [existing] = await db
    .select()
    .from(swipe)
    .where(and(eq(swipe.fromUser, userId), eq(swipe.toUser, toUserId)))
    .limit(1);

  if (!existing) {
    await db.insert(swipe).values({ fromUser: userId, toUser: toUserId, direction });
  }

  if (direction !== "like") {
    return NextResponse.json({ matched: false });
  }

  // Check if they liked us back
  const [theirLike] = await db
    .select()
    .from(swipe)
    .where(and(eq(swipe.fromUser, toUserId), eq(swipe.toUser, userId), eq(swipe.direction, "like")))
    .limit(1);

  if (!theirLike) {
    return NextResponse.json({ matched: false });
  }

  // Check if match already exists
  const [existingMatch] = await db
    .select()
    .from(match)
    .where(or(
      and(eq(match.userA, userId), eq(match.userB, toUserId)),
      and(eq(match.userA, toUserId), eq(match.userB, userId)),
    ))
    .limit(1);

  if (existingMatch) {
    const [conv] = await db
      .select()
      .from(conversation)
      .where(eq(conversation.matchId, existingMatch.id))
      .limit(1);
    return NextResponse.json({ matched: true, matchId: existingMatch.id, conversationId: conv?.id });
  }

  const [newMatch] = await db
    .insert(match)
    .values({ userA: userId, userB: toUserId, status: "active" })
    .returning();

  const [newConv] = await db
    .insert(conversation)
    .values({ matchId: newMatch.id })
    .returning();

  return NextResponse.json({ matched: true, matchId: newMatch.id, conversationId: newConv.id });
}
