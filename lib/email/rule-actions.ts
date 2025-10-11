/**
 * Rule Action Execution
 * Executes actions on emails when rules match
 */

import { db } from '@/db/db';
import { emailsTable } from '@/db/schema/email-schema';
import { eq } from 'drizzle-orm';

export interface RuleAction {
  type: 'move_to_folder' | 'mark_as_read' | 'mark_as_starred' | 'mark_as_important' | 
        'delete' | 'forward' | 'auto_reply' | 'apply_label' | 'block_sender' | 
        'run_ai_task';
  value?: string | boolean | any;
}

/**
 * Execute a single action on an email
 */
export async function executeAction(emailId: string, action: RuleAction): Promise<boolean> {
  try {
    const { type, value } = action;

    switch (type) {
      case 'mark_as_read':
        await db
          .update(emailsTable)
          .set({ isRead: true, updatedAt: new Date() })
          .where(eq(emailsTable.id, emailId));
        return true;

      case 'mark_as_starred':
        await db
          .update(emailsTable)
          .set({ isStarred: true, updatedAt: new Date() })
          .where(eq(emailsTable.id, emailId));
        return true;

      case 'mark_as_important':
        await db
          .update(emailsTable)
          .set({ isImportant: true, updatedAt: new Date() })
          .where(eq(emailsTable.id, emailId));
        return true;

      case 'move_to_folder':
        if (typeof value === 'string') {
          // Map folder name to flags
          const updates: any = { updatedAt: new Date() };
          
          switch (value.toLowerCase()) {
            case 'archive':
              updates.isArchived = true;
              break;
            case 'trash':
              updates.isTrash = true;
              break;
            case 'spam':
              updates.isSpam = true;
              break;
            default:
              updates.folderName = value;
          }

          await db
            .update(emailsTable)
            .set(updates)
            .where(eq(emailsTable.id, emailId));
        }
        return true;

      case 'delete':
        await db
          .update(emailsTable)
          .set({ isTrash: true, updatedAt: new Date() })
          .where(eq(emailsTable.id, emailId));
        return true;

      case 'apply_label':
        if (typeof value === 'string') {
          // Get current labels
          const email = await db.query.emailsTable.findFirst({
            where: eq(emailsTable.id, emailId),
          });

          if (email) {
            const currentLabels = Array.isArray(email.labelIds) ? email.labelIds : [];
            if (!currentLabels.includes(value)) {
              await db
                .update(emailsTable)
                .set({ 
                  labelIds: [...currentLabels, value],
                  updatedAt: new Date()
                })
                .where(eq(emailsTable.id, emailId));
            }
          }
        }
        return true;

      case 'forward':
        // TODO: Implement email forwarding via Nylas API
        console.log(`Forward action not yet implemented for email ${emailId} to ${value}`);
        return false;

      case 'auto_reply':
        // TODO: Implement auto-reply via Nylas API
        console.log(`Auto-reply action not yet implemented for email ${emailId}`);
        return false;

      case 'block_sender':
        // TODO: Implement sender blocking (add to blocked_senders table)
        console.log(`Block sender action not yet implemented for email ${emailId}`);
        return false;

      case 'run_ai_task':
        // TODO: Implement AI task execution (categorize, extract, summarize)
        console.log(`AI task action not yet implemented for email ${emailId}: ${value}`);
        return false;

      default:
        console.warn(`Unknown action type: ${type}`);
        return false;
    }
  } catch (error) {
    console.error(`Error executing action ${action.type} on email ${emailId}:`, error);
    return false;
  }
}

/**
 * Execute multiple actions on an email
 */
export async function executeActions(emailId: string, actions: RuleAction[]): Promise<{ 
  total: number;
  successful: number;
  failed: number;
}> {
  const results = await Promise.all(
    actions.map(action => executeAction(emailId, action))
  );

  return {
    total: results.length,
    successful: results.filter(r => r).length,
    failed: results.filter(r => !r).length,
  };
}


