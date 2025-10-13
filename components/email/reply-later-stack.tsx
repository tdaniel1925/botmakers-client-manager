/**
 * Reply Later Stack - Visual workspace for emails to reply to
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, Play, X, Calendar, ChevronRight } from 'lucide-react';
import { getReplyLaterEmails, removeReplyLater } from '@/actions/reply-later-actions';
import { formatDistanceToNow } from 'date-fns';
import type { SelectEmail } from '@/db/schema/email-schema';
import { motion, AnimatePresence } from 'framer-motion';

interface ReplyLaterStackProps {
  onEmailClick: (email: SelectEmail) => void;
  onEnterFocusMode: (emails: SelectEmail[]) => void;
}

export function ReplyLaterStack({ onEmailClick, onEnterFocusMode }: ReplyLaterStackProps) {
  const [emails, setEmails] = useState<SelectEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setLoading(true);
    const result = await getReplyLaterEmails();
    if (result.success) {
      setEmails(result.data || []);
    }
    setLoading(false);
  };

  const handleRemove = async (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemoving(emailId);
    await removeReplyLater(emailId);
    setEmails(prev => prev.filter(email => email.id !== emailId));
    setRemoving(null);
  };

  const getEmailName = (fromAddress: any): string => {
    if (!fromAddress) return 'Unknown';
    if (typeof fromAddress === 'string') return fromAddress.split('@')[0];
    if (typeof fromAddress === 'object' && fromAddress.name) return fromAddress.name;
    if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email.split('@')[0];
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Reply Later is empty</h2>
          <p className="text-muted-foreground">
            Add emails here when you want to reply but not right now
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reply Later</h2>
              <p className="text-xs text-muted-foreground">
                {emails.length} {emails.length === 1 ? 'email' : 'emails'} waiting for reply
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => onEnterFocusMode(emails)}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold"
          >
            <Play className="mr-2 h-4 w-4" />
            Focus & Reply
          </Button>
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Batch reply to all at once, or tackle them one by one
        </div>
      </div>

      {/* Email Stack */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {emails.map((email, index) => {
            const isOverdue = email.replyLaterUntil && new Date(email.replyLaterUntil) < new Date();
            
            return (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                    isOverdue ? 'border-orange-300 bg-orange-50/50' : ''
                  }`}
                  onClick={() => onEmailClick(email)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Sender */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {getEmailName(email.fromAddress).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm truncate">
                          {getEmailName(email.fromAddress)}
                        </span>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>

                      {/* Subject */}
                      <h4 className="font-semibold text-base mb-1 truncate">
                        {email.customSubject || email.subject}
                      </h4>

                      {/* Snippet */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {email.snippet || email.bodyText?.slice(0, 150)}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {email.replyLaterUntil 
                            ? `Reply by ${formatDistanceToNow(new Date(email.replyLaterUntil), { addSuffix: true })}`
                            : 'No deadline'
                          }
                        </span>
                        {email.replyLaterNote && (
                          <span className="text-xs italic">
                            "{email.replyLaterNote}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleRemove(email.id, e)}
                        disabled={removing === email.id}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEmailClick(email);
                        }}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}


