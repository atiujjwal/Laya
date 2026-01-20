// prisma/seed.ts

import "dotenv/config";
import { PrismaClient, Frequency, LogStatus } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize Prisma Client with adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env');
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Laya Database Seeding...");

  // CLEANUP: Clear existing data to prevent duplicates during development
  // We delete "Child" records first to avoid foreign key constraint errors
  await prisma.habitLog.deleteMany();
  await prisma.dayPlan.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Database cleaned.");

  // CREATE USER: A standard demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@laya.app",
      name: "Laya Architect",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laya",
      timezone: "Asia/Kolkata", // Testing timezone support
      onboarding: true,
    },
  });

  console.log(`👤 Created User: ${user.email}`);

  // CREATE GOALS: Testing the JSON "steps" field
  const healthGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Complete Body Transformation",
      category: "Health",
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 months from now
      progress: 33, // 33% complete
      steps: [
        { step: "Join a Gym", done: true },
        { step: "Consult Nutritionist", done: false },
        { step: "Run 5k without stopping", done: false },
      ],
    },
  });

  console.log(`🎯 Created Goal: ${healthGoal.title}`);

  // CREATE HABITS: Testing different types (Boolean vs Numeric, Daily vs Weekly)

  // Habit A: Daily Meditation (Boolean, Simple)
  const habitMeditate = await prisma.habit.create({
    data: {
      userId: user.id,
      title: "Morning Meditation",
      description: "10 minutes of mindfulness before work",
      color: "#4F46E5", // Indigo
      icon: "🧘",
      frequency: Frequency.DAILY,
      weekDays: [0, 1, 2, 3, 4, 5, 6], // Every day
      targetValue: 1,
      unit: "session",
    },
  });

  // Habit B: Gym (Weekly, Complex Recurrence)
  const habitGym = await prisma.habit.create({
    data: {
      userId: user.id,
      title: "Strength Training",
      description: "Push/Pull/Legs split",
      color: "#DC2626", // Red
      icon: "🏋️",
      frequency: Frequency.WEEKLY,
      weekDays: [1, 3, 5], // Mon(1), Wed(3), Fri(5)
      rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR", // RFC 5545 for calendar engines
      targetValue: 45,
      unit: "minutes",
    },
  });

  // Habit C: Reading (Numeric Tracking)
  const habitRead = await prisma.habit.create({
    data: {
      userId: user.id,
      title: "Read Books",
      color: "#10B981", // Emerald
      icon: "📚",
      frequency: Frequency.DAILY,
      weekDays: [0, 1, 2, 3, 4, 5, 6],
      targetValue: 20, // Target: 20 pages
      unit: "pages",
    },
  });

  console.log("📅 Created 3 Test Habits");

  // CREATE LOGS: Simulating history for charts
  // We'll log "Yesterday" and "Today" to test streaks

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Normalize to Midnight UTC

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Log 1: Meditated Yesterday (Completed)
  await prisma.habitLog.create({
    data: {
      habitId: habitMeditate.id,
      date: yesterday,
      value: 1,
      completed: true,
      status: LogStatus.COMPLETED,
      meta: { mood: "Calm", notes: "Hard to focus initially" }, // Testing JSONB
    },
  });

  // Log 2: Read 15/20 pages Today (Partial/In Progress)
  await prisma.habitLog.create({
    data: {
      habitId: habitRead.id,
      date: today,
      value: 15,
      completed: false,
      status: LogStatus.COMPLETED, // Technically "logged" even if not 100% target
      meta: { book: "Atomic Habits" },
    },
  });

  console.log("📝 Created Sample Logs (History & JSON Metadata)");

  // CREATE DAY PLAN: Testing AI Schedule JSON Structure
  await prisma.dayPlan.create({
    data: {
      userId: user.id,
      date: today,
      summary: "Focus on deep work today. Energy levels seem high.",
      dayScore: 85,
      schedule: [
        {
          time: "08:00",
          task: "Morning Meditation",
          type: "habit",
          duration: 10,
        },
        { time: "09:00", task: "Deep Work Block", type: "work", duration: 120 },
        { time: "12:00", task: "Gym Session", type: "habit", duration: 45 },
      ],
    },
  });

  console.log("🤖 Created AI Day Plan");

  console.log("✅ Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
