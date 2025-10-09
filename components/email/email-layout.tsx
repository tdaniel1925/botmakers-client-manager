/**
 * Email Layout Component
 * 3-panel layout: Folders | Email Cards | AI Copilot
 */

'use client';

import { useState, useEffect } from 'react';
import { FolderSidebar } from './folder-sidebar';
import { EmailCardList } from './email-card-list';
import { EmailCopilotPanel } from './email-copilot-panel';
import { AddEmailAccountDialog } from './add-email-account-dialog';
import { getEmailAccountsAction } from '@/actions/email-account-actions';
import { getEmailsAction } from '@/actions/email-operations-actions';
import type { SelectEmailAccount } from '@/db/schema/email-schema';
import type { SelectEmail } from '@/db/schema/email-schema';

export function EmailLayout() {
  const [accounts, setAccounts] = useState<SelectEmailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SelectEmailAccount | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('INBOX');
  const [emails, setEmails] = useState<SelectEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SelectEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Load email accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // Load emails when account or folder changes
  useEffect(() => {
    if (selectedAccount) {
      loadEmails();
    }
  }, [selectedAccount, selectedFolder]);

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

  async function loadEmails() {
    if (!selectedAccount) return;

    try {
      setLoading(true);
      const result = await getEmailsAction(selectedAccount.id);
      
      if (result.success && result.emails) {
        setEmails(result.emails);
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAccountChange = (account: SelectEmailAccount) => {
    setSelectedAccount(account);
    setSelectedEmail(null);
  };

  const handleFolderChange = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedEmail(null);
  };

  const handleEmailSelect = (email: SelectEmail) => {
    setSelectedEmail(email);
  };

  const handleRefresh = () => {
    loadEmails();
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
        {showAddDialog && (
          <AddEmailAccountDialog
            onClose={() => setShowAddDialog(false)}
            onSuccess={() => {
              setShowAddDialog(false);
              loadAccounts();
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* Panel 1: Folder Sidebar */}
      <FolderSidebar
        accounts={accounts}
        selectedAccount={selectedAccount}
        selectedFolder={selectedFolder}
        onAccountChange={handleAccountChange}
        onFolderChange={handleFolderChange}
        onRefresh={handleRefresh}
      />

      {/* Panel 2: Email Cards */}
      <EmailCardList
        emails={emails}
        selectedEmail={selectedEmail}
        onEmailSelect={handleEmailSelect}
        loading={loading}
        folder={selectedFolder}
      />

      {/* Panel 3: AI Copilot (collapsible) */}
      {copilotOpen && (
        <EmailCopilotPanel
          selectedEmail={selectedEmail}
          onClose={() => setCopilotOpen(false)}
        />
      )}

      {/* Toggle button when copilot is closed */}
      {!copilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed right-4 bottom-4 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
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
  );
}

