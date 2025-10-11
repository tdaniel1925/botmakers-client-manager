/**
 * Settings Slide-Over Panel
 * Comprehensive email settings in a slide-over panel
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneralSettings } from './general-settings';
import { SignatureSettings } from './signature-settings';
import { RulesSettings } from './rules-settings';
import { NotificationSettings } from './notification-settings';
import { DisplaySettings } from './display-settings';
import { AdvancedSettings } from './advanced-settings';
import type { SelectEmailAccount } from '@/db/schema/email-schema';

interface SettingsSlideOverProps {
  account: SelectEmailAccount;
  folders: any[];
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

type TabId = 'general' | 'signatures' | 'rules' | 'notifications' | 'display' | 'advanced';

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: 'general', label: 'General' },
  { id: 'signatures', label: 'Signatures' },
  { id: 'rules', label: 'Rules & Filters' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'display', label: 'Display' },
  { id: 'advanced', label: 'Advanced' },
];

export function SettingsSlideOver({ account, folders, open, onClose, onUpdate }: SettingsSlideOverProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      // Prevent body scroll when open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when closed
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open && !isAnimating) return null;

  function handleClose() {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Slide-over Panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-[600px] bg-background shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b bg-background px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Email Settings</h2>
              <p className="text-sm text-muted-foreground">{account.emailAddress}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-background px-6 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <GeneralSettings account={account} />
          )}
          {activeTab === 'signatures' && (
            <SignatureSettings account={account} onUpdate={onUpdate} />
          )}
          {activeTab === 'rules' && (
            <RulesSettings account={account} folders={folders} onUpdate={onUpdate} />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings account={account} onUpdate={onUpdate} />
          )}
          {activeTab === 'display' && (
            <DisplaySettings account={account} onUpdate={onUpdate} />
          )}
          {activeTab === 'advanced' && (
            <AdvancedSettings account={account} onUpdate={onUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}


