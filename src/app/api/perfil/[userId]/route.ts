import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;

  const [u] = await db.select({ id: user.id, name: user.name, image: user.image, createdAt: user.createdAt })
    .from(user).where(eq(user.id, userId)).limit(1);

  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [p] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1);

  return NextResponse.json({ ...u, profile: p ?? null });
}
