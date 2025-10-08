/**
 * Migration Script: Add billing_type Column to voice_campaigns
 * 
 * This script adds the billing_type column to the voice_campaigns table,
 * allowing platform admins to mark campaigns as either "admin_free" or "billable".
 * 
 * Usage: npx tsx scripts/run-billing-type-migration.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" }); // Load environment variables BEFORE importing db

import { db } from "../db/db";
import { sql } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";

async function runBillingTypeMigration() {
  console.log("🚀 Starting billing_type column migration...");
  console.log("=".repeat(60));
  
  try {
    // Test connection
    console.log("\n🔗 Connecting to database...");
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected successfully.");
    
    // Read SQL file
    console.log("\n📝 Reading migration SQL file...");
    const sqlFilePath = path.join(__dirname, "add-billing-type-column.sql");
    const sqlContent = await fs.readFile(sqlFilePath, { encoding: "utf8" });
    console.log("✅ SQL file loaded.");
    
    // Execute the SQL
    console.log("\n🔧 Executing migration...");
    await db.execute(sql.raw(sqlContent));
    
    console.log("\n✅ Migration completed successfully!");
    console.log("=".repeat(60));
    console.log("\n📊 Changes applied:");
    console.log("  ✓ Added billing_type column to voice_campaigns");
    console.log("  ✓ Set default value to 'billable'");
    console.log("  ✓ Added check constraint for valid values");
    console.log("  ✓ Updated existing campaigns to 'billable'");
    console.log("\n🎉 You can now create admin-free campaigns!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
runBillingTypeMigration().catch((err) => {
  console.error("\n❌ Unhandled error during migration:", err);
  process.exit(1);
});
