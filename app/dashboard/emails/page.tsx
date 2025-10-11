/**
 * Organization Dashboard - Email Client Page
 * Full-featured AI-powered email client for organization users
 */

import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { EmailLayout } from '@/components/email/email-layout';

export const metadata = {
  title: 'Emails | Dashboard',
  description: 'AI-powered email client',
};

// Disable caching to always fetch fresh email data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardEmailsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

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




