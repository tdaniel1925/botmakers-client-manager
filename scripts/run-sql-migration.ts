// Run SQL Migration
// Execute the SQL file to add billing tables

import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: ".env.local" });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  console.log("🔄 Connecting to database...");
  
  const sql = postgres(connectionString);
  
  try {
    // Read SQL file
    const sqlFile = readFileSync(
      join(__dirname, "add-billing-tables.sql"),
      "utf-8"
    );
    
    console.log("📦 Executing SQL migration...\n");
    
    // Execute the SQL
    await sql.unsafe(sqlFile);
    
    console.log("\n✅ Billing tables created successfully!");
  } catch (error) {
    console.error("❌ Error running migration:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });

