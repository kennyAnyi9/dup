import { boolean, pgTable, text, timestamp, integer, index, primaryKey } from "drizzle-orm/pg-core";

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
}, (table) => [
  // Auth performance indexes
  index("idx_session_user_id").on(table.userId),
  index("idx_session_expires_at").on(table.expiresAt),
]);

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
  description: text("description"), // optional paste description
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
}, (table) => [
  // Performance indexes for common queries
  index("idx_paste_user_id").on(table.userId),
  index("idx_paste_created_at").on(table.createdAt.desc()),
  index("idx_paste_visibility").on(table.visibility),
  index("idx_paste_expires_at").on(table.expiresAt),
  index("idx_paste_is_deleted").on(table.isDeleted),
  // Composite index for dashboard queries (user's pastes ordered by date)
  index("idx_paste_user_created").on(table.userId, table.createdAt.desc()),
  // Composite index for public paste queries
  index("idx_paste_public_created").on(table.visibility, table.isDeleted, table.createdAt.desc()),
]);

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(), // URL-friendly version of name
  color: text("color"), // Optional color for tag display
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  // Performance indexes
  index("idx_tag_name").on(table.name),
  index("idx_tag_slug").on(table.slug),
]);

export const pasteTag = pgTable("paste_tag", {
  pasteId: text("paste_id")
    .notNull()
    .references(() => paste.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.pasteId, table.tagId] }),
  // Performance indexes
  index("idx_paste_tag_paste_id").on(table.pasteId),
  index("idx_paste_tag_tag_id").on(table.tagId),
]);

export const comment = pgTable("comment", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  pasteId: text("paste_id")
    .notNull()
    .references(() => paste.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id"), // for threaded replies - self-referential foreign key added in migration
  likeCount: integer("like_count").default(0).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  // Performance indexes
  index("idx_comment_paste_id").on(table.pasteId),
  index("idx_comment_user_id").on(table.userId),
  index("idx_comment_parent_id").on(table.parentId),
  index("idx_comment_created_at").on(table.createdAt.desc()),
  index("idx_comment_is_deleted").on(table.isDeleted),
  // Composite index for paste comments ordered by date
  index("idx_comment_paste_created").on(table.pasteId, table.isDeleted, table.createdAt.asc()),
]);

export const commentLike = pgTable("comment_like", {
  commentId: text("comment_id")
    .notNull()
    .references(() => comment.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.commentId, table.userId] }),
  // Performance indexes
  index("idx_comment_like_comment_id").on(table.commentId),
  index("idx_comment_like_user_id").on(table.userId),
]);
