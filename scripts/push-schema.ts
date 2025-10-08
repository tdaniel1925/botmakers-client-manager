// Push Schema Changes
// This script pushes schema changes directly to the database using drizzle-orm

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "../db/schema";

async function pushSchema() {
  const connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  console.log("🔄 Connecting to database...");
  
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });
  
  try {
    console.log("📦 Applying schema changes...");
    
    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder: "./db/migrations" });
    
    console.log("✅ Schema changes applied successfully!");
  } catch (error) {
    console.error("❌ Error applying schema changes:", error);
    throw error;
  } finally {
    await client.end();
  }
}

pushSchema()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });

