/**
 * Scheduled Emails Schema
 * For emails to be sent at a future time
 */

import { pgTable, text, timestamp, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const scheduledEmails = pgTable('scheduled_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Account and user
  accountId: uuid('account_id').notNull(),
  userId: text('user_id').notNull(),
  organizationId: uuid('organization_id'),
  
  // Email content
  to: jsonb('to').notNull().$type<string[]>(),
  cc: jsonb('cc').$type<string[]>(),
  bcc: jsonb('bcc').$type<string[]>(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  htmlBody: text('html_body'),
  
  // Attachments
  attachments: jsonb('attachments').$type<Array<{
    filename: string;
    url: string;
    mimeType: string;
    size: number;
  }>>(),
  
  // Scheduling
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  timezone: text('timezone').default('UTC'),
  
  // Status
  status: text('status').notNull().default('pending'), // pending, sent, failed, cancelled
  sentAt: timestamp('sent_at', { withTimezone: true }),
  error: text('error'),
  
  // Metadata
  isDraft: boolean('is_draft').default(false),
  replyToEmailId: uuid('reply_to_email_id'),
  threadId: uuid('thread_id'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Zod schemas for validation
export const insertScheduledEmailSchema = createInsertSchema(scheduledEmails, {
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
  scheduledAt: z.date(),
  status: z.enum(['pending', 'sent', 'failed', 'cancelled']).default('pending'),
});

export const selectScheduledEmailSchema = createSelectSchema(scheduledEmails);

// TypeScript types
export type InsertScheduledEmail = z.infer<typeof insertScheduledEmailSchema>;
export type SelectScheduledEmail = typeof scheduledEmails.$inferSelect;

