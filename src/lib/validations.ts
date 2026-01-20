// lib/validations.ts
import { z } from "zod";
import { Frequency } from "@prisma/client";


export const createHabitSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#/, "Invalid color code").default("#000000"),
  icon: z.string().optional(),
  frequency: z.nativeEnum(Frequency).default("DAILY"),
  weekDays: z.array(z.number().min(0).max(6)).optional(), // [0, 1, 2] for Sun, Mon, Tue
  targetValue: z.number().int().min(1).default(1),
  unit: z.string().optional(),
});

export const updateHabitSchema = createHabitSchema.partial();


export const logHabitSchema = z.object({
  habitId: z.string().cuid(),
  date: z.string().datetime(),
  value: z.number().int().min(0),
  completed: z.boolean(),
  meta: z.record(z.string(), z.any()).optional(),
});


export const createGoalSchema = z.object({
  title: z.string().min(3),
  category: z.string().default("General"),
  targetDate: z.string().datetime().optional(),
  steps: z
    .array(
      z.object({
        step: z.string(),
        done: z.boolean(),
      }),
    )
    .optional(),
});


export const updateUserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(), // Validated on frontend or via list
  onboarding: z.boolean().optional(),
});


export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  progress: z.number().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  steps: z.array(z.object({
    step: z.string(),
    done: z.boolean()
  })).optional(), 
});


export const generatePlanSchema = z.object({
  date: z.string().datetime(), // Target date for the plan
  focus: z.string().optional(), // Optional user intent (e.g., "Focus on work")
});