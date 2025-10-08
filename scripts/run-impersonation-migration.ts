/**
 * Script to add impersonation tables to the database
 * Run with: npx tsx scripts/run-impersonation-migration.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  console.log("🔗 Connecting to database...");
  const sql = postgres(databaseUrl);

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, "add-impersonation-tables.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    console.log("📝 Running impersonation tables migration...");

    // Execute the SQL
    await sql.unsafe(sqlContent);

    console.log("✅ Impersonation tables created successfully!");
    console.log("");
    console.log("📊 Created:");
    console.log("  - impersonation_sessions table");
    console.log("  - Indexes for admin_user_id and organization_id");
    console.log("");
    console.log("🎉 Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
