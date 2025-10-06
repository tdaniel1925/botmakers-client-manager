import { auth, currentUser } from "@clerk/nextjs/server";
import { isPlatformAdmin as checkIsPlatformAdmin, getPlatformAdmin, createPlatformAdmin } from "@/db/queries/platform-queries";

/**
 * Check if the current user is a platform admin
 */
export async function isPlatformAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  
  return await checkIsPlatformAdmin(userId);
}

/**
 * Get current platform admin or null
 */
export async function getCurrentPlatformAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  
  return await getPlatformAdmin(userId);
}

/**
 * Ensure current user is a platform admin, redirect if not
 */
export async function requirePlatformAdmin() {
  const isAdmin = await isPlatformAdmin();
  
  if (!isAdmin) {
    throw new Error("Unauthorized: Platform admin access required");
  }
  
  return true;
}

/**
 * Auto-create platform admin for the current user if they don't exist
 * This is called on first access to platform routes
 */
export async function ensurePlatformAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  
  // Check if already a platform admin
  const existingAdmin = await getPlatformAdmin(userId);
  if (existingAdmin) return true;
  
  // Create platform admin record for this user
  try {
    await createPlatformAdmin({
      userId,
      role: "super_admin",
      permissions: {},
    });
    console.log(`Created platform admin for user: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error creating platform admin:", error);
    return false;
  }
}

/**
 * Get platform admin role for current user
 */
export async function getPlatformAdminRole(): Promise<string | null> {
  const admin = await getCurrentPlatformAdmin();
  return admin?.role || null;
}

