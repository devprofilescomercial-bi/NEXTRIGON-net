import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { match, conversation, message, user } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const matches = await db
    .select({
      matchId: match.id,
      userA: match.userA,
      userB: match.userB,
      matchCreatedAt: match.createdAt,
      convId: conversation.id,
    })
    .from(match)
    .leftJoin(conversation, eq(conversation.matchId, match.id))
    .where(and(
      or(eq(match.userA, userId), eq(match.userB, userId)),
      eq(match.status, "active"),
    ))
    .orderBy(desc(match.createdAt));

  const result = await Promise.all(
    matches.map(async (m) => {
      const otherId = m.userA === userId ? m.userB : m.userA;

      const [otherUser] = await db
        .select({ name: user.name, image: user.image })
        .from(user)
        .where(eq(user.id, otherId))
        .limit(1);

      let lastMessage = null;
      let lastMessageAt = m.matchCreatedAt?.toISOString() ?? null;

      if (m.convId) {
        const [lastMsg] = await db
          .select({ content: message.content, createdAt: message.createdAt })
          .from(message)
          .where(eq(message.conversationId, m.convId))
          .orderBy(desc(message.createdAt))
          .limit(1);

        if (lastMsg) {
          lastMessage = lastMsg.content;
          lastMessageAt = lastMsg.createdAt?.toISOString() ?? lastMessageAt;
        }
      }

      const words = (otherUser?.name ?? "?").trim().split(" ");
      const initials = ((words[0]?.[0] ?? "") + (words[words.length - 1]?.[0] ?? "")).toUpperCase();

      const GRADS: [string, string][] = [
        ["#fb923c", "#ea580c"], ["#3256a8", "#1e3a8a"],
        ["#7c3aed", "#4c1d95"], ["#0891b2", "#0e7490"],
        ["#16a34a", "#15803d"], ["#dc2626", "#991b1b"],
      ];
      const grad = GRADS[otherId.charCodeAt(0) % GRADS.length];

      return {
        matchId: m.matchId,
        conversationId: m.convId ?? null,
        otherUserId: otherId,
        name: otherUser?.name ?? "Usuário",
        image: otherUser?.image ?? null,
        initials,
        grad,
        lastMessage,
        lastMessageAt,
      };
    })
  );

  return NextResponse.json(result);
}
