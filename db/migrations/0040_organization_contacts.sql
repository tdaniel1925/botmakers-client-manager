-- Organization Contacts System
-- Allows multiple contact persons per organization with full contact information

-- Create organization contacts table
CREATE TABLE IF NOT EXISTS organization_contacts (
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
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure organization exists
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_org_contacts_org_id ON organization_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_contacts_email ON organization_contacts(email);
CREATE INDEX IF NOT EXISTS idx_org_contacts_name ON organization_contacts(full_name);
CREATE INDEX IF NOT EXISTS idx_org_contacts_primary ON organization_contacts(organization_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_org_contacts_active ON organization_contacts(is_active);

-- Optional: Add primary contact reference to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES organization_contacts(id) ON DELETE SET NULL;

-- Add index for project primary contact lookups
CREATE INDEX IF NOT EXISTS idx_projects_primary_contact ON projects(primary_contact_id);
