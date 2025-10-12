-- ============================================================================
-- CHECK YOUR DATABASE SCHEMA
-- Run this first to see what tables and columns you have
-- ============================================================================

-- Show all your tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show columns in emails table (most important)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'emails'
ORDER BY ordinal_position;

-- Show columns in projects table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'projects'
ORDER BY ordinal_position;

-- Show columns in contacts table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'contacts'
ORDER BY ordinal_position;

-- ============================================================================
-- Run this and send me the results so I can create perfect indexes for you!
-- ============================================================================

