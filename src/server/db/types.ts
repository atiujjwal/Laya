import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
  tasks,
  timeBlocks,
  habitLogs,
  userContext,
  categories,
} from "./schema";

// Read Types (Select)
export type Task = InferSelectModel<typeof tasks>;
export type TimeBlock = InferSelectModel<typeof timeBlocks>;
export type HabitLog = InferSelectModel<typeof habitLogs>;
export type UserContext = InferSelectModel<typeof userContext>;
export type Category = InferSelectModel<typeof categories>;

// Write Types (Insert)
export type NewTask = InferInsertModel<typeof tasks>;
export type NewTimeBlock = InferInsertModel<typeof timeBlocks>;
export type NewHabitLog = InferInsertModel<typeof habitLogs>;
export type NewUserContext = InferInsertModel<typeof userContext>;
export type NewCategory = InferInsertModel<typeof categories>;
