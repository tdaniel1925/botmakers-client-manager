-- Self-Healing System Database Schema
-- Tracks error events, healing attempts, health checks, and learned patterns

-- Healing events table - captures all errors and healing attempts
CREATE TABLE IF NOT EXISTS healing_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Event classification
  event_type TEXT NOT NULL, -- 'error_caught', 'health_check_failed', 'healing_attempted', 'healing_success', 'healing_failed'
  error_category TEXT NOT NULL, -- 'api_failure', 'database_error', 'runtime_error', 'performance_issue'
  error_source TEXT NOT NULL, -- File/component where error occurred
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_context JSONB, -- Request data, user context, etc.
  
  -- AI Analysis
  ai_analysis JSONB, -- AI's diagnosis and recommended fix
  ai_confidence_score DECIMAL(3,2), -- 0.00-1.00
  
  -- Healing Actions
  healing_strategy TEXT, -- 'retry', 'fallback', 'cache_clear', 'connection_reset', etc.
  healing_actions JSONB, -- Array of actions taken
  healing_result TEXT, -- 'success', 'partial', 'failed', 'skipped'
  healing_duration_ms INTEGER,
  
  -- Impact tracking
  affected_users TEXT[], -- User IDs affected
  affected_organizations TEXT[], -- Org IDs affected
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Notification tracking
  admins_notified TEXT[], -- Platform admin IDs notified
  notification_sent_at TIMESTAMP
);

-- Health monitoring table - tracks system health checks
CREATE TABLE IF NOT EXISTS system_health_checks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  check_type TEXT NOT NULL, -- 'api_health', 'db_connection', 'memory_usage', 'response_time', 'error_rate'
  check_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'unhealthy'
  metrics JSONB, -- Specific metrics for this check
  threshold_breached BOOLEAN DEFAULT false,
  auto_healed BOOLEAN DEFAULT false,
  healing_event_id TEXT REFERENCES healing_events(id),
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Healing patterns table - learns successful healing strategies over time
CREATE TABLE IF NOT EXISTS healing_patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  error_signature TEXT NOT NULL, -- Hash of error type + source
  error_pattern TEXT NOT NULL,
  successful_healing_strategy TEXT NOT NULL,
  success_count INTEGER DEFAULT 1,
  failure_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(error_signature)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_healing_events_created ON healing_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_healing_events_category ON healing_events(error_category);
CREATE INDEX IF NOT EXISTS idx_healing_events_severity ON healing_events(severity);
CREATE INDEX IF NOT EXISTS idx_healing_events_result ON healing_events(healing_result);
CREATE INDEX IF NOT EXISTS idx_healing_events_source ON healing_events(error_source);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON system_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked ON system_health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_type ON system_health_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_healing_patterns_signature ON healing_patterns(error_signature);
CREATE INDEX IF NOT EXISTS idx_healing_patterns_success_rate ON healing_patterns(success_rate DESC);
