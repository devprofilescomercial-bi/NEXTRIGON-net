import path from "path";

// Runs once at server startup inside the Next.js Node.js runtime.
// Applies any pending Drizzle migrations before the first request is served.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const { db } = await import("@/db");

    const migrationsFolder = path.join(process.cwd(), "drizzle");
    console.log("[migrate] Running migrations from", migrationsFolder);
    await migrate(db, { migrationsFolder });
    console.log("[migrate] Migrations complete.");
  } catch (err) {
    console.error("[migrate] Migration failed:", err);
  }
}
