/**
 * Storage Setup API
 * Automatically creates the onboarding-files bucket
 */

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-client';
import { auth } from '@clerk/nextjs/server';
import { isPlatformAdmin } from '@/lib/platform-admin';

export async function POST() {
  try {
    // Only platform admins can run setup
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isPlatformAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only platform admins can run setup' }, { status: 403 });
    }

    const supabase = getSupabaseServerClient();
    const bucketName = 'onboarding-files';

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (bucketExists) {
      return NextResponse.json({
        success: true,
        message: `Bucket '${bucketName}' already exists`,
        alreadyExists: true,
      });
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: false, // Private bucket
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ],
    });

    if (error) {
      console.error('Bucket creation error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `✅ Bucket '${bucketName}' created successfully!`,
      data,
      nextStep: 'Now add RLS policies in Supabase SQL Editor (see SUPABASE_SETUP.md)',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
