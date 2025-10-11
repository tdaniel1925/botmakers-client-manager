/**
 * Email Mode Settings - Choose Traditional / Hey / Hybrid
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Inbox, Sparkles, Layers, Check, Info } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export type EmailMode = 'traditional' | 'hey' | 'hybrid';

interface EmailModeSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMode?: EmailMode;
  onModeChange: (mode: EmailMode) => void;
  isFirstTime?: boolean;
}

export function EmailModeSettings({
  open,
  onOpenChange,
  currentMode = 'traditional',
  onModeChange,
  isFirstTime = false,
}: EmailModeSettingsProps) {
  const [selectedMode, setSelectedMode] = useState<EmailMode>(currentMode);
  const [screeningEnabled, setScreeningEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setSelectedMode(currentMode);
  }, [currentMode]);

  const handleSave = async () => {
    setSaving(true);
    
    // Save to user preferences
    try {
      await fetch('/api/user/email-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          screeningEnabled,
        }),
      });
      
      onModeChange(selectedMode);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
    
    setSaving(false);
  };

  const modes: Array<{
    id: EmailMode;
    title: string;
    icon: any;
    description: string;
    features: string[];
    recommended?: boolean;
  }> = [
    {
      id: 'traditional',
      title: 'Traditional Mode',
      icon: Inbox,
      description: 'Familiar inbox with folders',
      features: [
        'Standard folder structure',
        'Inbox, Sent, Drafts, etc.',
        'Traditional email workflow',
        'No screening required',
      ],
    },
    {
      id: 'hey',
      title: 'Hey Mode',
      icon: Sparkles,
      description: 'Revolutionary workflow-focused experience',
      features: [
        'Email screening for new senders',
        'Imbox, Feed, Paper Trail views',
        'Reply Later workflow',
        'Privacy protection',
        'Keyboard shortcuts',
      ],
      recommended: true,
    },
    {
      id: 'hybrid',
      title: 'Hybrid Mode',
      icon: Layers,
      description: 'Best of both worlds',
      features: [
        'Hey views + Traditional folders',
        'Optional screening',
        'All Hey features available',
        'Flexible workflow',
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isFirstTime ? 'Welcome to Your Email Client!' : 'Email Mode Settings'}
          </DialogTitle>
          <DialogDescription>
            {isFirstTime
              ? 'Choose how you want to experience email. You can change this anytime.'
              : 'Switch between different email workflows to match your style.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as EmailMode)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;

                return (
                  <Card
                    key={mode.id}
                    className={`relative p-6 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-primary shadow-lg scale-[1.02]'
                        : 'border hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    {mode.recommended && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500">
                        Recommended
                      </Badge>
                    )}

                    <div className="flex items-start gap-3 mb-4">
                      <RadioGroupItem value={mode.id} id={mode.id} />
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-muted'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                    </div>

                    <Label htmlFor={mode.id} className="cursor-pointer">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{mode.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
                      </div>
                    </Label>

                    <ul className="space-y-2">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </RadioGroup>

          {/* Screening Toggle (for Hey and Hybrid modes) */}
          {(selectedMode === 'hey' || selectedMode === 'hybrid') && (
            <Card className="p-4 mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold">Email Screening</h4>
                    <Badge variant="secondary" className="text-xs">
                      Hey Feature
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Control who reaches your Imbox. New senders must be screened before their emails appear.
                  </p>
                  {selectedMode === 'hybrid' && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground bg-white/50 p-2 rounded">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>In Hybrid mode, screening is optional. Disable it to keep traditional workflow.</span>
                    </div>
                  )}
                </div>
                <Switch
                  checked={screeningEnabled}
                  onCheckedChange={setScreeningEnabled}
                  disabled={selectedMode === 'hey'} // Always on in Hey mode
                />
              </div>
            </Card>
          )}

          {/* Info Box */}
          {isFirstTime && (
            <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Don't worry!</p>
                  <p>
                    You can change your email mode anytime in Settings. Try different modes to see what works best for
                    you.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          {!isFirstTime && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="min-w-32">
            {saving ? 'Saving...' : isFirstTime ? 'Get Started' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to detect first-time user and show mode selection
 */
export function useEmailModeOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    // Check if user has set email mode
    const hasSetMode = localStorage.getItem('email_mode_set');
    if (!hasSetMode) {
      setShowOnboarding(true);
    }
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem('email_mode_set', 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}

