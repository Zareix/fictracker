import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { UserRole } from "~/lib/constant";

export const shelves = sqliteTable(
  "shelve",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }).notNull(),
    icon: text("icon", { length: 256 }),
  },
  (table) => [index("shelve_name_idx").on(table.name)],
);

export const shelvesRelations = relations(shelves, ({ many }) => ({
  fanfics: many(fanfics),
}));

export type Shelve = typeof shelves.$inferSelect;

export const fanfics = sqliteTable(
  "fanfic",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    title: text("title", { length: 256 }).notNull(),
    url: text("url", { length: 256 }).notNull(),
    author: text("author", { length: 256 }).notNull(),
    website: text("website", { length: 256 }).notNull(),
    summary: text("summary", { length: 256 }).notNull(),
    likesCount: int("likes_count", { mode: "number" }).notNull(),
    tags: text("tags", { length: 256 }).notNull(),
    writingCompleted: int("writing_completed", { mode: "boolean" }).notNull(),
    fandom: text("fandom", { length: 256 }).notNull(),
    ships: text("ships", { length: 256 }).notNull(),
    language: text("language", { length: 256 }).notNull(),

    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => [index("fanfic_title_idx").on(table.title)],
);

// export const fanficsRelations = relations(fanfics, ({ many, one }) => ({
//   shelve: one(shelves, {
//     fields: [fanfics.shelve],
//     references: [shelves.id],
//   }),
// }));

export type Fanfic = typeof fanfics.$inferSelect;

export const users = sqliteTable(
  "user",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    name: text("name", { length: 255 }).notNull(),
    email: text("email").notNull().unique(),
    role: text("role", { length: 255 })
      .notNull()
      .$type<UserRole>()
      .default("user"),
    image: text("image", { length: 255 }),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("user_name_idx").on(table.name)],
);

export type User = typeof users.$inferSelect;

// --- BETTER AUTH ---

export const session = sqliteTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const passkey = sqliteTable("passkey", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  credentialID: text("credential_i_d").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: integer("backed_up", { mode: "boolean" }).notNull(),
  transports: text("transports"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});
