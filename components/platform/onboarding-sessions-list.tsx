'use client';

/**
 * Onboarding Sessions List Component
 * Displays all onboarding sessions with manual onboarding actions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, User, Users, GitMerge, Mail, FolderKanban, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { convertToManualOnboardingAction } from '@/actions/manual-onboarding-actions';
import { formatDistanceToNow } from 'date-fns';

interface OnboardingSessionsListProps {
  sessions: any[];
}

export function OnboardingSessionsList({ sessions }: OnboardingSessionsListProps) {
  const router = useRouter();
  const [convertingSession, setConvertingSession] = useState<string | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const handleConvertToManual = async () => {
    if (!selectedSession) return;

    setConvertingSession(selectedSession.id);
    setShowConvertDialog(false);

    try {
      const result = await convertToManualOnboardingAction(selectedSession.id);
      
      if (result.success) {
        toast.success('Session converted to manual onboarding');
        // Redirect to manual onboarding page
        router.push(`/platform/onboarding/manual/${selectedSession.id}`);
      } else {
        toast.error(result.error || 'Failed to convert session');
      }
    } catch (error) {
      console.error('Error converting session:', error);
      toast.error('Failed to convert session');
    } finally {
      setConvertingSession(null);
      setSelectedSession(null);
    }
  };

  const openConvertDialog = (session: any) => {
    setSelectedSession(session);
    setShowConvertDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-600"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'pending_review':
        return <Badge className="bg-orange-600"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCompletionModeBadge = (mode: string) => {
    switch (mode) {
      case 'manual':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
            <User className="w-3 h-3 mr-1" />
            Admin Filled
          </Badge>
        );
      case 'hybrid':
        return (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
            <GitMerge className="w-3 h-3 mr-1" />
            Hybrid
          </Badge>
        );
      case 'client':
      default:
        return (
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            Client
          </Badge>
        );
    }
  };

  const isAbandoned = (session: any) => {
    if (session.status !== 'in_progress') return false;
    if (!session.updatedAt) return false;
    
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(session.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceUpdate >= 7; // 7+ days considered abandoned
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No onboarding sessions found</p>
        <p className="text-sm text-gray-400 mt-2">
          Create a new project with onboarding to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const abandoned = isAbandoned(session);
              
              return (
                <TableRow key={session.id} className={abandoned ? 'bg-orange-50/50' : ''}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{session.clientName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{session.clientEmail}</p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.projectName || 'Unnamed Project'}</p>
                      {session.projectId && (
                        <p className="text-xs text-gray-500">ID: {session.projectId.slice(0, 8)}...</p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.status)}
                      {abandoned && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Abandoned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getCompletionModeBadge(session.completionMode || 'client')}
                  </TableCell>
                  
                  <TableCell className="text-sm text-gray-600">
                    {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : 'N/A'}
                  </TableCell>
                  
                  <TableCell className="text-sm text-gray-600">
                    {session.updatedAt ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true }) : 'N/A'}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={convertingSession === session.id}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Onboarding Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {/* View Session */}
                        <DropdownMenuItem onClick={() => router.push(`/platform/onboarding/${session.id}`)}>
                          <FolderKanban className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {/* Complete Manually - Only for pending or in_progress client sessions */}
                        {(session.status === 'pending' || session.status === 'in_progress') && session.completionMode === 'client' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => router.push(`/platform/onboarding/manual/${session.id}`)}
                              className="text-purple-700"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Complete Onboarding Myself
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => openConvertDialog(session)}
                              className="text-indigo-700"
                            >
                              <GitMerge className="w-4 h-4 mr-2" />
                              Convert to Manual
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {/* Continue Manual - For manual/hybrid in progress */}
                        {(session.status === 'in_progress' || session.status === 'pending_review') && 
                         (session.completionMode === 'manual' || session.completionMode === 'hybrid') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => router.push(`/platform/onboarding/manual/${session.id}`)}
                              className="text-purple-700"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Continue Manual Onboarding
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {/* Resend Invitation - Only for client mode */}
                        {session.completionMode === 'client' && (session.status === 'pending' || session.status === 'in_progress') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info('Resend invitation feature coming soon')}>
                              <Mail className="w-4 h-4 mr-2" />
                              Resend Client Invitation
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Convert to Manual Confirmation Dialog */}
      <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to Manual Onboarding?</AlertDialogTitle>
            <AlertDialogDescription>
              This will convert the onboarding session to manual mode, allowing you to complete it on behalf of the client.
              Any responses already provided by the client will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToManual}>
              Convert & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}