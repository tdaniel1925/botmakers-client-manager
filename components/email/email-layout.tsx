/**
 * Email Layout Component
 * Header + 3-panel layout: Folders | Email Cards | AI Copilot
 * Now with Hey-inspired features!
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import { EmailHeader } from './email-header';
import { FolderSidebar } from './folder-sidebar';
import { HeySidebar } from './hey-sidebar';
import { EmailCardList } from './email-card-list';
import { EmailViewer } from './email-viewer';
import { EmailCopilotPanel } from './email-copilot-panel';
import { DraggableAIModal } from './draggable-ai-modal';
import { AddEmailAccountDialog } from './add-email-account-dialog';
import { EmailComposer } from './email-composer';
import { ScreenerView } from './screener-view';
import { ImboxView } from './imbox-view';
import { FeedView } from './feed-view';
import { PaperTrailView } from './paper-trail-view';
import { ReplyLaterStack } from './reply-later-stack';
import { SetAsideView } from './set-aside-view';
import { FocusReplyMode } from './focus-reply-mode';
import { CommandPalette } from './command-palette';
import { InstantSearchDialog } from './instant-search-dialog';
import { EmailModeSettings, useEmailModeOnboarding } from './email-mode-settings';
import { SyncProgressModal } from './sync-progress-modal';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { getEmailAccountsAction } from '@/actions/email-account-actions';
import { getEmailsAction, getEmailFoldersAction } from '@/actions/email-operations-actions';
import { syncNylasEmailsAction, syncNylasFoldersAction } from '@/actions/email-nylas-actions';
import type { SelectEmailAccount } from '@/db/schema/email-schema';
import type { SelectEmail } from '@/db/schema/email-schema';
import { useAuth } from '@clerk/nextjs';
import { SectionErrorBoundary } from '@/components/error-boundary';
import { logError, logInfo, logWarn, logAction } from '@/lib/logger';
import { SettingsSlideOver } from './settings/settings-slide-over';
import { SyncReportModal } from './sync-report-modal';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

export function EmailLayout() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<SelectEmailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SelectEmailAccount | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('INBOX');
  const [emails, setEmails] = useState<SelectEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SelectEmail | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState<{
    to?: string;
    subject?: string;
    body?: string;
    replyTo?: any;
  }>({});

  // Hey mode state
  const [emailMode, setEmailMode] = useState<'traditional' | 'hey' | 'hybrid'>('traditional');
  const [currentView, setCurrentView] = useState('imbox');
  const [focusMode, setFocusMode] = useState(false);
  const [focusModeEmails, setFocusModeEmails] = useState<SelectEmail[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePopupEmailId, setActivePopupEmailId] = useState<string | null>(null);
  const [syncProgressOpen, setSyncProgressOpen] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [newEmailCount, setNewEmailCount] = useState(0);
  
  // Sync and settings state
  const [showSettingsSlideOver, setShowSettingsSlideOver] = useState(false);
  const [showSyncReport, setShowSyncReport] = useState(false);
  const [folderSyncing, setFolderSyncing] = useState(false);
  
  // First-time onboarding
  const { showOnboarding, completeOnboarding } = useEmailModeOnboarding();
  
  // Calendar path
  const isPlatform = pathname?.startsWith('/platform');
  const calendarPath = isPlatform ? '/platform/calendar' : '/dashboard/calendar';
  const contactsPath = isPlatform ? '/platform/contacts' : '/dashboard/contacts';

  // Auto-refresh for new emails (every 2 minutes)
  const handleAutoRefresh = async () => {
    if (!selectedAccount) return;
    
    console.log('🔄 Auto-refreshing emails silently...');
    const previousCount = emails.length;
    
    try {
      await loadEmails();
      
      // Check if there are new emails
      const currentCount = emails.length;
      if (currentCount > previousCount) {
        const newCount = currentCount - previousCount;
        setNewEmailCount(newCount);
        
        toast({
          title: `${newCount} new email${newCount > 1 ? 's' : ''}`,
          description: 'Your inbox has been updated',
        });
      }
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  };

  // Initialize auto-refresh hook
  const { lastRefresh, isRefreshing, manualRefresh } = useAutoRefresh({
    enabled: autoRefreshEnabled && !!selectedAccount,
    intervalMs: 120000, // 2 minutes
    onRefresh: handleAutoRefresh,
  });

  // Load email accounts on mount
  useEffect(() => {
    loadAccounts();
    checkIfSyncInProgress();
  }, []);

  // Check if sync is already in progress (after page refresh)
  async function checkIfSyncInProgress() {
    try {
      console.log('🔍 Checking if sync is in progress...');
      
      const response = await fetch('/api/email/sync-status');
      if (response.ok) {
        const status = await response.json();
        
        console.log('📊 Sync status on load:', status);
        
        // If sync is in progress (not complete and has data), reopen the modal
        if (!status.isComplete && status.totalFetched > 0) {
          console.log('🔄 Detected sync in progress! Reopening modal...');
          console.log('📊 Current progress:', status);
          setSyncProgressOpen(true);
        } else if (!status.isComplete && status.currentPage > 0) {
          console.log('🔄 Sync might be in progress (early stage)...');
          setSyncProgressOpen(true);
        } else {
          console.log('✅ No sync in progress');
        }
      }
    } catch (error) {
      console.error('❌ Error checking sync status:', error);
    }
  }

  // Load emails and folders when account changes (NOT when folder changes)
  useEffect(() => {
    if (selectedAccount) {
      loadEmails();
      loadFolders();
    }
  }, [selectedAccount]); // Removed selectedFolder dependency - we'll filter client-side!

  // Load user email mode preference
  useEffect(() => {
    fetch('/api/user/email-preferences')
      .then(res => res.json())
      .then(prefs => {
        setEmailMode(prefs.emailMode || 'traditional');
      })
      .catch(err => console.error('Failed to load preferences:', err));
  }, []);

  // Keyboard shortcuts
  const shortcuts = {
    commandPalette: {
      key: 'k',
      metaKey: true,
      action: () => setCommandPaletteOpen(true),
      description: 'Open command palette',
    },
    refresh: {
      key: 'g',
      action: () => manualRefresh(),
      description: 'Check for new mail',
    },
    imbox: {
      key: '1',
      action: () => setCurrentView('imbox'),
      description: 'Go to Imbox',
    },
    feed: {
      key: '2',
      action: () => setCurrentView('feed'),
      description: 'Go to The Feed',
    },
    paperTrail: {
      key: '3',
      action: () => setCurrentView('paper_trail'),
      description: 'Go to Paper Trail',
    },
    screener: {
      key: '4',
      action: () => setCurrentView('screener'),
      description: 'Go to Screener',
    },
    search: {
      key: '/',
      action: () => setSearchOpen(true),
      description: 'Search emails',
    },
    compose: {
      key: 'c',
      action: () => setComposerOpen(true),
      description: 'Compose new email',
    },
    replyLater: {
      key: 'l',
      action: () => setCurrentView('reply_later'),
      description: 'Reply Later',
    },
    setAside: {
      key: 's',
      action: () => setCurrentView('set_aside'),
      description: 'Set Aside',
    },
  };
  
  useKeyboardShortcuts(shortcuts);

  const [accountError, setAccountError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  async function loadAccounts() {
    try {
      console.log('🔄 Loading email accounts...');
      setAccountError(null);
      
      const result = await getEmailAccountsAction();
      
      console.log('📊 Account load result:', {
        success: result.success,
        accountCount: result.accounts?.length || 0,
        accounts: result.accounts?.map(a => a.emailAddress) || [],
        error: result.error || 'none'
      });
      
      if (result.success && result.accounts) {
        console.log(`✅ Setting ${result.accounts.length} accounts`);
        setAccounts(result.accounts);
        setRetryCount(0);
        
        // Auto-select first account or default account
        const defaultAccount = result.accounts.find((acc) => acc.isDefault);
        const accountToSelect = defaultAccount || result.accounts[0];
        
        if (accountToSelect) {
          console.log(`✅ Auto-selecting account: ${accountToSelect.emailAddress}`);
          setSelectedAccount(accountToSelect);
        } else {
          console.log('⚠️ No account to auto-select');
        }
      } else {
        const errorMsg = result.error || 'Failed to load accounts';
        console.error('❌ Failed to load accounts:', errorMsg);
        logError('Failed to load email accounts', new Error(String(errorMsg)), { userId: userId || undefined });
        setAccountError(errorMsg);
        setAccounts([]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error loading accounts';
      console.error('❌ Error loading accounts:', error);
      logError('Exception loading email accounts', error instanceof Error ? error : new Error(errorMsg), { userId: userId || undefined });
      setAccountError(errorMsg);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleRetryAccounts = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    loadAccounts();
  };

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
        toast({
          title: 'Error Loading Folders',
          description: result.error || 'Failed to load email folders',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
      toast({
        title: 'Error Loading Folders',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  }

  async function loadEmails() {
    if (!selectedAccount) {
      console.log('⚠️ No account selected, skipping email load');
      return;
    }

    try {
      setLoading(true);
      setCurrentOffset(0); // Reset pagination
      console.log('📧 Loading first 50 emails for account:', {
        accountId: selectedAccount.id,
        email: selectedAccount.emailAddress,
        folder: selectedFolder
      });
      
      const result = await getEmailsAction(selectedAccount.id, { limit: 50, offset: 0 });
      
      console.log('📧 Load emails result:', { 
        success: result.success, 
        emailCount: result.data?.emails?.length || 0,
        hasMore: result.data?.hasMore || false,
        accountId: selectedAccount.id,
        error: result.error || 'none'
      });
      
      if (result.success && result.data?.emails) {
        setEmails(result.data.emails);
        setHasMore(result.data.hasMore || false);
        setCurrentOffset(50); // Set offset for next load
        console.log(`✅ Loaded ${result.data.emails.length} emails from database (hasMore: ${result.data.hasMore})`);
        
        // Log first few email subjects for verification
        if (result.data.emails.length > 0) {
          console.log('Sample emails:', result.data.emails.slice(0, 3).map(e => ({
            subject: e.subject,
            from: typeof e.fromAddress === 'object' && e.fromAddress ? (e.fromAddress as any).email : e.fromAddress,
            receivedAt: e.receivedAt
          })));
        } else {
          console.warn('⚠️ No emails found in database for this account');
        }
      } else {
        console.error('❌ Failed to load emails:', result.error);
        setEmails([]); // Clear emails on error
        setHasMore(false);
        toast({
          title: 'Error Loading Emails',
          description: result.error || 'Failed to load emails from this account',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Exception loading emails:', error);
      setEmails([]); // Clear emails on error
      toast({
        title: 'Error Loading Emails',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  // Load more emails (infinite scroll)
  async function loadMoreEmails() {
    if (!selectedAccount || !hasMore || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      console.log(`📧 Loading more emails (offset: ${currentOffset})...`);
      
      const result = await getEmailsAction(selectedAccount.id, { 
        limit: 50, 
        offset: currentOffset 
      });
      
      if (result.success && result.data?.emails) {
        const data = result.data;
        setEmails(prev => [...prev, ...data.emails]);
        setHasMore(data.hasMore || false);
        setCurrentOffset(prev => prev + 50);
        console.log(`✅ Loaded ${data.emails.length} more emails (total: ${emails.length + data.emails.length})`);
      }
    } catch (error) {
      console.error('❌ Error loading more emails:', error);
    } finally {
      setLoadingMore(false);
    }
  }

  const handleAccountChange = (account: SelectEmailAccount) => {
    setSelectedAccount(account);
    setSelectedEmail(null);
  };

  const handleAccountChangeById = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      handleAccountChange(account);
    }
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

  const handleRefresh = async () => {
    if (!selectedAccount) return;
    
    // Show sync progress modal
    setSyncProgressOpen(true);
    
    console.log('🚀 Starting background email sync...');
    console.log('💡 You can refresh the page - sync will continue!');
    
    // Trigger email sync WITHOUT await - runs in background!
    // The modal will poll for progress
    syncNylasEmailsAction(selectedAccount.id)
      .then((result) => {
        if (result.success) {
          console.log('✅ Sync completed! Reloading emails...');
          logInfo('Email sync completed successfully', {
            userId: userId || undefined,
            accountId: selectedAccount.id,
            syncedCount: result.syncedCount,
            skippedCount: result.skippedCount,
          });
          loadEmails();
          loadFolders();
          toast({
            title: 'Sync Complete',
            description: `Synced ${result.syncedCount} new emails, ${result.skippedCount} already synced`,
          });
        } else {
          console.error('❌ Sync failed:', result.error);
          logError('Email sync failed', new Error(result.error || 'Unknown sync error'), {
            userId: userId || undefined,
            accountId: selectedAccount.id,
          });
          toast({
            title: 'Sync Failed',
            description: result.error || 'Failed to sync emails',
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        console.error('❌ Sync error:', error);
        logError('Email sync exception', error instanceof Error ? error : new Error('Sync exception'), {
          userId: userId || undefined,
          accountId: selectedAccount.id,
        });
        toast({
          title: 'Sync Error',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: 'destructive',
        });
      });
    
    // Don't wait for sync - return immediately
    // Modal will show progress as it syncs in background
  };

  const handleDownloadAll = async () => {
    if (!selectedAccount) return;
    
    // Show sync progress modal
    setSyncProgressOpen(true);
    
    console.log('🚀 Starting full email sync...');
    
    // Trigger email sync in background
    syncNylasEmailsAction(selectedAccount.id)
      .then((result) => {
        console.log('✅ Full sync completed:', result);
        loadEmails();
        loadFolders();
      })
      .catch((error) => {
        console.error('❌ Sync error:', error);
      });
  };

  const handleSyncFolders = async () => {
    if (!selectedAccount) return;
    
    setFolderSyncing(true);
    try {
      const result = await syncNylasFoldersAction(selectedAccount.id);
      if (result.success) {
        toast({
          title: 'Folders Synced',
          description: `Successfully synced ${result.syncedCount} folders`,
        });
        await loadFolders();
      } else {
        toast({
          title: 'Sync Failed',
          description: result.error || 'Failed to sync folders',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Sync Error',
        description: 'An error occurred during folder sync',
        variant: 'destructive',
      });
    } finally {
      setFolderSyncing(false);
    }
  };

  // Calculate badge counts for Hey sidebar
  const unscreenedCount = emails.filter(e => e.screeningStatus === 'pending').length;
  const replyLaterCount = emails.filter(e => e.isReplyLater).length;
  const setAsideCount = emails.filter(e => e.isSetAside).length;

  // Render the appropriate view based on mode and selection
  const renderView = () => {
    // Focus mode overrides everything
    if (focusMode) {
      return (
        <FocusReplyMode
          emails={focusModeEmails}
          onClose={() => setFocusMode(false)}
          onComplete={() => {
            setFocusMode(false);
            setCurrentView('imbox');
            handleRefresh();
          }}
        />
      );
    }

    // Hey mode views
    if (emailMode === 'hey' || emailMode === 'hybrid') {
      switch (currentView) {
        case 'screener':
          return <ScreenerView onEmailsUpdated={loadEmails} />;
        
        case 'imbox':
          return (
            <ImboxView
              emails={emails}
              selectedEmail={selectedEmail}
              onEmailClick={handleEmailSelect}
              onRefresh={handleRefresh}
              activePopupEmailId={activePopupEmailId}
              onPopupOpen={setActivePopupEmailId}
              onPopupClose={() => setActivePopupEmailId(null)}
              onComposeWithDraft={handleOpenComposerWithDraft}
            />
          );
        
        case 'feed':
          return (
            <FeedView
              emails={emails}
              selectedEmail={selectedEmail}
              onEmailClick={handleEmailSelect}
              onRefresh={handleRefresh}
              activePopupEmailId={activePopupEmailId}
              onPopupOpen={setActivePopupEmailId}
              onPopupClose={() => setActivePopupEmailId(null)}
              onComposeWithDraft={handleOpenComposerWithDraft}
            />
          );
        
        case 'paper_trail':
          return (
            <PaperTrailView
              emails={emails}
              selectedEmail={selectedEmail}
              onEmailClick={handleEmailSelect}
              onRefresh={handleRefresh}
              activePopupEmailId={activePopupEmailId}
              onPopupOpen={setActivePopupEmailId}
              onPopupClose={() => setActivePopupEmailId(null)}
              onComposeWithDraft={handleOpenComposerWithDraft}
            />
          );
        
        case 'reply_later':
          return (
            <ReplyLaterStack
              onEmailClick={handleEmailSelect}
              onEnterFocusMode={(emails) => {
                setFocusModeEmails(emails);
                setFocusMode(true);
              }}
            />
          );
        
        case 'set_aside':
          return <SetAsideView onEmailClick={handleEmailSelect} />;
        
        default:
          // Fall through to traditional view below
          break;
      }
    }

    // Traditional view - show email viewer or card list
    if (selectedEmail) {
      const currentIndex = emails.findIndex(e => e.id === selectedEmail.id);
      return (
        <EmailViewer
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          emails={emails}
          currentIndex={currentIndex}
          onNavigate={handleEmailSelect}
          onCompose={handleOpenComposerWithDraft}
        />
      );
    }

    // In Hey/Hybrid mode, currentView might be a folder name (e.g., 'INBOX', 'SENT')
    // Use currentView as folder if we're in Hey mode, otherwise use selectedFolder
    const folderToDisplay = (emailMode === 'hey' || emailMode === 'hybrid') 
      ? currentView 
      : selectedFolder;

    return (
      <EmailCardList
        emails={emails}
        selectedEmail={selectedEmail}
        onEmailSelect={handleEmailSelect}
        loading={loading}
        folder={folderToDisplay}
        accountId={selectedAccount?.id}
        onComposeWithDraft={handleOpenComposerWithDraft}
        onLoadMore={loadMoreEmails}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />
    );
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
          <div className="text-center space-y-4 max-w-md px-4">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold">No Email Accounts Connected</h2>
            
            {accountError ? (
              <>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
                  <p className="text-destructive font-medium mb-2">Error Loading Accounts</p>
                  <p className="text-muted-foreground">{accountError}</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Retry attempt: {retryCount}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={handleRetryAccounts}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Retry
                  </button>
                  <button 
                    onClick={() => setShowAddDialog(true)}
                    className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                  >
                    Connect New Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Connect your email account to start managing your inbox with AI-powered intelligence.
                </p>
                <button 
                  onClick={() => setShowAddDialog(true)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Connect Email Account
                </button>
              </>
            )}
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
        onRefresh={handleRefresh}
        onCompose={() => setComposerOpen(true)}
      />

      {/* Main content: 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Hey Sidebar (or traditional if mode is traditional) */}
        <SectionErrorBoundary>
          {emailMode === 'hey' || emailMode === 'hybrid' ? (
            <HeySidebar
              selectedView={currentView}
              folders={folders}
              onViewChange={setCurrentView}
              accounts={accounts}
              selectedAccount={selectedAccount}
              onAccountChange={handleAccountChangeById}
              onAddAccount={() => setShowAddDialog(true)}
              emailMode={emailMode}
              unscreenedCount={unscreenedCount}
              replyLaterCount={replyLaterCount}
              setAsideCount={setAsideCount}
              onSyncReport={() => setShowSyncReport(true)}
              onDownloadAll={handleDownloadAll}
              onSyncFolders={handleSyncFolders}
              onSettings={() => setShowSettingsSlideOver(true)}
              calendarPath={calendarPath}
              contactsPath={contactsPath}
              folderSyncing={folderSyncing}
            />
          ) : (
            <FolderSidebar
              selectedFolder={selectedFolder}
              folders={folders}
              onFolderChange={handleFolderChange}
              accounts={accounts}
              selectedAccount={selectedAccount}
              onAccountChange={handleAccountChangeById}
              onAddAccount={() => setShowAddDialog(true)}
            />
          )}
        </SectionErrorBoundary>

        {/* Panel 2: Rendered view (cards, viewer, or Hey views) */}
        <div className="flex-1 overflow-hidden">
          <SectionErrorBoundary>
            {renderView()}
          </SectionErrorBoundary>
        </div>

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
            className="fixed right-4 bottom-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 px-4 py-3 z-40 group"
            title="Open AI Copilot"
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">Ask me anything</span>
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

      {/* Command Palette - Cmd+K */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={(view) => {
          setCurrentView(view);
          setCommandPaletteOpen(false);
        }}
        onAction={(action) => {
          if (action === 'compose') setComposerOpen(true);
          if (action === 'search') setSearchOpen(true);
          setCommandPaletteOpen(false);
        }}
        onSearch={(query) => {
          setSearchOpen(true);
          setCommandPaletteOpen(false);
        }}
      />

      {/* Instant Search - / key */}
      <InstantSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        emails={emails}
        onEmailSelect={(email) => {
          setSelectedEmail(email);
          setSearchOpen(false);
        }}
      />

      {/* Sync Progress Modal */}
      <SyncProgressModal
        open={syncProgressOpen}
        onOpenChange={setSyncProgressOpen}
        accountEmail={selectedAccount?.emailAddress || ''}
      />

      {/* First-time mode selection */}
      <EmailModeSettings
        open={showOnboarding}
        onOpenChange={(open) => {
          if (!open) completeOnboarding();
        }}
        currentMode={emailMode}
        onModeChange={(mode) => {
          setEmailMode(mode);
          completeOnboarding();
        }}
        isFirstTime
      />

      {/* Settings Slide Over */}
      {selectedAccount && (
        <SettingsSlideOver
          account={selectedAccount}
          folders={folders}
          open={showSettingsSlideOver}
          onClose={() => setShowSettingsSlideOver(false)}
          onUpdate={loadEmails}
        />
      )}

      {/* Sync Report Modal */}
      {selectedAccount && (
        <SyncReportModal
          open={showSyncReport}
          onOpenChange={setShowSyncReport}
          accountId={selectedAccount.id}
          accountEmail={selectedAccount.emailAddress}
        />
      )}

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

