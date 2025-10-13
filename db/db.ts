import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Note: Profiles tables are temporarily commented out in schema/index.ts
// The schema object is automatically populated with all exported tables from schema/index.ts

// Add connection options with improved timeout and retry settings for Vercel environment
const connectionOptions = {
  max: 3,               // Lower max connections to prevent overloading
  idle_timeout: 10,     // Shorter idle timeout
  connect_timeout: 5,   // Shorter connect timeout
  prepare: false,       // Disable prepared statements
  keepalive: true,      // Keep connections alive
  debug: false,         // Disable debug logging in production
  ssl: 'require',       // REQUIRED for Supabase connections
  connection: {
    application_name: "whop-boilerplate" // Identify app in Supabase logs
  }
};

// Create a postgres client with optimized connection options
export const client = postgres(process.env.DATABASE_URL!, connectionOptions);

// Create a drizzle client
export const db = drizzle(client, { schema });

// Export a function to check the database connection health
export async function checkDatabaseConnection(): Promise<{ ok: boolean, message: string }> {
  try {
    // Attempt a simple query with a shorter timeout
    const startTime = Date.now();
    await Promise.race([
      client`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 2000))
    ]);
    const duration = Date.now() - startTime;
    return { 
      ok: true, 
      message: `Database connection successful (${duration}ms)` 
    };
  } catch (error) {
    console.error("Database connection check failed:", error);
    
    // Return detailed error information
    const message = error instanceof Error 
      ? `Connection error: ${error.message}`
      : "Unknown connection error";
      
    return { ok: false, message };
  }
}

// Function to check and log connection status
export async function logDatabaseConnectionStatus(): Promise<void> {
  try {
    const status = await checkDatabaseConnection();
    if (status.ok) {
      console.log(status.message);
    } else {
      console.error(status.message);
    }
  } catch (error) {
    console.error("Failed to check database connection:", error);
  }
}
