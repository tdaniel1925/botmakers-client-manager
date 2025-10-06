import { db } from '@/db/db';
import { brandingSettingsTable } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

/**
 * Get platform-wide branding settings
 */
export async function getPlatformBranding() {
  const [branding] = await db
    .select()
    .from(brandingSettingsTable)
    .where(isNull(brandingSettingsTable.organizationId))
    .limit(1);
  
  return branding || null;
}

/**
 * Get organization-specific branding (falls back to platform branding)
 */
export async function getOrganizationBranding(orgId: string) {
  // Try org-specific first
  const [orgBranding] = await db
    .select()
    .from(brandingSettingsTable)
    .where(eq(brandingSettingsTable.organizationId, orgId))
    .limit(1);
  
  if (orgBranding) return orgBranding;
  
  // Fallback to platform branding
  return getPlatformBranding();
}

/**
 * Update platform branding
 */
export async function updatePlatformBranding(data: Partial<typeof brandingSettingsTable.$inferInsert>) {
  const existing = await getPlatformBranding();
  
  if (existing) {
    // Update existing
    const [updated] = await db
      .update(brandingSettingsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(brandingSettingsTable.id, existing.id))
      .returning();
    
    return updated;
  } else {
    // Create new
    const [created] = await db
      .insert(brandingSettingsTable)
      .values({
        ...data,
        organizationId: null,
      })
      .returning();
    
    return created;
  }
}

/**
 * Update organization branding
 */
export async function updateOrganizationBranding(
  orgId: string,
  data: Partial<typeof brandingSettingsTable.$inferInsert>
) {
  const existing = await db
    .select()
    .from(brandingSettingsTable)
    .where(eq(brandingSettingsTable.organizationId, orgId))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    const [updated] = await db
      .update(brandingSettingsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(brandingSettingsTable.id, existing[0].id))
      .returning();
    
    return updated;
  } else {
    // Create new
    const [created] = await db
      .insert(brandingSettingsTable)
      .values({
        ...data,
        organizationId: orgId,
      })
      .returning();
    
    return created;
  }
}
