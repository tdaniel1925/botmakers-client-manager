-- Migration: Onboarding Templates Library & To-Do System
-- Created: 2024-10-05

-- Create onboarding templates library table
CREATE TABLE IF NOT EXISTS onboarding_templates_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Structured question tree with steps
  conditional_rules JSONB, -- Logic for show/hide questions
  industry_triggers JSONB, -- Industry-specific questions mapping
  is_ai_generated BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  avg_completion_time INTEGER, -- minutes
  completion_rate DECIMAL(5,2),
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP
);

-- Create onboarding todos table
CREATE TABLE IF NOT EXISTS onboarding_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES client_onboarding_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('admin', 'client')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'setup', 'compliance', 'content', 'integration', 'review', etc.
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  estimated_minutes INTEGER,
  assigned_to UUID, -- user_id for admin tasks
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  completed_by TEXT,
  order_index INTEGER DEFAULT 0,
  dependencies JSONB DEFAULT '[]'::jsonb, -- Array of todo IDs this depends on
  ai_generated BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data like file upload requirements
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create project types registry table
CREATE TABLE IF NOT EXISTS project_types_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  template_id UUID REFERENCES onboarding_templates_library(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add columns to client_onboarding_sessions table
ALTER TABLE client_onboarding_sessions 
ADD COLUMN IF NOT EXISTS template_library_id UUID REFERENCES onboarding_templates_library(id),
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS todos_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS todos_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS todos_approved_by TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_templates_project_type ON onboarding_templates_library(project_type);
CREATE INDEX IF NOT EXISTS idx_templates_archived ON onboarding_templates_library(archived_at) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todos_session_id ON onboarding_todos(session_id);
CREATE INDEX IF NOT EXISTS idx_todos_type ON onboarding_todos(type);
CREATE INDEX IF NOT EXISTS idx_todos_assigned_to ON onboarding_todos(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_todos_completed ON onboarding_todos(is_completed);
CREATE INDEX IF NOT EXISTS idx_project_types_active ON project_types_registry(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_template ON client_onboarding_sessions(template_library_id);
CREATE INDEX IF NOT EXISTS idx_sessions_todos_approved ON client_onboarding_sessions(todos_approved_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON onboarding_templates_library
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON onboarding_todos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_types_updated_at BEFORE UPDATE ON project_types_registry
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
