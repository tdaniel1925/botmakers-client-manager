/**
 * Verify Storage Setup
 * Check bucket and RLS policies
 */

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    
    // Check buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: bucketsError.message,
      }, { status: 500 });
    }

    const targetBucket = 'onboarding-files';
    const bucketExists = buckets?.some(b => b.name === targetBucket);
    
    // Try to list files (will fail if RLS policies aren't set)
    let rlsTest = 'not tested';
    if (bucketExists) {
      const { data: files, error: listError } = await supabase.storage
        .from(targetBucket)
        .list('', { limit: 1 });
      
      if (listError) {
        rlsTest = `❌ RLS Error: ${listError.message}`;
      } else {
        rlsTest = '✅ RLS policies working';
      }
    }

    return NextResponse.json({
      bucketExists: bucketExists ? '✅ Bucket exists' : '❌ Bucket not found',
      bucketName: targetBucket,
      totalBuckets: buckets?.length || 0,
      allBuckets: buckets?.map(b => b.name) || [],
      rlsStatus: rlsTest,
      nextStep: !bucketExists 
        ? 'Create bucket in Supabase Dashboard' 
        : rlsTest.includes('❌')
        ? 'Add RLS policies in Supabase SQL Editor (see below)'
        : '✅ Ready to upload!',
      sqlCommand: rlsTest.includes('❌') ? `
-- Run this in Supabase SQL Editor:

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = '${targetBucket}');

CREATE POLICY "Allow org members to read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = '${targetBucket}');

CREATE POLICY "Allow org members to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = '${targetBucket}');
      ` : 'RLS policies already configured',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
