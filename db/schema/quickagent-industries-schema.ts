import { pgTable, uuid, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { voiceCampaignsTable } from "./voice-campaigns-schema";

export const quickagentIndustriesTable = pgTable("quickagent_industries", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(), // "insurance-agents", "dental-practices", "law-firms"
  name: text("name").notNull(), // "QuickAgent for Insurance Agents"
  description: text("description"),
  tagline: text("tagline"),
  setupAssistantCampaignId: uuid("setup_assistant_campaign_id").references(() => voiceCampaignsTable.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  config: jsonb("config"), // Industry-specific settings and questions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectQuickAgentIndustry = typeof quickagentIndustriesTable.$inferSelect;
export type InsertQuickAgentIndustry = typeof quickagentIndustriesTable.$inferInsert;

