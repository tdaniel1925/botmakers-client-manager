/**
 * Email Summary Popup Component
 * Shows AI-generated summary on hover
 */

'use client';

import { useState, useEffect } from 'react';
import { Bot, TrendingUp, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { quickSummary } from '@/lib/ai-email-summarizer';

interface EmailSummaryPopupProps {
  email: SelectEmail;
  position: { x: number; y: number };
  onClose: () => void;
}

export function EmailSummaryPopup({ email, position, onClose }: EmailSummaryPopupProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [email.id]);

  async function loadSummary() {
    try {
      setLoading(true);
      const summaryText = await quickSummary(email);
      setSummary(summaryText);
    } catch (error) {
      console.error('Error loading summary:', error);
      setSummary(email.snippet || email.subject);
    } finally {
      setLoading(false);
    }
  }

  const getSentimentIcon = () => {
    if (!email.sentiment) return null;

    const icons = {
      positive: <TrendingUp className="h-4 w-4 text-green-500" />,
      neutral: <AlertCircle className="h-4 w-4 text-gray-500" />,
      negative: <AlertCircle className="h-4 w-4 text-red-500" />,
    };

    return icons[email.sentiment];
  };

  const getPriorityBadge = () => {
    if (!email.priority || email.priority === 'medium') return null;

    const styles = {
      low: 'bg-gray-100 text-gray-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[email.priority]}`}>
        {email.priority.toUpperCase()}
      </span>
    );
  };

  return (
    <>
      {/* Backdrop to detect mouse leave */}
      <div
        className="fixed inset-0 z-40"
        onMouseEnter={onClose}
      />

      {/* Popup */}
      <div
        className="fixed z-50 bg-background border shadow-lg rounded-lg p-4 max-w-md animate-in fade-in slide-in-from-left-2 duration-200"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          maxHeight: '400px',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Summary</span>
          {getSentimentIcon()}
          {getPriorityBadge()}
        </div>

        {/* Summary Content */}
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded w-5/6" />
            <div className="h-3 bg-muted animate-pulse rounded w-4/6" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <button className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <ArrowRight className="h-3 w-3" />
                Reply
              </button>
              
              <button className="flex items-center gap-1 px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                <CheckCircle className="h-3 w-3" />
                Archive
              </button>
            </div>
          </div>
        )}

        {/* Arrow pointer */}
        <div className="absolute left-0 top-4 transform -translate-x-full">
          <div className="border-8 border-transparent border-r-background" style={{ filter: 'drop-shadow(-1px 0 0 rgb(229 231 235))' }} />
        </div>
      </div>
    </>
  );
}

