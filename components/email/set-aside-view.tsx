/**
 * Set Aside View - Temporary holding area for emails
 */

'use client';

import { useState, useEffect } from 'react';
import { EmailCard } from './email-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, X, ArrowUp } from 'lucide-react';
import { getSetAsideEmails, removeSetAside, bubbleUpEmail } from '@/actions/reply-later-actions';
import { formatDistanceToNow } from 'date-fns';
import type { SelectEmail } from '@/db/schema/email-schema';
import { motion, AnimatePresence } from 'framer-motion';

interface SetAsideViewProps {
  onEmailClick: (email: SelectEmail) => void;
}

export function SetAsideView({ onEmailClick }: SetAsideViewProps) {
  const [emails, setEmails] = useState<SelectEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setLoading(true);
    const result = await getSetAsideEmails();
    if (result.success) {
      setEmails(result.data || []);
    }
    setLoading(false);
  };

  const handleRemove = async (emailId: string) => {
    await removeSetAside(emailId);
    setEmails(prev => prev.filter(email => email.id !== emailId));
  };

  const handleBubbleUp = async (emailId: string) => {
    await bubbleUpEmail(emailId);
    await removeSetAside(emailId);
    setEmails(prev => prev.filter(email => email.id !== emailId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Set Aside</h2>
              <p className="text-xs text-muted-foreground">
                {emails.length === 0
                  ? 'No emails set aside'
                  : `${emails.length} ${emails.length === 1 ? 'email' : 'emails'} temporarily parked`}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-3">
          Like a desk pile - not urgent, but might need later
        </p>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto p-4">
        {emails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Set Aside is empty</h3>
              <p className="text-muted-foreground">
                Use this for emails you might need later but aren't urgent
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {emails.map((email) => {
                const daysSetAside = email.setAsideAt 
                  ? Math.floor((Date.now() - new Date(email.setAsideAt).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => onEmailClick(email)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <EmailCard
                          email={email}
                          isSelected={false}
                          onClick={() => onEmailClick(email)}
                        />
                        
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Set aside {formatDistanceToNow(new Date(email.setAsideAt!), { addSuffix: true })}
                          </Badge>
                          {daysSetAside >= 3 && (
                            <Badge variant="secondary" className="text-xs">
                              {daysSetAside} days old
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBubbleUp(email.id);
                          }}
                          className="whitespace-nowrap"
                        >
                          <ArrowUp className="mr-1 h-3 w-3" />
                          Bubble Up
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(email.id);
                          }}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

