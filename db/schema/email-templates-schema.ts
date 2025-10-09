/**
 * Email Templates Schema
 * Reusable email templates for quick composition
 */

import { pgTable, text, timestamp, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Ownership
  userId: text('user_id').notNull(),
  organizationId: uuid('organization_id'),
  isGlobal: boolean('is_global').default(false), // Available to all users in org
  
  // Template info
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // e.g., "follow-up", "introduction", "thank-you"
  
  // Content
  subject: text('subject'),
  body: text('body').notNull(),
  htmlBody: text('html_body'),
  
  // Variables (placeholders like {{firstName}}, {{companyName}})
  variables: jsonb('variables').$type<Array<{
    name: string;
    description: string;
    defaultValue?: string;
    required: boolean;
  }>>(),
  
  // Metadata
  usageCount: text('usage_count').default('0'),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  isFavorite: boolean('is_favorite').default(false),
  tags: jsonb('tags').$type<string[]>(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Zod schemas
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates, {
  name: z.string().min(1),
  body: z.string().min(1),
  category: z.string().optional(),
  variables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    defaultValue: z.string().optional(),
    required: z.boolean(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);

// TypeScript types
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type SelectEmailTemplate = typeof emailTemplates.$inferSelect;

