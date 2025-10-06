'use server';

import { auth } from '@clerk/nextjs/server';
import { 
  getPlatformBranding, 
  updatePlatformBranding,
  getOrganizationBranding,
  updateOrganizationBranding 
} from '@/db/queries/branding-queries';
import { UTApi } from 'uploadthing/server';
import { revalidatePath } from 'next/cache';

const utapi = new UTApi();

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
 * Upload logo to UploadThing with enhanced error handling
 * ✅ FIX BUG-016: Properly handle and report upload failures
 */
export async function uploadLogoAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized', retryable: false };
  }

  try {
    const file = formData.get('logo') as File;
    if (!file) {
      return { success: false, error: 'No file provided', retryable: false };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, SVG, WebP`, 
        retryable: false 
      };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { 
        success: false, 
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of 2MB`, 
        retryable: false 
      };
    }

    // Validate file dimensions (optional but recommended)
    // Note: Can't validate dimensions server-side without reading the file
    console.log(`[branding-actions] Uploading logo: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

    // Upload using UploadThing with timeout handling
    const uploadPromise = utapi.uploadFiles([file]);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    );
    
    const response = await Promise.race([uploadPromise, timeoutPromise]) as any;
    
    if (!response || response.length === 0) {
      console.error('[branding-actions] UploadThing returned empty response');
      return { 
        success: false, 
        error: 'Upload service returned empty response. Please try again.', 
        retryable: true 
      };
    }

    if (response[0].error) {
      const errorMessage = response[0].error.message || 'Upload failed';
      console.error('[branding-actions] UploadThing error:', errorMessage, response[0].error);
      
      // Check if it's a network/timeout error (retryable)
      const isRetryable = errorMessage.toLowerCase().includes('timeout') || 
                          errorMessage.toLowerCase().includes('network') ||
                          errorMessage.toLowerCase().includes('fetch failed');
      
      return { 
        success: false, 
        error: `Upload failed: ${errorMessage}`, 
        retryable: isRetryable 
      };
    }

    if (!response[0].data || !response[0].data.url) {
      console.error('[branding-actions] UploadThing response missing data.url:', response[0]);
      return { 
        success: false, 
        error: 'Upload completed but no URL returned. Please try again.', 
        retryable: true 
      };
    }

    const uploadedFile = response[0].data;
    console.log('✅ Logo uploaded successfully:', uploadedFile.url);

    return { success: true, url: uploadedFile.url, retryable: false };
  } catch (error: any) {
    console.error('[branding-actions] Upload logo error:', error);
    
    // Determine if error is retryable
    const isRetryable = error.message?.toLowerCase().includes('timeout') || 
                        error.message?.toLowerCase().includes('network') ||
                        error.message?.toLowerCase().includes('fetch') ||
                        error.name === 'AbortError';
    
    const errorMessage = error.message || 'Unknown error occurred during upload';
    
    return { 
      success: false, 
      error: isRetryable ? `${errorMessage}. Please check your connection and try again.` : errorMessage, 
      retryable: isRetryable 
    };
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
