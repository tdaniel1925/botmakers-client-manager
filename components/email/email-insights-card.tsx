/**
 * Email Insights Card Component
 * Displays context about selected email for AI copilot
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useEffect, useState } from 'react';
import { Mail, Clock, MessageSquare, AlertCircle, Users, TrendingUp } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { 
  getThreadContextAction, 
  getSenderInsightsAction 
} from '@/actions/email-insights-actions';

interface EmailInsightsCardProps {
  email: SelectEmail;
}

export function EmailInsightsCard({ email }: EmailInsightsCardProps) {
  const [threadContext, setThreadContext] = useState<any>(null);
  const [senderInsights, setSenderInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [email.id]);

  async function loadInsights() {
    try {
      setLoading(true);
      const [threadResult, senderResult] = await Promise.all([
        getThreadContextAction(email.id as string),
        getSenderInsightsAction(email.id as string),
      ]);

      if (threadResult.success && threadResult.data) {
        setThreadContext(threadResult.data);
      }

      if (senderResult.success && senderResult.data) {
        setSenderInsights(senderResult.data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <div className="h-3 bg-muted animate-pulse rounded" />
        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
      </div>
    );
  }

  const sender = typeof email.fromAddress === 'object' && email.fromAddress
    ? (email.fromAddress as any).email
    : email.fromAddress;

  const isUrgent = email.priority === 'urgent' || email.priority === 'high';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        Email Insights
      </div>

      <div className="space-y-2 text-xs">
        {/* Sender Info */}
        {senderInsights && (
          <div className="flex items-start gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-muted-foreground">Sender</div>
              <div className="font-medium truncate">{sender}</div>
              <div className="text-xs text-muted-foreground">
                {senderInsights.emailCount} emails • {senderInsights.communicationFrequency}
              </div>
            </div>
          </div>
        )}

        {/* Thread Info */}
        {threadContext && threadContext.messageCount > 1 && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-muted-foreground">Thread</div>
              <div className="font-medium">
                {threadContext.messageCount} messages, {threadContext.participantCount} people
              </div>
              <div className="text-xs text-muted-foreground">Started {threadContext.threadAge}</div>
            </div>
          </div>
        )}

        {/* Topics (extracted from subject) */}
        <div className="flex items-start gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-muted-foreground">Topics</div>
            <div className="font-medium line-clamp-2">{(email.subject as any) || '(No Subject)'}</div>
          </div>
        </div>

        {/* Urgency */}
        {isUrgent && (
          <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="font-medium">High Priority</span>
          </div>
        )}
      </div>
    </div>
  );
}



