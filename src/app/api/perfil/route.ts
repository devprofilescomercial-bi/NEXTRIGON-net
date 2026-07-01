import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [p] = await db.select().from(profile).where(eq(profile.userId, session.user.id)).limit(1);
  return NextResponse.json(p ?? null);
}

async function upsertProfile(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // Accept both "cidade" (web) and "city" (mobile)
  const { bio, cidade, city, uf, areas, imageUrl, nome, objective } = body;
  const cityValue = cidade ?? city;

  if (nome) {
    await db.update(user).set({ name: nome, updatedAt: new Date() }).where(eq(user.id, session.user.id));
  }
  if (imageUrl) {
    await db.update(user).set({ image: imageUrl, updatedAt: new Date() }).where(eq(user.id, session.user.id));
  }

  const [existing] = await db.select().from(profile).where(eq(profile.userId, session.user.id)).limit(1);

  if (existing) {
    const [updated] = await db
      .update(profile)
      .set({ bio, city: cityValue, uf, areas, objective })
      .where(eq(profile.userId, session.user.id))
      .returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db
      .insert(profile)
      .values({ userId: session.user.id, bio, city: cityValue, uf, areas, objective })
      .returning();
    return NextResponse.json(created);
  }
}

export const PUT = upsertProfile;
export const PATCH = upsertProfile;
