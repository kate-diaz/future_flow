import { db } from "./db";
import { users, careers, opportunities, resources, trainingPrograms, goals, profiles, savedOpportunities, progressRecords, academicModules } from "@shared/schema";
import { sql } from "drizzle-orm";

async function resetDatabase() {
  try {
    console.log("🗑️  Clearing database...");

    // Delete all data in correct order (respecting foreign keys)
    await db.delete(savedOpportunities);
    await db.delete(progressRecords);
    await db.delete(academicModules);
    await db.delete(goals);
    await db.delete(profiles);
    await db.delete(users);
    await db.delete(careers);
    await db.delete(opportunities);
    await db.delete(resources);
    await db.delete(trainingPrograms);

    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

resetDatabase();
