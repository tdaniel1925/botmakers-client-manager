import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

// Load environment variables
config({ path: ".env.local" });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  console.log("🔧 Fixing database schema...");

  try {
    // Create postgres client
    const sql = postgres(connectionString);

    // Read SQL file
    const sqlFilePath = join(process.cwd(), "scripts", "fix-database.sql");
    const sqlContent = readFileSync(sqlFilePath, "utf-8");

    // Execute SQL
    await sql.unsafe(sqlContent);

    console.log("✅ Database fixes applied successfully!");
    console.log("   - Added current_subscription_id column to organizations table");

    await sql.end();
  } catch (error: any) {
    console.error("❌ Failed to apply database fixes:", error.message);
    process.exit(1);
  }
}

runMigration();

