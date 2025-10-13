import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      result,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
      }
    }, { status: 500 });
  }
}

