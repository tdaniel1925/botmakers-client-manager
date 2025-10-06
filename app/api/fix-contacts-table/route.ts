import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    console.log("Dropping and recreating organization_contacts table...");
    
    // Drop existing table
    await db.execute(sql`DROP TABLE IF EXISTS organization_contacts CASCADE`);
    
    // Remove column from projects if exists
    await db.execute(sql`ALTER TABLE projects DROP COLUMN IF EXISTS primary_contact_id`);
    
    // Create table with correct UUID types
    await db.execute(sql`
      CREATE TABLE organization_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        
        -- Basic info
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
        job_title TEXT,
        department TEXT,
        
        -- Contact details
        email TEXT,
        phone TEXT,
        mobile_phone TEXT,
        office_phone TEXT,
        
        -- Address
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT,
        
        -- Additional info
        notes TEXT,
        is_primary BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        
        -- Metadata
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes
    await db.execute(sql`CREATE INDEX idx_org_contacts_org_id ON organization_contacts(organization_id)`);
    await db.execute(sql`CREATE INDEX idx_org_contacts_email ON organization_contacts(email)`);
    await db.execute(sql`CREATE INDEX idx_org_contacts_name ON organization_contacts(full_name)`);
    await db.execute(sql`CREATE INDEX idx_org_contacts_primary ON organization_contacts(organization_id, is_primary) WHERE is_primary = true`);
    await db.execute(sql`CREATE INDEX idx_org_contacts_active ON organization_contacts(is_active)`);
    
    // Add primary contact to projects
    await db.execute(sql`ALTER TABLE projects ADD COLUMN primary_contact_id UUID REFERENCES organization_contacts(id) ON DELETE SET NULL`);
    await db.execute(sql`CREATE INDEX idx_projects_primary_contact ON projects(primary_contact_id)`);
    
    console.log("✅ organization_contacts table created successfully!");
    
    return NextResponse.json({ 
      success: true, 
      message: "organization_contacts table created with UUID types" 
    });
  } catch (error: any) {
    console.error("Error creating organization_contacts table:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
