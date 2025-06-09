import { boolean, pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    // Auth performance indexes
    userIdIdx: index("idx_session_user_id").on(table.userId),
    expiresAtIdx: index("idx_session_expires_at").on(table.expiresAt),
  };
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paste = pgTable("paste", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title"),
  content: text("content").notNull(),
  language: text("language").default("plain").notNull(),
  visibility: text("visibility").default("public").notNull(), // public, unlisted, private
  password: text("password"), // for password-protected pastes
  burnAfterRead: boolean("burn_after_read").default(false).notNull(),
  burnAfterReadViews: integer("burn_after_read_views").default(1), // how many views before burn
  views: integer("views").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }), // null for anonymous
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Performance indexes for common queries
    userIdIdx: index("idx_paste_user_id").on(table.userId),
    createdAtIdx: index("idx_paste_created_at").on(table.createdAt.desc()),
    visibilityIdx: index("idx_paste_visibility").on(table.visibility),
    expiresAtIdx: index("idx_paste_expires_at").on(table.expiresAt),
    isDeletedIdx: index("idx_paste_is_deleted").on(table.isDeleted),
    // Composite index for dashboard queries (user's pastes ordered by date)
    userCreatedIdx: index("idx_paste_user_created").on(table.userId, table.createdAt.desc()),
    // Composite index for public paste queries
    publicCreatedIdx: index("idx_paste_public_created").on(table.visibility, table.isDeleted, table.createdAt.desc()),
  };
});
