import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  real,
  date,
  primaryKey,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Enums ---
export const statusEnum = pgEnum("status", [
  "todo",
  "in_progress",
  "completed",
  "rolled_over",
]);

// --- Auth.js Tables (Required for Google OAuth & Sessions) ---
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"), // Critical for background Google Sheets export
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// --- Application Core Tables ---

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").default("blue"), // Tailwind color reference
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("categories_user_id_idx").on(t.userId),
  })
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id),
    title: text("title").notNull(),
    priority: integer("priority").default(1), // 1=Low, 4=Critical
    isHabit: boolean("is_habit").default(false),
    xpValue: integer("xp_value").default(10),
    status: statusEnum("status").default("todo"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("tasks_user_id_idx").on(t.userId),
  })
);

export const timeBlocks = pgTable(
  "time_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    date: date("date").notNull(), // YYYY-MM-DD
    startMinute: integer("start_minute").notNull(), // 0-1439
    endMinute: integer("end_minute").notNull(), // 0-1439
    isLocked: boolean("is_locked").default(false),
    rationale: text("rationale"), // AI reasoning
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // For sync resolution
  },
  (t) => ({
    userIdIdx: index("time_blocks_user_id_idx").on(t.userId),
    dateIdx: index("time_blocks_date_idx").on(t.date),
  })
);

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    habitId: uuid("habit_id").references(() => tasks.id, {
      onDelete: "cascade",
    }), // Habits are just specialized tasks
    date: date("date").notNull(),
    value: integer("value").default(0), // 0 or 1 for boolean, or higher for count
    streakFreezeUsed: boolean("streak_freeze_used").default(false),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("habit_logs_user_id_idx").on(t.userId),
  })
);

export const userContext = pgTable(
  "user_context",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(), // e.g., 'preferred_deep_work_window'
    value: jsonb("value").notNull(), // e.g., { start: 540, end: 720 }
    confidence: real("confidence").default(1.0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("user_context_user_id_idx").on(t.userId),
  })
);
