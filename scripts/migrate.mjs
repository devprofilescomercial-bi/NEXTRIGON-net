import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[migrate] DATABASE_URL not set — skipping migrations");
  process.exit(0);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

try {
  console.log("[migrate] Running database migrations...");
  await migrate(db, { migrationsFolder: join(__dirname, "../drizzle") });
  console.log("[migrate] Migrations complete.");
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exit(1);
} finally {
  await client.end();
}
