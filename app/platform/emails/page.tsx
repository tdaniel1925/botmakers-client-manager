/**
 * Platform Admin - Email Client Page
 * Full-featured AI-powered email client for platform admins
 */

import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { EmailLayout } from '@/components/email/email-layout';
import { ensurePlatformAdmin } from '@/lib/platform-admin';

export const metadata = {
  title: 'Emails | Platform Admin',
  description: 'AI-powered email client',
};

// Disable caching to always fetch fresh email data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlatformEmailsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Ensure user is platform admin
  await ensurePlatformAdmin();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Email Layout - Full Viewport (includes header internally) */}
      <Suspense fallback={<EmailLayoutSkeleton />}>
        <EmailLayout />
      </Suspense>
    </div>
  );
}

function EmailLayoutSkeleton() {
  return (
    <div className="h-full flex">
      <div className="w-[280px] border-r bg-muted/10 animate-pulse" />
      <div className="flex-1 bg-muted/5 animate-pulse" />
      <div className="w-[420px] border-l bg-muted/10 animate-pulse" />
    </div>
  );
}




