/**
 * Email Layout Component
 * Header + 3-panel layout: Folders | Email Cards | AI Copilot
 */

'use client';

import { useState, useEffect } from 'react';
import { EmailHeader } from './email-header';
import { FolderSidebar } from './folder-sidebar';
import { EmailCardList } from './email-card-list';
import { EmailViewer } from './email-viewer';
import { EmailCopilotPanel } from './email-copilot-panel';
import { DraggableAIModal } from './draggable-ai-modal';
import { AddEmailAccountDialog } from './add-email-account-dialog';
import { EmailComposer } from './email-composer';
import { getEmailAccountsAction } from '@/actions/email-account-actions';
import { getEmailsAction, getEmailFoldersAction } from '@/actions/email-operations-actions';
import type { SelectEmailAccount } from '@/db/schema/email-schema';
import type { SelectEmail } from '@/db/schema/email-schema';
import { useAuth } from '@clerk/nextjs';

export function EmailLayout() {
  const { userId } = useAuth();
  const [accounts, setAccounts] = useState<SelectEmailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SelectEmailAccount | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('INBOX');
  const [emails, setEmails] = useState<SelectEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SelectEmail | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState<{
    to?: string;
    subject?: string;
    body?: string;
    replyTo?: any;
  }>({});

  // Load email accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // Load emails and folders when account changes (NOT when folder changes)
  useEffect(() => {
    if (selectedAccount) {
      loadEmails();
      loadFolders();
    }
  }, [selectedAccount]); // Removed selectedFolder dependency - we'll filter client-side!

  async function loadAccounts() {
    try {
      const result = await getEmailAccountsAction();
      if (result.success && result.accounts) {
        setAccounts(result.accounts);
        
        // Auto-select first account or default account
        const defaultAccount = result.accounts.find((acc) => acc.isDefault);
        const accountToSelect = defaultAccount || result.accounts[0];
        
        if (accountToSelect) {
          setSelectedAccount(accountToSelect);
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFolders() {
    if (!selectedAccount) return;

    try {
      const result = await getEmailFoldersAction(selectedAccount.id);
      
      if (result.success && result.folders) {
        setFolders(result.folders);
        console.log(`✅ Loaded ${result.folders.length} folders`);
      } else {
        console.error('❌ Failed to load folders:', result.error);
        setFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    }
  }

  async function loadEmails() {
    if (!selectedAccount) {
      console.log('⚠️ No account selected, skipping email load');
      return;
    }

    try {
      setLoading(true);
      console.log('📧 Loading emails for account:', {
        accountId: selectedAccount.id,
        email: selectedAccount.emailAddress,
        folder: selectedFolder
      });
      
      const result = await getEmailsAction(selectedAccount.id);
      
      console.log('📧 Load emails result:', { 
        success: result.success, 
        emailCount: result.data?.emails?.length || 0,
        accountId: selectedAccount.id,
        error: result.error || 'none'
      });
      
      if (result.success && result.data?.emails) {
        setEmails(result.data.emails);
        console.log(`✅ Loaded ${result.data.emails.length} emails from database`);
        
        // Log first few email subjects for verification
        if (result.data.emails.length > 0) {
          console.log('Sample emails:', result.data.emails.slice(0, 3).map(e => ({
            subject: e.subject,
            from: typeof e.fromAddress === 'object' ? e.fromAddress.email : e.fromAddress,
            receivedAt: e.receivedAt
          })));
        } else {
          console.warn('⚠️ No emails found in database for this account');
        }
      } else {
        console.error('❌ Failed to load emails:', result.error);
        setEmails([]); // Clear emails on error
      }
    } catch (error) {
      console.error('❌ Exception loading emails:', error);
      setEmails([]); // Clear emails on error
    } finally {
      setLoading(false);
    }
  }

  const handleAccountChange = (account: SelectEmailAccount) => {
    setSelectedAccount(account);
    setSelectedEmail(null);
  };

  const handleFolderChange = (folder: string) => {
    console.log('📁 Switching to folder:', folder, '(instant client-side filter)');
    setSelectedFolder(folder);
    setSelectedEmail(null);
  };

  const handleEmailSelect = (email: SelectEmail) => {
    setSelectedEmail(email);
  };

  const handleOpenComposerWithDraft = (draft: {
    to?: string;
    subject?: string;
    body?: string;
    replyTo?: any;
  }) => {
    setComposerDraft(draft);
    setComposerOpen(true);
  };

  const handleRefresh = () => {
    loadEmails();
    loadFolders();
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your email accounts...</p>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold">No Email Accounts Connected</h2>
            <p className="text-muted-foreground">
              Connect your email account to start managing your inbox with AI-powered intelligence.
            </p>
            <button 
              onClick={() => setShowAddDialog(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Connect Email Account
            </button>
          </div>
        </div>

        {/* Add Email Account Dialog */}
        <AddEmailAccountDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={() => {
            setShowAddDialog(false);
            loadAccounts();
          }}
        />
      </>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header with all controls */}
      <EmailHeader
        accounts={accounts}
        selectedAccount={selectedAccount}
        onAccountChange={handleAccountChange}
        onRefresh={() => {
          loadAccounts();
          loadEmails();
          loadFolders();
        }}
        onCompose={() => setComposerOpen(true)}
      />

      {/* Main content: 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Folder Sidebar with Account Switcher */}
        <FolderSidebar
          selectedFolder={selectedFolder}
          folders={folders}
          onFolderChange={handleFolderChange}
          accounts={accounts}
          selectedAccount={selectedAccount}
          onAccountChange={handleAccountChange}
          onAddAccount={() => setShowAddDialog(true)}
        />

        {/* Panel 2: Email Cards or Email Viewer */}
        {selectedEmail ? (
          <EmailViewer
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
          />
        ) : (
          <EmailCardList
            emails={emails}
            selectedEmail={selectedEmail}
            onEmailSelect={handleEmailSelect}
            loading={loading}
            folder={selectedFolder}
            accountId={selectedAccount?.id}
            onComposeWithDraft={handleOpenComposerWithDraft}
          />
        )}

        {/* AI Copilot - Draggable Modal */}
        {copilotOpen && (
          <DraggableAIModal
            onClose={() => setCopilotOpen(false)}
            title="AI Copilot"
          >
            <EmailCopilotPanel
              selectedEmail={selectedEmail}
              accountId={selectedAccount?.id || null}
              onClose={() => setCopilotOpen(false)}
            />
          </DraggableAIModal>
        )}

        {/* Toggle button when copilot is closed */}
        {!copilotOpen && (
          <button
            onClick={() => setCopilotOpen(true)}
            className="fixed right-4 bottom-4 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-40"
            title="Open AI Copilot"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Email Composer */}
      {composerOpen && selectedAccount && userId && (
        <EmailComposer
          open={composerOpen}
          onClose={() => {
            setComposerOpen(false);
            setComposerDraft({}); // Clear draft data
            loadEmails(); // Refresh emails after composing
          }}
          userId={userId}
          accountId={selectedAccount.id}
          replyTo={composerDraft.replyTo}
          initialBody={composerDraft.body}
          initialTo={composerDraft.to}
          initialSubject={composerDraft.subject}
        />
      )}
    </div>
  );
}

