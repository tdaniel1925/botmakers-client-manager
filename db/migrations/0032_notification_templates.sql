-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  category TEXT NOT NULL,
  subject TEXT, -- For emails only
  body_text TEXT NOT NULL, -- Plain text for SMS, text version for email
  body_html TEXT, -- For emails only
  variables JSONB DEFAULT '[]', -- Available variables
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT true, -- System templates can't be deleted
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_notification_templates_category_type ON notification_templates(category, type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);

-- Seed with current email templates
INSERT INTO notification_templates (name, type, category, subject, body_text, body_html, variables, is_system) VALUES
-- Email Templates
('Onboarding Invitation', 'email', 'onboarding_invite', 
 '🎉 You''re invited to get started with {{projectName}}!',
 'Hi {{clientName}},\n\nWe''re excited to work with you on {{projectName}}! To get started, please complete our onboarding questionnaire.\n\nGet Started: {{link}}\n\nThis should take about 15-20 minutes. You can save and return at any time.\n\nIf you have any questions, just reply to this email.\n\nBest regards,\n{{adminName}}',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;"><h1 style="margin: 0;">🎉 Let''s Get Started!</h1></div><div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;"><p>Hi {{clientName}},</p><p>We''re excited to work with you on <strong>{{projectName}}</strong>! To get started, please complete our onboarding questionnaire.</p><div style="text-align: center; margin: 30px 0;"><a href="{{link}}" style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started</a></div><p style="color: #6b7280; font-size: 14px;">This should take about 15-20 minutes. You can save and return at any time.</p><p style="margin-top: 30px;">If you have any questions, just reply to this email.</p><p>Best regards,<br>{{adminName}}</p></div></div></body></html>',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"link","label":"Onboarding Link","example":"https://app.com/onboarding/abc123"},{"key":"adminName","label":"Admin Name","example":"Jane Smith"}]',
 true),

('Onboarding Complete', 'email', 'onboarding_complete',
 '✅ {{clientName}} completed onboarding for {{projectName}}',
 'Great news!\n\n{{clientName}} has completed the onboarding questionnaire for {{projectName}}.\n\nReview their responses here: {{link}}\n\nNext steps:\n- Review all responses\n- Generate and approve to-do lists\n- Schedule kickoff meeting',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #10b981;">✅ Onboarding Complete!</h2><p><strong>{{clientName}}</strong> has completed the onboarding questionnaire for <strong>{{projectName}}</strong>.</p><div style="text-align: center; margin: 20px 0;"><a href="{{link}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review Responses</a></div><div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;"><strong>Next steps:</strong><ul style="margin: 10px 0;"><li>Review all responses</li><li>Generate and approve to-do lists</li><li>Schedule kickoff meeting</li></ul></div></div></body></html>',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"link","label":"Session Link","example":"https://app.com/platform/onboarding/abc123"}]',
 true),

('To-Dos Approved', 'email', 'todos_approved',
 '🎯 Your tasks for {{projectName}} are ready!',
 'Hi {{clientName}},\n\nGreat news! Your project team has reviewed your onboarding and prepared {{todoCount}} task(s) for you to complete.\n\nProject: {{projectName}}\n\nThese tasks will help us gather everything we need to get started. Most can be completed in just a few minutes.\n\nView Your Tasks: {{link}}\n\nWhat''s next?\nComplete your tasks at your own pace. We''ll be notified as you finish each one!\n\nQuestions? Just reply to this email.',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;"><h1 style="margin: 0;">🎯 Your Tasks Are Ready!</h1></div><div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;"><p>Hi {{clientName}},</p><p>Great news! Your project team has reviewed your onboarding and prepared <strong>{{todoCount}} task(s)</strong> for you to complete.</p><p><strong>Project:</strong> {{projectName}}</p><p>These tasks will help us gather everything we need to get started. Most can be completed in just a few minutes.</p><div style="text-align: center; margin: 30px 0;"><a href="{{link}}" style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Your Tasks</a></div><div style="background: #e0e7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;"><strong>What''s next?</strong><br>Complete your tasks at your own pace. We''ll be notified as you finish each one!</div><p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Questions? Just reply to this email.</p></div></div></body></html>',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"todoCount","label":"Number of Tasks","example":"5"},{"key":"link","label":"Tasks Link","example":"https://app.com/todos/abc123"}]',
 true),

('To-Do Completed', 'email', 'todo_completed',
 '✅ {{clientName}} completed a task - {{projectName}}',
 'Task Completed\n\n{{clientName}} completed: "{{todoTitle}}"\n\nProject: {{projectName}}\n\nView details: {{link}}',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2>✅ Task Completed</h2><div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin: 20px 0;"><p style="margin: 0;"><strong>{{clientName}}</strong> completed:</p><p style="margin: 10px 0 0 0; font-size: 16px;">"{{todoTitle}}"</p></div><p><strong>Project:</strong> {{projectName}}</p><a href="{{link}}" style="display: inline-block; background: #667eea; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">View Details</a></div></body></html>',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"todoTitle","label":"Task Title","example":"Upload call list"},{"key":"link","label":"Session Link","example":"https://app.com/platform/onboarding/abc123"}]',
 true),

('All To-Dos Complete', 'email', 'all_todos_complete',
 '🎉 {{clientName}} completed all tasks - {{projectName}}',
 'Congratulations!\n\n{{clientName}} has completed all their tasks for {{projectName}}!\n\nThey''re ready for the next steps. Time to kick off the project!\n\nView Session: {{link}}',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;"><h1 style="margin: 0; font-size: 48px;">🎉</h1><h2 style="margin: 10px 0;">All Tasks Complete!</h2></div><p><strong>{{clientName}}</strong> has completed all their tasks for <strong>{{projectName}}</strong>!</p><p>They''re ready for the next steps. Time to kick off the project!</p><div style="text-align: center; margin: 20px 0;"><a href="{{link}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Complete Session</a></div></div></body></html>',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"link","label":"Session Link","example":"https://app.com/platform/onboarding/abc123"}]',
 true),

('Project Created', 'email', 'project_created',
 '📋 New project created: {{projectName}}',
 'New project created\n\nProject: {{projectName}}\nOrganization: {{organizationName}}\n\nView details in your dashboard.',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2>📋 New Project Created</h2><div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 6px; margin: 20px 0;"><p style="margin: 0;"><strong>Project:</strong> {{projectName}}</p><p style="margin: 10px 0 0 0;"><strong>Organization:</strong> {{organizationName}}</p></div><p>View details in your dashboard.</p></div></body></html>',
 '[{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"organizationName","label":"Organization Name","example":"Acme Corp"}]',
 true),

('Task Assigned', 'email', 'task_assigned',
 '📝 New task assigned: {{taskTitle}}',
 'New task assigned to you\n\nTask: {{taskTitle}}\nProject: {{projectName}}\nDue: {{dueDate}}\n\nCheck your dashboard for details.',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2>📝 New Task Assigned</h2><div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 20px 0;"><p style="margin: 0;"><strong>Task:</strong> {{taskTitle}}</p><p style="margin: 10px 0 0 0;"><strong>Project:</strong> {{projectName}}</p><p style="margin: 10px 0 0 0;"><strong>Due:</strong> {{dueDate}}</p></div><p>Check your dashboard for details.</p></div></body></html>',
 '[{"key":"taskTitle","label":"Task Title","example":"Review design mockups"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"dueDate","label":"Due Date","example":"Dec 15, 2025"}]',
 true);

-- Seed with current SMS templates
INSERT INTO notification_templates (name, type, category, subject, body_text, variables, is_system) VALUES
('Onboarding Invitation SMS', 'sms', 'onboarding_invite', NULL,
 'Hi {{clientName}}! You''ve been invited to complete onboarding for {{projectName}}. Start here: {{link}}',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"link","label":"Onboarding Link","example":"https://app.com/onboarding/abc"}]',
 true),

('Onboarding Complete SMS', 'sms', 'onboarding_complete', NULL,
 'Great news! {{clientName}} completed onboarding for {{projectName}}. Review now in your dashboard.',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"}]',
 true),

('To-Dos Approved SMS', 'sms', 'todos_approved', NULL,
 '{{clientName}}, your {{todoCount}} task(s) for {{projectName}} are ready! View them: {{link}}',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"todoCount","label":"Number of Tasks","example":"5"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"link","label":"Tasks Link","example":"https://app.com/todos/abc"}]',
 true),

('To-Do Completed SMS', 'sms', 'todo_completed', NULL,
 '✓ {{clientName}} completed: "{{todoTitle}}" for {{projectName}}',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"todoTitle","label":"Task Title","example":"Upload call list"},{"key":"projectName","label":"Project Name","example":"Website Redesign"}]',
 true),

('All To-Dos Complete SMS', 'sms', 'all_todos_complete', NULL,
 '🎉 {{clientName}} completed all tasks for {{projectName}}! Ready to kickoff.',
 '[{"key":"clientName","label":"Client Name","example":"John Doe"},{"key":"projectName","label":"Project Name","example":"Website Redesign"}]',
 true),

('Project Created SMS', 'sms', 'project_created', NULL,
 'New project created: {{projectName}} for {{organizationName}}. View details in your dashboard.',
 '[{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"organizationName","label":"Organization Name","example":"Acme Corp"}]',
 true),

('Task Assigned SMS', 'sms', 'task_assigned', NULL,
 'New task assigned: "{{taskTitle}}" for {{projectName}} (Due: {{dueDate}}). Check your dashboard.',
 '[{"key":"taskTitle","label":"Task Title","example":"Review design mockups"},{"key":"projectName","label":"Project Name","example":"Website Redesign"},{"key":"dueDate","label":"Due Date","example":"Dec 15"}]',
 true);

-- Add comment
COMMENT ON TABLE notification_templates IS 'Stores editable email and SMS notification templates with variable support';
