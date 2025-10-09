/**
 * Undo Send Toast Component
 * Shows a 30-second countdown to undo email sending
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UndoSendToastProps {
  scheduledEmailId: string;
  recipientEmail: string;
  onUndo: () => Promise<void>;
  onComplete: () => void;
  delaySeconds?: number;
}

export function UndoSendToast({
  scheduledEmailId,
  recipientEmail,
  onUndo,
  onComplete,
  delaySeconds = 30,
}: UndoSendToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(delaySeconds);
  const [isUndoing, setIsUndoing] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  const handleUndo = async () => {
    setIsUndoing(true);
    try {
      await onUndo();
      onComplete();
    } catch (error) {
      console.error('Error undoing send:', error);
      setIsUndoing(false);
    }
  };

  const progressPercentage = (secondsLeft / delaySeconds) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-background border shadow-lg rounded-lg p-4 w-[400px]">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold">Email Sending...</span>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {secondsLeft}s
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              To: {recipientEmail}
            </p>

            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={isUndoing}
                className="flex-1"
              >
                {isUndoing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                    Undoing...
                  </>
                ) : (
                  <>
                    <Undo className="h-3 w-3 mr-2" />
                    Undo Send
                  </>
                )}
              </Button>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

