/**
 * Organization Contacts Database Schema
 * Defines the structure for organization contact persons
 */

// @ts-nocheck - Temporary: Schema type inference issues

import { pgTable, text, timestamp, boolean, index, uuid } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { organizationsTable } from "./crm-schema";

export const organizationContactsTable = pgTable("organization_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  
  // Basic info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fullName: text("full_name"), // Generated column in database
  jobTitle: text("job_title"),
  department: text("department"),
  
  // Contact details
  email: text("email"),
  phone: text("phone"),
  mobilePhone: text("mobile_phone"),
  officePhone: text("office_phone"),
  
  // Address
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  
  // Additional info
  notes: text("notes"),
  isPrimary: boolean("is_primary").default(false),
  isActive: boolean("is_active").default(true),
  
  // Metadata
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  orgIdIdx: index("idx_org_contacts_org_id").on(table.organizationId),
  emailIdx: index("idx_org_contacts_email").on(table.email),
  nameIdx: index("idx_org_contacts_name").on(table.fullName),
  activeIdx: index("idx_org_contacts_active").on(table.isActive),
}));

// TypeScript types
export type SelectOrganizationContact = InferSelectModel<typeof organizationContactsTable>;
export type InsertOrganizationContact = InferInsertModel<typeof organizationContactsTable>;
