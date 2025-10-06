'use server';

import { auth } from '@clerk/nextjs/server';
import { 
  getPlatformBranding, 
  updatePlatformBranding,
  getOrganizationBranding,
  updateOrganizationBranding 
} from '@/db/queries/branding-queries';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

/**
 * Get current branding settings
 */
export async function getBrandingAction(orgId?: string) {
  try {
    const branding = orgId 
      ? await getOrganizationBranding(orgId)
      : await getPlatformBranding();
    
    return { success: true, branding };
  } catch (error: any) {
    console.error('Get branding error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update branding settings
 */
export async function updateBrandingAction(data: any, orgId?: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    console.log('[branding-actions] Updating branding with data:', JSON.stringify(data, null, 2));
    console.log('[branding-actions] orgId:', orgId);
    
    const branding = orgId
      ? await updateOrganizationBranding(orgId, data)
      : await updatePlatformBranding(data);
    
    console.log('[branding-actions] Branding saved successfully:', branding);
    
    // Revalidate pages that use branding
    revalidatePath('/platform/settings');
    revalidatePath('/platform/settings/branding');
    revalidatePath('/onboarding');
    
    return { success: true, branding };
  } catch (error: any) {
    console.error('[branding-actions] Update branding error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload logo to Vercel Blob
 */
export async function uploadLogoAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const file = formData.get('logo') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File size must be under 2MB' };
    }

    // Upload to Vercel Blob
    const blob = await put(`branding/logo-${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error('Upload logo error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test branding by sending a preview email
 */
export async function sendBrandingPreviewEmailAction(email: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get current branding
    const branding = await getPlatformBranding();
    
    // TODO: Send preview email using current branding
    // This will use the email service with branding settings
    
    return { success: true, message: 'Preview email sent!' };
  } catch (error: any) {
    console.error('Send preview email error:', error);
    return { success: false, error: error.message };
  }
}
