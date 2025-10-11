/**
 * Focus & Reply Mode - Batch reply to multiple emails
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmailComposer } from './email-composer';
import { X, ChevronRight, CheckCircle, SkipForward } from 'lucide-react';
import { removeReplyLater } from '@/actions/reply-later-actions';
import type { SelectEmail } from '@/db/schema/email-schema';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusReplyModeProps {
  emails: SelectEmail[];
  onClose: () => void;
  onComplete: () => void;
}

export function FocusReplyMode({ emails, onClose, onComplete }: FocusReplyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComposer, setShowComposer] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);

  const currentEmail = emails[currentIndex];
  const progress = ((currentIndex + 1) / emails.length) * 100;
  const remaining = emails.length - currentIndex;

  const handleNext = () => {
    if (currentIndex < emails.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowComposer(false);
    } else {
      // All done!
      onComplete();
      onClose();
    }
  };

  const handleSkip = async () => {
    setSkipped([...skipped, currentEmail.id]);
    handleNext();
  };

  const handleReply = () => {
    setShowComposer(true);
  };

  const handleSent = async () => {
    setCompleted([...completed, currentEmail.id]);
    await removeReplyLater(currentEmail.id);
    handleNext();
  };

  const getEmailName = (fromAddress: any): string => {
    if (!fromAddress) return 'Unknown';
    if (typeof fromAddress === 'string') return fromAddress.split('@')[0];
    if (typeof fromAddress === 'object' && fromAddress.name) return fromAddress.name;
    if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email.split('@')[0];
    return 'Unknown';
  };

  const getEmailAddress = (fromAddress: any): string => {
    if (!fromAddress) return '';
    if (typeof fromAddress === 'string') return fromAddress;
    if (typeof fromAddress === 'object' && fromAddress.email) return fromAddress.email;
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold">Focus & Reply</h2>
            <p className="text-sm text-muted-foreground">
              {remaining} {remaining === 1 ? 'email' : 'emails'} remaining
            </p>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
          >
            <X className="mr-2 h-4 w-4" />
            Exit Focus Mode
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {currentIndex + 1} of {emails.length}
            </span>
            <span className="text-muted-foreground">
              {completed.length} replied, {skipped.length} skipped
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Email Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEmail.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 max-w-3xl mx-auto">
                {/* Email Header */}
                <div className="flex items-start gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                    {getEmailName(currentEmail.fromAddress).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {getEmailName(currentEmail.fromAddress)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getEmailAddress(currentEmail.fromAddress)}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <h3 className="text-2xl font-bold mb-4">
                  {currentEmail.customSubject || currentEmail.subject}
                </h3>

                {/* Body */}
                <div className="prose prose-sm max-w-none">
                  {currentEmail.bodyHtml ? (
                    <div 
                      className="email-body-content"
                      dangerouslySetInnerHTML={{ __html: currentEmail.bodyHtml }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{currentEmail.bodyText}</p>
                  )}
                </div>

                {/* Note */}
                {currentEmail.replyLaterNote && (
                  <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-xs font-semibold text-yellow-800 uppercase mb-1">
                      Your Note
                    </div>
                    <p className="text-sm text-yellow-900">
                      {currentEmail.replyLaterNote}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Composer Sidebar */}
        {showComposer && (
          <div className="w-1/2 border-l bg-muted/30">
            <EmailComposer
              replyTo={currentEmail.id}
              initialTo={getEmailAddress(currentEmail.fromAddress)}
              initialSubject={`Re: ${currentEmail.subject}`}
              onClose={() => setShowComposer(false)}
              onSent={handleSent}
            />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="border-t px-6 py-4 bg-muted/30">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip
          </Button>
          
          <div className="flex gap-2">
            {!showComposer ? (
              <Button
                size="lg"
                onClick={handleReply}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Reply to this email
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={handleNext}
              >
                Next without sending
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

