/**
 * Simple Upload Test API
 * Test Supabase connection directly
 */

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function GET() {
  const results: any = {
    step1_envVars: 'checking...',
    step2_clientCreation: 'pending...',
    step3_bucketList: 'pending...',
    step4_bucketExists: 'pending...',
    error: null,
  };

  try {
    // Step 1: Check env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    results.step1_envVars = {
      url: supabaseUrl ? '✅ Set' : '❌ Missing',
      serviceKey: supabaseServiceKey ? '✅ Set' : '❌ Missing',
    };

    if (!supabaseUrl || !supabaseServiceKey) {
      results.error = 'Missing environment variables';
      return NextResponse.json(results, { status: 500 });
    }

    // Step 2: Create client
    results.step2_clientCreation = 'Creating Supabase server client...';
    const supabase = getSupabaseServerClient();
    results.step2_clientCreation = '✅ Client created successfully';

    // Step 3: List buckets
    results.step3_bucketList = 'Fetching buckets...';
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      results.step3_bucketList = `❌ Error: ${bucketsError.message}`;
      results.error = bucketsError.message;
      return NextResponse.json(results, { status: 500 });
    }

    results.step3_bucketList = `✅ Found ${buckets?.length || 0} buckets`;
    results.bucketNames = buckets?.map(b => b.name) || [];

    // Step 4: Check if onboarding-files bucket exists
    const targetBucket = 'onboarding-files';
    const bucketExists = buckets?.some(b => b.name === targetBucket);
    
    results.step4_bucketExists = bucketExists 
      ? `✅ Bucket '${targetBucket}' exists` 
      : `❌ Bucket '${targetBucket}' NOT FOUND`;

    if (!bucketExists) {
      results.error = `Bucket '${targetBucket}' does not exist. Create it in Supabase Dashboard → Storage`;
      results.solution = 'Go to Supabase Dashboard → Storage → New bucket → Name: onboarding-files';
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error';
    results.errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(results, { status: 500 });
  }
}
