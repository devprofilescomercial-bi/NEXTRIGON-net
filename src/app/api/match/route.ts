import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, profile, swipe } from "@/db/schema";
import { eq, ne, and, notInArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const swiped = await db
    .select({ id: swipe.toUser })
    .from(swipe)
    .where(eq(swipe.fromUser, userId));

  const swipedIds = swiped.map((s) => s.id);

  const conditions = [
    ne(user.id, userId),
    eq(user.status, "active"),
    ...(swipedIds.length > 0 ? [notInArray(user.id, swipedIds)] : []),
  ];

  const candidates = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      bio: profile.bio,
      areas: profile.areas,
      tags: profile.tags,
      city: profile.city,
      uf: profile.uf,
      objective: profile.objective,
    })
    .from(user)
    .innerJoin(profile, eq(profile.userId, user.id))
    .where(and(...conditions))
    .limit(30);

  return NextResponse.json(candidates);
}
