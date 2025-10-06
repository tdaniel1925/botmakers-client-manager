-- Add SMS notification fields to platform_admins table
ALTER TABLE platform_admins
ADD COLUMN phone_number TEXT,
ADD COLUMN sms_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN notification_preferences JSONB DEFAULT '{}';

-- Add SMS notification fields to user_roles table
ALTER TABLE user_roles
ADD COLUMN phone_number TEXT,
ADD COLUMN sms_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN notification_preferences JSONB DEFAULT '{}';

-- Comment explaining the notification preferences structure
COMMENT ON COLUMN platform_admins.notification_preferences IS 'JSON object with notification type keys (e.g., "onboarding_invite") and values of "email", "sms", or "both"';
COMMENT ON COLUMN user_roles.notification_preferences IS 'JSON object with notification type keys (e.g., "onboarding_invite") and values of "email", "sms", or "both"';
