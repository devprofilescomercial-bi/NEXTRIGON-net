import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "";
const client = postgres(connectionString, { prepare: false });

// better-auth drizzle adapter looks up models by name via db._.fullSchema.
// Our export is "verificationToken" but better-auth requests "verification",
// so we add the alias here so fullSchema["verification"] resolves correctly.
const dbSchema = { ...schema, verification: schema.verificationToken };

export const db = drizzle(client, { schema: dbSchema });
export { schema };
