/**
 * Screening History - Review and manage screened senders
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getScreeningHistoryAction } from '@/actions/undo-screening-action';
import { undoScreeningAction } from '@/actions/undo-screening-action';
import { Inbox, Newspaper, Receipt, Ban, Undo2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface ScreenedContact {
  id: string;
  emailAddress: string;
  decision: 'imbox' | 'feed' | 'paper_trail' | 'blocked';
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function ScreeningHistory() {
  const [contacts, setContacts] = useState<ScreenedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const result = await getScreeningHistoryAction();
    if (result.success && result.data) {
      setContacts(result.data as any);
    }
    setLoading(false);
  };

  const handleUndo = async (emailAddress: string, name: string) => {
    const result = await undoScreeningAction(emailAddress);
    if (result.success) {
      toast({
        title: 'Screening Undone',
        description: `${name} returned to Screener`,
      });
      loadHistory(); // Refresh list
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to undo screening',
        variant: 'destructive',
      });
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'imbox':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Inbox className="h-3 w-3 mr-1" />
            Imbox
          </Badge>
        );
      case 'feed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Newspaper className="h-3 w-3 mr-1" />
            The Feed
          </Badge>
        );
      case 'paper_trail':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <Receipt className="h-3 w-3 mr-1" />
            Paper Trail
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <Ban className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        );
      default:
        return <Badge variant="secondary">{decision}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading screening history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Screening History</h1>
            <p className="text-muted-foreground mt-2">
              Review and manage your screened senders
            </p>
          </div>
          <Button onClick={loadHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No screened contacts yet. Start screening in the Screener view.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {contact.emailAddress.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{contact.emailAddress}</h3>
                        <p className="text-xs text-muted-foreground">
                          Screened {format(new Date(contact.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDecisionBadge(contact.decision)}
                      {contact.notes && (
                        <span className="text-xs text-muted-foreground">
                          Note: {contact.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUndo(contact.emailAddress, contact.emailAddress)}
                    className="gap-1"
                  >
                    <Undo2 className="h-4 w-4" />
                    Undo
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


