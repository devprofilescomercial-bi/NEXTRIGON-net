// Runs once at server startup. Applies schema changes that are missing
// from the initial database setup, using IF NOT EXISTS for idempotency.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;

  try {
    const { default: postgres } = await import("postgres");
    const sql = postgres(connectionString, { max: 1 });

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "boost" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "expires_at" timestamp NOT NULL,
        "tipo" text DEFAULT 'manual' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    const alters = [
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'pending' NOT NULL`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "plano" text DEFAULT 'free' NOT NULL`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "plano_expira_em" timestamp`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id_token" text`,
      `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp`,
      `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp`,
      `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text`,
      `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "conversation" ADD COLUMN IF NOT EXISTS "slug" text`,
    ];

    for (const stmt of alters) {
      await sql.unsafe(stmt);
    }

    await sql.end();
    console.log("[migrate] Schema atualizado com sucesso.");
  } catch (err) {
    console.error("[migrate] Falha na migration:", err);
  }
}
