/**
 * Nylas Email Server Actions
 * 
 * Server-side actions for managing Nylas email accounts and operations.
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  getNylasAuthUrl,
  listNylasMessages,
  getNylasMessage,
  sendNylasEmail,
  updateNylasMessage,
  deleteNylasMessage,
  listNylasFolders,
  searchNylasMessages,
  revokeNylasGrant,
  getNylasAccountInfo,
  listNylasThreads,
} from '@/lib/email-providers/nylas-client';
import { db } from '@/db/db';
import { emailAccountsTable, emailsTable, emailThreadsTable } from '@/db/schema/email-schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Get OAuth URL to connect a new email account
 */
export async function connectNylasAccountAction(
  provider: 'gmail' | 'microsoft' | 'imap',
  userEmail?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const authUrl = await getNylasAuthUrl(provider, userEmail);
    return { authUrl };
  } catch (error: any) {
    console.error('Error getting Nylas auth URL:', error);
    return { error: error.message || 'Failed to initiate connection' };
  }
}

/**
 * Sync emails from Nylas for a specific account
 * OPTIMIZED: Limits initial sync for faster loading
 */
export async function syncNylasEmailsAction(
  accountId: string,
  options?: {
    maxEmails?: number;
    skipClassification?: boolean;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Get the email account
    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.id, accountId),
    });

    if (!account) {
      return { error: 'Email account not found' };
    }

    if (account.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    if (!account.nylasGrantId) {
      return { error: 'Account not connected to Nylas' };
    }

    // Update sync status
    await db
      .update(emailAccountsTable)
      .set({ status: 'syncing' })
      .where(eq(emailAccountsTable.id, accountId));

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let pageToken: string | undefined = undefined;
    let totalFetched = 0;
    let pageNumber = 0;

    // Sync ALL emails (no limit) - will take 5-10 minutes for large accounts
    const maxEmails = options?.maxEmails || 999999; // Effectively unlimited
    const skipClassification = options?.skipClassification !== false; // Default: skip for speed

    console.log(`🔄 Starting FULL email sync for account:`, account.emailAddress);
    console.log(`📊 Syncing ALL emails (no limit), Skip classification: ${skipClassification}`);
    console.log(`⏱️  This may take 5-10 minutes for large accounts...`);

    // Initialize sync status tracking
    console.log('🔄 Importing updateSyncStatus...');
    const { updateSyncStatus } = await import('@/app/api/email/sync-status/route');
    
    console.log('📊 Initializing sync status for userId:', userId.substring(0, 10) + '...');
    updateSyncStatus(userId, {
      currentPage: 0,
      totalFetched: 0,
      synced: 0,
      skipped: 0,
      errors: 0,
      estimatedTotal: 1000,
      isComplete: false,
    });
    
    console.log('✅ Sync status initialized - modal should show progress now');

    // Batch size for database operations
    const BATCH_SIZE = 10; // Process 10 emails at a time for better performance
    let emailBatch: any[] = [];

    // Pagination loop - fetch pages until limit reached
    do {
      pageNumber++;
      
      // Update progress
      console.log(`📊 Updating sync status - Page ${pageNumber}, Fetched: ${totalFetched}, Synced: ${syncedCount}`);
      updateSyncStatus(userId, {
        currentPage: pageNumber,
        totalFetched,
        synced: syncedCount,
        skipped: skippedCount,
        errors: errorCount,
        estimatedTotal: Math.max(1000, totalFetched + 500), // Dynamic estimate
      });
      
      // Fetch messages from Nylas in batches of 50
      console.log(`🌐 Fetching page ${pageNumber} from Nylas...`);
      const messagesResponse = await listNylasMessages(account.nylasGrantId, {
        limit: 50,
        pageToken,
      });

      totalFetched += messagesResponse.data?.length || 0;

      console.log(`📧 Page ${pageNumber}: Fetched ${messagesResponse.data?.length} emails (Total: ${totalFetched})`);

    // Process each message
    for (const message of messagesResponse.data) {
      try {
        // Check if message already exists
        const existingEmail = await db.query.emailsTable.findFirst({
          where: eq(emailsTable.nylasMessageId, message.id),
        });

        if (existingEmail) {
          // Update existing email
          await db
            .update(emailsTable)
            .set({
              isRead: !message.unread,
              isStarred: message.starred || false,
              updatedAt: new Date(),
            })
            .where(eq(emailsTable.id, existingEmail.id));
          skippedCount++;
          continue;
        }

        console.log(`Processing email ${syncedCount + 1}:`, {
          id: message.id,
          subject: message.subject?.substring(0, 50),
          from: message.from?.[0]?.email,
          to: message.to?.[0]?.email,
          date: message.date
        });

        // Extract participants from message - only include valid email addresses
        const participants: { name?: string; email: string }[] = [];
        if (message.from && Array.isArray(message.from)) {
          message.from.forEach((p: any) => {
            if (p.email) {
              participants.push({ name: p.name || undefined, email: p.email });
            }
          });
        }
        if (message.to && Array.isArray(message.to)) {
          message.to.forEach((p: any) => {
            if (p.email) {
              participants.push({ name: p.name || undefined, email: p.email });
            }
          });
        }
        if (message.cc && Array.isArray(message.cc)) {
          message.cc.forEach((p: any) => {
            if (p.email) {
              participants.push({ name: p.name || undefined, email: p.email });
            }
          });
        }
        
        // Ensure we have at least one participant
        if (participants.length === 0) {
          console.warn('⚠️ No participants found for message:', message.id);
          participants.push({ email: account.emailAddress });
        }
        
        console.log(`Participants for email ${syncedCount + 1}:`, participants);

        // Create or get thread
        let threadId: string;
        if (message.threadId) {
          const existingThread = await db.query.emailThreadsTable.findFirst({
            where: eq(emailThreadsTable.nylasThreadId, message.threadId),
          });

          if (existingThread) {
            threadId = existingThread.id;
          } else {
            const messageDate = new Date((message.date || 0) * 1000);
            const [newThread] = await db.insert(emailThreadsTable).values({
              accountId: account.id,
              userId: account.userId,
              nylasThreadId: message.threadId,
              subject: message.subject || '(No subject)',
              snippet: message.snippet || '',
              participants,
              firstMessageAt: messageDate,
              lastMessageAt: messageDate,
            }).returning();
            threadId = newThread.id;
          }
        } else {
          const messageDate = new Date((message.date || 0) * 1000);
          const [newThread] = await db.insert(emailThreadsTable).values({
            accountId: account.id,
            userId: account.userId,
            nylasThreadId: message.id,
            subject: message.subject || '(No subject)',
            snippet: message.snippet || '',
            participants,
            firstMessageAt: messageDate,
            lastMessageAt: messageDate,
          }).returning();
          threadId = newThread.id;
        }

        // Parse email addresses
        const fromAddress = message.from && message.from[0] 
          ? { name: message.from[0].name, email: message.from[0].email }
          : { email: account.emailAddress };
        
        const toAddresses = message.to && Array.isArray(message.to)
          ? message.to.map((p: any) => ({ name: p.name, email: p.email }))
          : [{ email: account.emailAddress }];

        // Insert the email
        // Determine email flags based on Nylas folders
        const folders = message.folders || [];
        const folderNames = folders.map((f: string) => f.toLowerCase());
        
        // Check if this is a sent email
        const isSent = folderNames.some((f: string) => 
          f.includes('sent') || f.includes('sent items') || f.includes('sent mail')
        );
        
        // Check if this is a draft
        const isDraft = folderNames.some((f: string) => 
          f.includes('draft')
        );
        
        // Check if this is in trash
        const isTrash = folderNames.some((f: string) => 
          f.includes('trash') || f.includes('deleted') || f.includes('bin')
        );
        
        // Check if this is archived
        const isArchived = folderNames.some((f: string) => 
          f.includes('archive') || f.includes('all mail')
        );

        console.log(`📧 Email flags:`, {
          subject: message.subject?.substring(0, 50),
          folders: folderNames,
          isSent,
          isDraft,
          isTrash,
          isArchived
        });

        const [insertedEmail] = await db.insert(emailsTable).values({
          accountId: account.id,
          userId: account.userId,
          threadId,
          messageId: message.id,
          nylasMessageId: message.id,
          subject: message.subject || '(No subject)',
          snippet: message.snippet || '',
          fromAddress,
          toAddresses,
          ccAddresses: message.cc && Array.isArray(message.cc)
            ? message.cc.map((p: any) => ({ name: p.name, email: p.email }))
            : null,
          bccAddresses: message.bcc && Array.isArray(message.bcc)
            ? message.bcc.map((p: any) => ({ name: p.name, email: p.email }))
            : null,
          bodyHtml: message.body || '',
          bodyText: message.body || '',
          receivedAt: new Date((message.date || 0) * 1000),
          isRead: !message.unread,
          isStarred: message.starred || false,
          isSent, // ✅ Set sent flag
          isDraft, // ✅ Set draft flag
          isTrash, // ✅ Set trash flag
          isArchived, // ✅ Set archived flag
          hasAttachments: message.attachments && message.attachments.length > 0,
          status: 'delivered',
        }).returning();

        // Execute email rules for this email
        try {
          const { executeRulesForEmail } = await import('@/lib/email/rule-executor');
          await executeRulesForEmail(insertedEmail.id);
        } catch (ruleError) {
          console.error('Error executing rules:', ruleError);
          // Don't fail email sync if rules fail
        }

        // Auto-classify email for Hey mode (screening, Imbox/Feed/Paper Trail)
        // OPTIMIZATION: Skip classification during initial sync for speed
        // BUT: Always auto-classify emails older than 2 weeks
        const emailAge = Date.now() - new Date(insertedEmail.receivedAt).getTime();
        const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 14 days
        const isOlderThan2Weeks = emailAge > twoWeeksInMs;

        if (!skipClassification || isOlderThan2Weeks) {
          try {
            const { autoClassifyEmail } = await import('@/actions/screening-actions');
            await autoClassifyEmail(insertedEmail.id);
            
            if (isOlderThan2Weeks) {
              const daysOld = Math.round(emailAge / (24 * 60 * 60 * 1000));
              console.log(`📅 Auto-classified old email (${daysOld} days old) → Skipping Screener`);
            }
          } catch (classifyError) {
            console.error('Error auto-classifying email:', classifyError);
            // Don't fail email sync if classification fails
          }
        }

        syncedCount++;
        console.log(`✓ Email ${syncedCount} synced successfully`);
      
      } catch (emailError: any) {
        errorCount++;
        console.error(`✗ Failed to sync email ${syncedCount + 1}:`, {
          error: emailError.message,
          subject: message.subject,
          from: message.from?.[0]?.email
        });
      }
    }

      // Get next page token for pagination
      pageToken = messagesResponse.nextCursor;
      
      console.log(`📄 Page ${pageNumber} complete. Next page: ${pageToken ? 'Yes' : 'No'}`);
      console.log(`📊 Progress: ${totalFetched} emails fetched, ${syncedCount} synced, ${skippedCount} skipped, ${errorCount} errors`);
      
      // Continue fetching all pages until no more emails
    } while (pageToken);

    // Update sync status
    await db
      .update(emailAccountsTable)
      .set({
        status: 'active',
        lastSyncAt: new Date(),
      })
      .where(eq(emailAccountsTable.id, accountId));

    // Mark sync as complete
    updateSyncStatus(userId, {
      currentPage: pageNumber,
      totalFetched,
      synced: syncedCount,
      skipped: skippedCount,
      errors: errorCount,
      estimatedTotal: totalFetched,
      isComplete: true,
    });

    console.log('🎉 FULL SYNC COMPLETE:', {
      totalPages: pageNumber,
      totalFetched,
      synced: syncedCount,
      skipped: skippedCount,
      errors: errorCount,
      totalEmailsInDatabase: syncedCount + skippedCount
    });
    
    console.log(`✅ ${syncedCount} NEW emails synced, ${skippedCount} already existed`);

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    // Clear status after 30 seconds
    setTimeout(() => {
      const { clearSyncStatus } = require('@/app/api/email/sync-status/route');
      clearSyncStatus(userId);
    }, 30000);

    return { success: true, syncedCount, skippedCount, errorCount };
  } catch (error: any) {
    console.error('Error syncing Nylas emails:', error);
    
    // Update sync status to error
    await db
      .update(emailAccountsTable)
      .set({ status: 'error' })
      .where(eq(emailAccountsTable.id, accountId));

    return { error: error.message || 'Failed to sync emails' };
  }
}

/**
 * Send an email via Nylas
 */
export async function sendNylasEmailAction(data: {
  accountId: string;
  to: { name?: string; email: string }[];
  cc?: { name?: string; email: string }[];
  bcc?: { name?: string; email: string }[];
  subject: string;
  body: string;
  replyToMessageId?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.id, data.accountId),
    });

    if (!account || account.userId !== userId) {
      return { error: 'Email account not found' };
    }

    if (!account.nylasGrantId) {
      return { error: 'Account not connected to Nylas' };
    }

    const sentMessage = await sendNylasEmail(account.nylasGrantId, {
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      body: data.body,
      replyToMessageId: data.replyToMessageId,
      trackOpens: true,
      trackLinks: true,
    });

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true, messageId: sentMessage.data.id };
  } catch (error: any) {
    console.error('Error sending Nylas email:', error);
    return { error: error.message || 'Failed to send email' };
  }
}

/**
 * Mark email as read/unread
 */
export async function markNylasEmailReadAction(
  emailId: string,
  isRead: boolean
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { error: 'Email not found' };
    }

    if (!email.account.nylasGrantId || !email.nylasMessageId) {
      return { error: 'Email not synced with Nylas' };
    }

    await updateNylasMessage(
      email.account.nylasGrantId,
      email.nylasMessageId,
      { unread: !isRead }
    );

    await db
      .update(emailsTable)
      .set({ isRead, updatedAt: new Date() })
      .where(eq(emailsTable.id, emailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Error marking email as read:', error);
    return { error: error.message || 'Failed to update email' };
  }
}

/**
 * Star/unstar email
 */
export async function starNylasEmailAction(emailId: string, isStarred: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { error: 'Email not found' };
    }

    if (!email.account.nylasGrantId || !email.nylasMessageId) {
      return { error: 'Email not synced with Nylas' };
    }

    await updateNylasMessage(
      email.account.nylasGrantId,
      email.nylasMessageId,
      { starred: isStarred }
    );

    await db
      .update(emailsTable)
      .set({ isStarred, updatedAt: new Date() })
      .where(eq(emailsTable.id, emailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Error starring email:', error);
    return { error: error.message || 'Failed to update email' };
  }
}

/**
 * Delete email
 */
export async function deleteNylasEmailAction(emailId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const email = await db.query.emailsTable.findFirst({
      where: eq(emailsTable.id, emailId),
      with: { account: true },
    });

    if (!email || email.account.userId !== userId) {
      return { error: 'Email not found' };
    }

    if (email.account.nylasGrantId && email.nylasMessageId) {
      await deleteNylasMessage(email.account.nylasGrantId, email.nylasMessageId);
    }

    await db.delete(emailsTable).where(eq(emailsTable.id, emailId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting email:', error);
    return { error: error.message || 'Failed to delete email' };
  }
}

/**
 * Disconnect Nylas account
 */
export async function disconnectNylasAccountAction(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.id, accountId),
    });

    if (!account || account.userId !== userId) {
      return { error: 'Email account not found' };
    }

    if (account.nylasGrantId) {
      await revokeNylasGrant(account.nylasGrantId);
    }

    await db
      .update(emailAccountsTable)
      .set({
        status: 'inactive',
        nylasGrantId: null,
        updatedAt: new Date(),
      })
      .where(eq(emailAccountsTable.id, accountId));

    revalidatePath('/platform/emails');
    revalidatePath('/dashboard/emails');

    return { success: true };
  } catch (error: any) {
    console.error('Error disconnecting Nylas account:', error);
    return { error: error.message || 'Failed to disconnect account' };
  }
}

/**
 * Get emails for display
 */
export async function getNylasEmailsAction(accountId?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    let query = db.query.emailsTable.findMany({
      where: accountId 
        ? eq(emailsTable.accountId, accountId)
        : undefined,
      with: {
        account: true,
        thread: true,
      },
      orderBy: [desc(emailsTable.receivedAt)],
      limit: 50,
    });

    const emails = await query;

    // Filter by userId
    const userEmails = emails.filter(email => email.account.userId === userId);

    return { emails: userEmails };
  } catch (error: any) {
    console.error('Error getting emails:', error);
    return { error: error.message || 'Failed to get emails' };
  }
}

/**
 * Sync folders from Nylas for a specific account
 */
export async function syncNylasFoldersAction(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Get the email account
    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.id, accountId),
    });

    if (!account || account.userId !== userId || !account.nylasGrantId) {
      return { error: 'Account not found or not connected' };
    }

    // Import folder sync function
    const { listNylasFolders } = await import('@/lib/email-providers/nylas-client');
    
    // Fetch folders from Nylas
    const foldersResponse = await listNylasFolders(account.nylasGrantId);

    console.log('📁 Nylas Folders:', {
      count: foldersResponse.data?.length || 0,
      folders: foldersResponse.data?.map((f: any) => ({ id: f.id, name: f.name, type: f.attributes }))
    });

    // Import email folders table
    const { emailFoldersTable } = await import('@/db/schema/email-schema');
    
    // Store folders in database
    let syncedCount = 0;
    let updatedCount = 0;
    
    for (const folder of foldersResponse.data) {
      // Determine folder type
      const attributes = folder.attributes || [];
      let folderType = 'custom';
      let isSystemFolder = false;
      
      if (attributes.includes('\\Inbox')) {
        folderType = 'inbox';
        isSystemFolder = true;
      } else if (attributes.includes('\\Sent')) {
        folderType = 'sent';
        isSystemFolder = true;
      } else if (attributes.includes('\\Drafts')) {
        folderType = 'drafts';
        isSystemFolder = true;
      } else if (attributes.includes('\\Trash') || attributes.includes('\\Deleted')) {
        folderType = 'trash';
        isSystemFolder = true;
      } else if (attributes.includes('\\Junk') || attributes.includes('\\Spam')) {
        folderType = 'spam';
        isSystemFolder = true;
      } else if (attributes.includes('\\Archive')) {
        folderType = 'archive';
        isSystemFolder = true;
      }
      
      // Check if folder already exists
      const existingFolder = await db.query.emailFoldersTable.findFirst({
        where: eq(emailFoldersTable.nylasFolderId, folder.id),
      });
      
      if (existingFolder) {
        // Update existing folder
        await db
          .update(emailFoldersTable)
          .set({
            name: folder.name,
            displayName: folder.name,
            folderType,
            isSystemFolder,
            totalCount: folder.totalCount || 0,
            unreadCount: folder.unreadCount || 0,
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(emailFoldersTable.id, existingFolder.id));
        updatedCount++;
      } else {
        // Insert new folder
        await db.insert(emailFoldersTable).values({
          accountId: account.id,
          nylasFolderId: folder.id,
          name: folder.name,
          displayName: folder.name,
          folderType,
          isSystemFolder,
          totalCount: folder.totalCount || 0,
          unreadCount: folder.unreadCount || 0,
          lastSyncAt: new Date(),
        });
        syncedCount++;
      }
    }
    
    console.log('✅ Folders synced:', { 
      new: syncedCount, 
      updated: updatedCount,
      total: foldersResponse.data.length 
    });
    
    return { 
      success: true, 
      syncedCount,
      updatedCount,
      message: `Synced ${syncedCount} new folders, updated ${updatedCount} existing folders`
    };
  } catch (error: any) {
    console.error('Error syncing Nylas folders:', error);
    return { error: error.message || 'Failed to sync folders' };
  }
}

/**
 * Setup webhook for real-time email delivery
 */
export async function setupNylasWebhookAction(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Get the email account
    const account = await db.query.emailAccountsTable.findFirst({
      where: eq(emailAccountsTable.id, accountId),
    });

    if (!account || account.userId !== userId || !account.nylasGrantId) {
      return { error: 'Account not found or not connected' };
    }

    // Import webhook function
    const { createNylasWebhook } = await import('@/lib/email-providers/nylas-client');
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const webhookUrl = `${baseUrl}/api/webhooks/nylas`;

    // Create webhook for this account
    const webhook = await createNylasWebhook(webhookUrl, [
      'message.created',
      'message.updated', 
      'message.deleted',
      'thread.replied'
    ]);

    console.log('🔔 Webhook created:', {
      id: webhook.data.id,
      url: webhookUrl,
      triggers: webhook.data.triggerTypes
    });

    // Store webhook ID in account
    await db
      .update(emailAccountsTable)
      .set({ 
        webhookSubscriptionId: webhook.data.id,
        webhookExpiresAt: null, // Nylas webhooks don't expire
      })
      .where(eq(emailAccountsTable.id, accountId));

    return { 
      success: true, 
      webhookId: webhook.data.id,
      message: 'Real-time email delivery enabled! New emails will appear instantly.'
    };
  } catch (error: any) {
    console.error('Error setting up Nylas webhook:', error);
    return { error: error.message || 'Failed to setup webhook' };
  }
}

