/**
 * Follow-up System Component
 * Displays and manages email follow-up reminders
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, Check, X, Bell, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  getPendingRemindersAction,
  completeReminderAction,
  dismissReminderAction,
  detectFollowUpEmailsAction,
  createReminderAction,
} from '@/actions/email-reminders-actions';

interface FollowUpSystemProps {
  onClose?: () => void;
  onEmailClick?: (emailId: string) => void;
}

export function FollowUpSystem({ onClose, onEmailClick }: FollowUpSystemProps) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reminders' | 'suggestions'>('reminders');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [remindersResult, suggestionsResult] = await Promise.all([
        getPendingRemindersAction(),
        detectFollowUpEmailsAction(),
      ]);

      if (remindersResult.success) {
        setReminders(remindersResult.reminders || []);
      }

      if (suggestionsResult.success) {
        setSuggestions(suggestionsResult.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading follow-up data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(reminderId: string) {
    const result = await completeReminderAction(reminderId);
    if (result.success) {
      loadData();
    } else {
      alert(result.error || 'Failed to complete reminder');
    }
  }

  async function handleDismiss(reminderId: string) {
    const result = await dismissReminderAction(reminderId);
    if (result.success) {
      loadData();
    } else {
      alert(result.error || 'Failed to dismiss reminder');
    }
  }

  async function handleCreateFromSuggestion(suggestion: any) {
    const result = await createReminderAction(
      suggestion.email.id,
      suggestion.suggestedDate,
      suggestion.reason
    );

    if (result.success) {
      loadData();
    } else {
      alert(result.error || 'Failed to create reminder');
    }
  }

  const isDue = (remindAt: Date) => {
    return new Date(remindAt) <= new Date();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border shadow-lg rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Follow-up Reminders</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered follow-up detection and reminders
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b px-6 flex gap-4">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reminders'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Reminders ({reminders.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'suggestions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading...</div>
          ) : activeTab === 'reminders' ? (
            // Reminders Tab
            <div className="space-y-3">
              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No active reminders</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check the Suggestions tab for AI-detected follow-ups
                  </p>
                </div>
              ) : (
                reminders.map(({ reminder, email }) => {
                  const due = isDue(reminder.remindAt);
                  return (
                    <div
                      key={reminder.id}
                      className={`border rounded-lg p-4 transition-all ${
                        due
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                          : 'hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {due ? (
                              <Bell className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={`text-xs font-semibold ${
                              due ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                            }`}>
                              {due ? 'DUE NOW' : formatDistanceToNow(new Date(reminder.remindAt), { addSuffix: true })}
                            </span>
                          </div>

                          <button
                            onClick={() => onEmailClick?.(email.id)}
                            className="text-left w-full"
                          >
                            <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors">
                              {email.subject || '(No Subject)'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              From: {typeof email.fromAddress === 'object' ? email.fromAddress.email : email.fromAddress}
                            </p>
                          </button>

                          {reminder.reason && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{reminder.reason}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleComplete(reminder.id)}
                            size="sm"
                            variant="default"
                            className="gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Done
                          </Button>
                          <Button
                            onClick={() => handleDismiss(reminder.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Suggestions Tab
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <p className="text-muted-foreground">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No emails need follow-up right now
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          AI-Detected Follow-ups
                        </p>
                        <p className="text-blue-600 dark:text-blue-400">
                          These emails may need your attention based on their content and time since sent.
                        </p>
                      </div>
                    </div>
                  </div>

                  {suggestions.map((suggestion, index) => {
                    const email = suggestion.email;
                    return (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => onEmailClick?.(email.id)}
                              className="text-left w-full mb-2"
                            >
                              <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors">
                                {email.subject || '(No Subject)'}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Sent {formatDistanceToNow(new Date(email.sentAt || email.receivedAt), { addSuffix: true })}
                              </p>
                            </button>

                            <div className="flex items-start gap-2 text-xs bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 p-2 rounded">
                              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{suggestion.reason}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              Remind {formatDistanceToNow(suggestion.suggestedDate, { addSuffix: true })}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleCreateFromSuggestion(suggestion)}
                            size="sm"
                            variant="default"
                            className="gap-1"
                          >
                            <Bell className="h-3 w-3" />
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Reminders help you stay on top of important conversations</p>
            {onClose && (
              <Button onClick={onClose} variant="default">
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


