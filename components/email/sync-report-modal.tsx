// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Folder,
  Mail,
  Clock,
  TrendingUp,
  X,
} from 'lucide-react';
import { getSyncReportAction } from '@/actions/email-sync-report-actions';
import { syncNylasEmailsAction } from '@/actions/email-nylas-actions';
import { formatDistanceToNow } from 'date-fns';

interface SyncReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountEmail: string;
}

export function SyncReportModal({
  open,
  onOpenChange,
  accountId,
  accountEmail,
}: SyncReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (open && accountId) {
      loadReport();
    }
  }, [open, accountId]);

  const loadReport = async () => {
    setLoading(true);
    const result = await getSyncReportAction(accountId);
    setReport(result);
    setLoading(false);
  };

  const handleSyncMissing = async () => {
    setSyncing(true);
    await syncNylasEmailsAction(accountId);
    // Reload report after sync
    await loadReport();
    setSyncing(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sync Report</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating report...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report || !report.success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sync Report</DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Failed to Generate Report</p>
            <p className="text-sm text-muted-foreground mb-4">
              {report?.error || 'Unable to fetch sync data'}
            </p>
            <Button onClick={loadReport} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const syncStatus = report.syncPercentage === 100 ? 'complete' : 'incomplete';
  const statusColor = syncStatus === 'complete' ? 'text-green-600' : 'text-orange-600';
  const statusBgColor = syncStatus === 'complete' ? 'bg-green-50' : 'bg-orange-50';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Email Sync Report</DialogTitle>
              <DialogDescription className="mt-2">
                {accountEmail}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Total in Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report.totalInNylas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">emails in provider</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Synced to Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {report.totalInDatabase.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">emails in database</p>
              </CardContent>
            </Card>

            <Card className={statusBgColor}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${statusColor}`}>
                  {syncStatus === 'complete' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  Unsynced Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${statusColor}`}>
                  {report.unsynced.toLocaleString()}
                </div>
                <p className={`text-xs mt-1 ${statusColor}`}>
                  {syncStatus === 'complete' ? 'All emails synced!' : 'emails not yet synced'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sync Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sync Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {report.syncPercentage}% Complete
                  </span>
                  <Badge variant={syncStatus === 'complete' ? 'default' : 'secondary'}>
                    {syncStatus === 'complete' ? 'Fully Synced' : 'Partial Sync'}
                  </Badge>
                </div>
                <Progress value={report.syncPercentage} className="h-3" />
              </div>

              {report.lastSyncDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last synced{' '}
                    {formatDistanceToNow(new Date(report.lastSyncDate), { addSuffix: true })}
                  </span>
                </div>
              )}

              {report.unsynced > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                        {report.unsynced.toLocaleString()} emails not synced
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        These emails exist in your email account but haven't been downloaded to the
                        client yet.
                      </p>
                      <Button
                        onClick={handleSyncMissing}
                        disabled={syncing}
                        className="mt-3"
                        size="sm"
                      >
                        {syncing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Sync Missing Emails
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Folder Breakdown */}
          {report.folderBreakdown && report.folderBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Folder Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.folderBreakdown.map((folder: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{folder.folderName}</span>
                        </div>
                        {folder.unsynced > 0 ? (
                          <Badge variant="destructive">{folder.unsynced} unsynced</Badge>
                        ) : (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">In Account:</span>
                          <span className="ml-2 font-medium">
                            {folder.totalInNylas.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">In Client:</span>
                          <span className="ml-2 font-medium text-blue-600">
                            {folder.totalInDatabase.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Missing:</span>
                          <span className="ml-2 font-medium text-orange-600">
                            {folder.unsynced.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={loadReport} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Report
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


