import { pgTable, text, timestamp, boolean, integer, doublePrecision, uuid, jsonb } from "drizzle-orm/pg-core";

/* ============ Better Auth (gerado/compatível) ============ */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(), // user | admin
  status: text("status").default("pending").notNull(), // pending | active | banned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationToken = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

/* ============ Domínio Nextrigon ============ */
export const profile = pgTable("profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  objective: text("objective"), // contratar | oferecer | colaborar | parcerias
  areas: jsonb("areas").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  city: text("city"),
  uf: text("uf"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  ratingAvg: doublePrecision("rating_avg").default(0),
  reviewsCount: integer("reviews_count").default(0),
  responseRate: integer("response_rate").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Verificação OAB (não confundir com tabela de tokens do auth)
export const oabVerification = pgTable("oab_verification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  oabNumber: text("oab_number").notNull(),
  oabUf: text("oab_uf").notNull(),
  docUrl: text("doc_url"),
  selfieUrl: text("selfie_url"),
  status: text("status").default("pending").notNull(), // pending | approved | rejected
  reviewedBy: text("reviewed_by").references(() => user.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const swipe = pgTable("swipe", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromUser: text("from_user").notNull().references(() => user.id, { onDelete: "cascade" }),
  toUser: text("to_user").notNull().references(() => user.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(), // like | pass
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const match = pgTable("match", {
  id: uuid("id").defaultRandom().primaryKey(),
  userA: text("user_a").notNull().references(() => user.id, { onDelete: "cascade" }),
  userB: text("user_b").notNull().references(() => user.id, { onDelete: "cascade" }),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversation = pgTable("conversation", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").notNull().references(() => match.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const message = pgTable("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversation.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => user.id),
  type: text("type").default("text").notNull(), // text | file | proposal
  content: text("content"),
  fileUrl: text("file_url"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const proposal = pgTable("proposal", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").notNull().references(() => message.id, { onDelete: "cascade" }),
  valor: integer("valor"), // honorário negociado em privado (centavos)
  escopo: text("escopo"),
  prazo: text("prazo"),
  status: text("status").default("sent").notNull(), // sent | accepted | declined | expired
});

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  area: text("area"),
  status: text("status").default("ativo").notNull(),
  progresso: integer("progresso").default(0),
  prazo: timestamp("prazo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectStep = pgTable("project_step", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  ordem: integer("ordem").notNull(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  done: boolean("done").default(false),
  doneAt: timestamp("done_at"),
});

export const review = pgTable("review", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: "set null" }),
  fromUser: text("from_user").notNull().references(() => user.id),
  toUser: text("to_user").notNull().references(() => user.id),
  nota: integer("nota").notNull(),
  comentario: text("comentario"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const report = pgTable("report", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: text("reporter_id").notNull().references(() => user.id),
  targetType: text("target_type").notNull(), // user | message
  targetId: text("target_id").notNull(),
  motivo: text("motivo"),
  status: text("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminAction = pgTable("admin_action", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: text("admin_id").notNull().references(() => user.id),
  action: text("action").notNull(),
  targetId: text("target_id"),
  motivo: text("motivo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
