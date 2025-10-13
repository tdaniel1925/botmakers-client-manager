/**
 * Email Signatures Schema
 * For managing email signatures per account
 */

// @ts-nocheck - Temporary: Schema type inference issues

import { pgTable, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const emailSignaturesTable = pgTable('email_signatures', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // User and account
  userId: text('user_id').notNull(),
  accountId: uuid('account_id'), // Optional: associate with specific email account
  
  // Signature details
  name: varchar('name', { length: 100 }).notNull(),
  content: text('content').notNull(), // HTML content
  isDefault: boolean('is_default').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Zod schemas for validation
export const insertEmailSignatureSchema = createInsertSchema(emailSignaturesTable);
export const selectEmailSignatureSchema = createSelectSchema(emailSignaturesTable);

// Types
export type InsertEmailSignature = z.infer<typeof insertEmailSignatureSchema>;
export type SelectEmailSignature = z.infer<typeof selectEmailSignatureSchema>;


