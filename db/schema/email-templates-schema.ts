/**
 * Email Templates Schema
 * For saving frequently used email content as templates
 */

import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const emailTemplatesTable = pgTable('email_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // User and organization
  userId: text('user_id').notNull(),
  organizationId: uuid('organization_id'),
  
  // Template details
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).default('general'),
  subject: text('subject'),
  body: text('body').notNull(),
  
  // Metadata
  isShared: text('is_shared').default('false'), // Can be shared with team
  usageCount: text('usage_count').default('0'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Zod schemas for validation
export const insertEmailTemplateSchema = createInsertSchema(emailTemplatesTable);
export const selectEmailTemplateSchema = createSelectSchema(emailTemplatesTable);

// Types
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type SelectEmailTemplate = z.infer<typeof selectEmailTemplateSchema>;
