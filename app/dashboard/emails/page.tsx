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

export default async function DashboardEmailsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Email</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered email client with smart summaries
            </p>
          </div>
        </div>
      </div>

      {/* Email Layout */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<EmailLayoutSkeleton />}>
          <EmailLayout />
        </Suspense>
      </div>
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

