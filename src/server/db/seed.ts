import { db } from "./index";
import { categories, users } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting seed...");

  // Fetch the first user (usually you, after you login once) to assign categories to
  const allUsers = await db.select().from(users).limit(1);

  if (allUsers.length === 0) {
    console.log("⚠️ No users found. Login via the UI first, then run seed.");
    return;
  }

  const mainUser = allUsers[0];
  console.log(`👤 Seeding data for user: ${mainUser.email}`);

  // Default Categories
  const defaultCategories = [
    { name: "Work", color: "rose", userId: mainUser.id },
    { name: "Personal", color: "sky", userId: mainUser.id },
    { name: "Health", color: "emerald", userId: mainUser.id },
    { name: "Deep Work", color: "violet", userId: mainUser.id },
  ];

  // 3. Upsert Categories (Prevent duplicates)
  for (const cat of defaultCategories) {
    await db
      .insert(categories)
      .values(cat)
      .onConflictDoNothing() // Simple check, ideally use unique constraints if defined
      .execute();
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
