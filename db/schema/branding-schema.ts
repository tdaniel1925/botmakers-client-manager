import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const brandingSettingsTable = pgTable("branding_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id"), // NULL for platform-wide
  
  // Logo URLs
  logoUrl: text("logo_url"),
  logoDarkUrl: text("logo_dark_url"),
  faviconUrl: text("favicon_url"),
  
  // Brand Colors
  primaryColor: text("primary_color").default("#00ff00").notNull(), // Neon green
  secondaryColor: text("secondary_color").default("#000000").notNull(), // Black
  accentColor: text("accent_color").default("#00ff00").notNull(), // Neon green
  textColor: text("text_color").default("#000000").notNull(), // Black
  backgroundColor: text("background_color").default("#ffffff").notNull(), // White
  
  // Company Information
  companyName: text("company_name").default("Botmakers").notNull(),
  companyAddress: text("company_address"),
  companyPhone: text("company_phone"),
  companyEmail: text("company_email"),
  supportEmail: text("support_email").default("support@botmakers.com").notNull(),
  
  // Social Links
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  websiteUrl: text("website_url").default("https://botmakers.com").notNull(),
  
  // Email Settings
  emailFromName: text("email_from_name").default("Botmakers").notNull(),
  emailFooterText: text("email_footer_text"),
  
  // Feature Flags
  showLogoInEmails: boolean("show_logo_in_emails").default(true).notNull(),
  showSocialLinks: boolean("show_social_links").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type BrandingSettings = typeof brandingSettingsTable.$inferSelect;
export type InsertBrandingSettings = typeof brandingSettingsTable.$inferInsert;
