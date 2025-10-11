/**
 * Screener View - Main screening interface
 */

'use client';

import { useState, useEffect } from 'react';
import { ScreenEmailCard } from './screen-email-card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUnscreenedEmails } from '@/actions/screening-actions';
import { Filter, Sparkles, CheckCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface UnscreenedSender {
  emailAddress: string;
  name: string;
  firstEmail: any;
  count: number;
  classification: any;
}

export function ScreenerView() {
  const [senders, setSenders] = useState<UnscreenedSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadUnscreened();
  }, []);

  const loadUnscreened = async () => {
    setLoading(true);
    const result = await getUnscreenedEmails();
    if (result.success) {
      setSenders(result.data || []);
      
      // Show tutorial if this is first time
      if (result.data && result.data.length > 0 && !localStorage.getItem('screener_tutorial_seen')) {
        setShowTutorial(true);
        localStorage.setItem('screener_tutorial_seen', 'true');
      }
    }
    setLoading(false);
  };

  const handleScreened = () => {
    // Reload to show next sender
    loadUnscreened();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading screener...</p>
        </div>
      </div>
    );
  }

  if (senders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-muted-foreground mb-6">
            No new senders to screen. All emails are flowing to their proper places.
          </p>
          <Button onClick={loadUnscreened} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Filter className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Screener</h1>
          </div>
          <p className="text-muted-foreground">
            {senders.length} new {senders.length === 1 ? 'sender' : 'senders'} to screen
          </p>
        </div>

        {/* Tutorial Alert */}
        {showTutorial && (
          <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-sm">
              <strong className="font-semibold">Welcome to the Screener!</strong>
              <div className="mt-2 space-y-1">
                <p>• <strong>Imbox</strong>: Important people and messages you care about</p>
                <p>• <strong>The Feed</strong>: Newsletters, updates, bulk mail</p>
                <p>• <strong>Paper Trail</strong>: Receipts, confirmations, transactions</p>
                <p>• <strong>Block</strong>: Spam and unwanted senders</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => setShowTutorial(false)}
              >
                Got it
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Screening Cards */}
        <motion.div 
          className="space-y-4"
          layout // Enable parent container layout animations
        >
          <AnimatePresence mode="popLayout">
            {senders.map((sender) => (
              <ScreenEmailCard
                key={sender.emailAddress}
                emailAddress={sender.emailAddress}
                name={sender.name}
                firstEmail={sender.firstEmail}
                count={sender.count}
                classification={sender.classification}
                onScreened={handleScreened}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* AI Info */}
        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2 pt-4">
          <Sparkles className="h-3 w-3" />
          AI classifications are suggestions - you have final control
        </div>
      </div>
    </div>
  );
}

