/**
 * Screen Email Card - Card for making screening decisions
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Newspaper, 
  Receipt, 
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Inbox,
  Ban
} from 'lucide-react';
import { screenSender } from '@/actions/screening-actions';
import { formatDistanceToNow } from 'date-fns';
import type { SelectEmail } from '@/db/schema/email-schema';
import type { ClassificationResult } from '@/lib/email-classifier';

interface ScreenEmailCardProps {
  emailAddress: string;
  name: string;
  firstEmail: SelectEmail;
  count: number;
  classification: ClassificationResult;
  onScreened: (emailAddress: string) => void;
}

export function ScreenEmailCard({
  emailAddress,
  name,
  firstEmail,
  count,
  classification,
  onScreened,
}: ScreenEmailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [screening, setScreening] = useState(false);
  const [notes, setNotes] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const { toast } = useToast();

  const handleScreen = async (decision: 'imbox' | 'feed' | 'paper_trail' | 'blocked') => {
    setScreening(true);
    setIsExiting(true); // Start exit animation immediately
    
    // Remove from UI immediately (optimistic update)
    onScreened(emailAddress);
    
    // Show confirmation toast
    const toastMessages = {
      imbox: { 
        title: '✨ Moved to Imbox',
        description: `${name} will now appear in your Imbox`,
        icon: Inbox,
      },
      feed: { 
        title: '📰 Moved to The Feed',
        description: `${name} will now appear in The Feed`,
        icon: Newspaper,
      },
      paper_trail: { 
        title: '🧾 Moved to Paper Trail',
        description: `${name} will now appear in Paper Trail`,
        icon: Receipt,
      },
      blocked: { 
        title: '🚫 Blocked',
        description: `${name} has been blocked`,
        icon: Ban,
      },
    };
    
    const message = toastMessages[decision];
    toast({
      title: message.title,
      description: message.description,
    });
    
    // Update database in background
    const result = await screenSender(emailAddress, decision, firstEmail.id, notes);
    
    if (!result.success) {
      console.error('Failed to screen sender:', result.error);
      toast({
        title: '❌ Error',
        description: 'Failed to screen sender. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      layout // Enable layout animations for smooth repositioning
      initial={{ opacity: 0, y: 20 }}
      animate={isExiting ? { opacity: 0, x: -100, scale: 0.9 } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeInOut',
        layout: { duration: 0.4, ease: 'easeInOut' } // Smooth layout shift
      }}
    >
      <Card className="p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <p className="text-sm text-muted-foreground">{emailAddress}</p>
              </div>
            </div>
            
            {/* Classification Badge */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {classification.view === 'feed' && <Newspaper className="h-3 w-3 mr-1" />}
                {classification.view === 'paper_trail' && <Receipt className="h-3 w-3 mr-1" />}
                AI suggests: {classification.view.replace('_', ' ')}
              </Badge>
              {count > 1 && (
                <Badge variant="outline" className="text-xs">
                  {count} emails waiting
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* First Email Preview */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{firstEmail.subject}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(firstEmail.receivedAt), { addSuffix: true })}
            </span>
          </div>
          
          {expanded && (
            <div className="text-sm text-muted-foreground line-clamp-4 mt-2">
              {firstEmail.snippet || firstEmail.bodyText?.slice(0, 200) + '...'}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show preview
              </>
            )}
          </Button>
        </div>

        {/* Screening Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Button
            onClick={() => handleScreen('imbox')}
            disabled={screening}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Yes - Imbox
          </Button>
          
          <Button
            onClick={() => handleScreen('feed')}
            disabled={screening}
            size="lg"
            variant="outline"
            className="border-2 font-semibold"
          >
            <Newspaper className="mr-2 h-5 w-5" />
            The Feed
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleScreen('paper_trail')}
            disabled={screening}
            size="lg"
            variant="outline"
            className="border-2 font-semibold"
          >
            <Receipt className="mr-2 h-5 w-5" />
            Paper Trail
          </Button>
          
          <Button
            onClick={() => handleScreen('blocked')}
            disabled={screening}
            size="lg"
            variant="destructive"
            className="font-semibold"
          >
            <XCircle className="mr-2 h-5 w-5" />
            Block
          </Button>
        </div>

        {/* Optional Notes */}
        {expanded && (
          <div className="mt-4">
            <Textarea
              placeholder="Add notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm"
              rows={2}
            />
          </div>
        )}

        {/* AI Reasoning */}
        {expanded && (
          <div className="mt-3 text-xs text-muted-foreground italic">
            💡 {classification.reasoning}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

