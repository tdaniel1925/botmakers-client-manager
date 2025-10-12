/**
 * Sync Progress Modal - Shows real-time email sync progress
 */

'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Download, Mail, Folders, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountEmail: string;
}

interface SyncStatus {
  currentPage: number;
  totalFetched: number;
  synced: number;
  skipped: number;
  errors: number;
  currentFolder?: string;
  estimatedTotal: number;
  isComplete: boolean;
}

export function SyncProgressModal({ open, onOpenChange, accountEmail }: SyncProgressModalProps) {
  const [status, setStatus] = useState<SyncStatus>({
    currentPage: 0,
    totalFetched: 0,
    synced: 0,
    skipped: 0,
    errors: 0,
    estimatedTotal: 1000,
    isComplete: false,
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isStuck, setIsStuck] = useState(false);

  // Poll for sync status
  useEffect(() => {
    if (!open) {
      console.log('❌ Sync modal closed, not polling');
      return;
    }

    console.log('✅ Sync modal opened, starting to poll for status...');
    setIsStuck(false);
    setLastUpdateTime(Date.now());

    const pollInterval = setInterval(async () => {
      try {
        console.log('🔄 Polling /api/email/sync-status...');
        const response = await fetch('/api/email/sync-status');
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Sync status received:', data);
          
          // Check if progress has changed
          if (data.totalFetched !== status.totalFetched || data.currentPage !== status.currentPage) {
            setLastUpdateTime(Date.now());
            setIsStuck(false);
          }
          
          setStatus(data);
          
          // Check if stuck (no progress for 30 seconds)
          if (Date.now() - lastUpdateTime > 30000 && !data.isComplete) {
            console.warn('⚠️ Sync appears stuck - no progress for 30 seconds');
            setIsStuck(true);
          }
          
          // Close modal when complete
          if (data.isComplete) {
            console.log('✅ Sync complete! Closing modal in 2 seconds...');
            setTimeout(() => {
              onOpenChange(false);
            }, 2000);
          }
        } else {
          console.error('❌ Sync status API returned error:', response.status);
        }
      } catch (error) {
        console.error('❌ Error polling sync status:', error);
      }
    }, 500); // Poll every 500ms for real-time updates

    // Auto-close if stuck for too long
    const stuckTimeout = setTimeout(() => {
      if (!status.isComplete && status.totalFetched === 0) {
        console.warn('⚠️ Auto-closing sync modal - no progress detected');
        onOpenChange(false);
      }
    }, 60000); // 60 seconds

    return () => {
      console.log('🛑 Stopping sync status polling');
      clearInterval(pollInterval);
      clearTimeout(stuckTimeout);
    };
  }, [open, onOpenChange, status.totalFetched, status.currentPage, lastUpdateTime]);

  const progress = status.estimatedTotal > 0 
    ? Math.min(100, (status.totalFetched / status.estimatedTotal) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 animate-pulse text-primary" />
              Syncing Emails
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
              title="Close (sync continues in background)"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Account Info */}
          <div className="text-sm text-muted-foreground">
            <Mail className="h-4 w-4 inline mr-2" />
            {accountEmail}
          </div>

          {/* Stuck Warning */}
          {isStuck && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-orange-900">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Sync may be stuck</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                No progress for 30 seconds. You can close this and try again later.
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {status.isComplete ? 'Complete!' : 'Syncing...'}
              </span>
              <span className="text-muted-foreground">
                {progress > 0 ? `${Math.round(progress)}%` : `${status.totalFetched} emails`}
              </span>
            </div>
            <Progress value={progress || (status.totalFetched > 0 ? 50 : 0)} className="h-2" />
          </div>

          {/* Current Status */}
          <AnimatePresence mode="wait">
            {!status.isComplete ? (
              <motion.div
                key="syncing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center gap-2 text-sm text-blue-900">
                  <Download className="h-4 w-4 animate-bounce" />
                  Page {status.currentPage} - Fetching emails...
                </div>
                {status.currentFolder && (
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <Folders className="h-3 w-3" />
                    Folder: {status.currentFolder}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm text-green-900">
                  <CheckCircle className="h-4 w-4" />
                  Sync completed successfully!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {status.totalFetched.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Emails Fetched</div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {status.synced.toLocaleString()}
              </div>
              <div className="text-xs text-green-700">New Emails</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {status.skipped.toLocaleString()}
              </div>
              <div className="text-xs text-blue-700">Already Synced</div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600">
                {status.errors.toLocaleString()}
              </div>
              <div className="text-xs text-orange-700">Errors</div>
            </div>
          </div>

          {/* Warnings */}
          {status.errors > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-orange-900">
                <AlertCircle className="h-4 w-4" />
                {status.errors} emails failed to sync. Check console for details.
              </div>
            </div>
          )}

          {/* Speed Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {status.currentPage}</span>
            {!status.isComplete && (
              <Badge variant="outline" className="text-xs">
                ~{Math.round((status.totalFetched / Math.max(1, status.currentPage)))} emails/page
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

