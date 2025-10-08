/**
 * Campaign Transaction Manager
 * Handles rollback of resources on campaign creation failure
 */

import { getVoiceProvider } from "@/lib/voice-providers/provider-factory";
import { deleteWebhook } from "@/db/queries/calls-queries";

export interface TransactionResource {
  type: "webhook" | "agent" | "phoneNumber";
  id: string;
  provider?: string;
  data?: any;
}

export class CampaignTransaction {
  private resources: TransactionResource[] = [];
  private completed: boolean = false;

  /**
   * Track a resource that should be cleaned up on failure
   */
  track(resource: TransactionResource): void {
    if (this.completed) {
      throw new Error("Cannot track resources after transaction is completed");
    }
    this.resources.push(resource);
    console.log(`[Transaction] Tracked ${resource.type}:`, resource.id);
  }

  /**
   * Mark transaction as successful (no rollback needed)
   */
  complete(): void {
    this.completed = true;
    console.log(`[Transaction] Completed successfully. ${this.resources.length} resources tracked.`);
  }

  /**
   * Rollback all tracked resources in reverse order
   */
  async rollback(): Promise<void> {
    if (this.completed) {
      console.log("[Transaction] Already completed, skipping rollback");
      return;
    }

    console.log(`[Transaction] Rolling back ${this.resources.length} resources...`);
    const errors: Error[] = [];

    // Rollback in reverse order (LIFO)
    for (let i = this.resources.length - 1; i >= 0; i--) {
      const resource = this.resources[i];
      try {
        await this.cleanupResource(resource);
        console.log(`[Transaction] ✓ Cleaned up ${resource.type}: ${resource.id}`);
      } catch (error: any) {
        console.error(`[Transaction] ✗ Failed to cleanup ${resource.type}: ${resource.id}`, error);
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      console.warn(
        `[Transaction] Rollback completed with ${errors.length} errors. Some resources may need manual cleanup.`
      );
    } else {
      console.log("[Transaction] Rollback completed successfully");
    }
  }

  /**
   * Clean up a single resource
   */
  private async cleanupResource(resource: TransactionResource): Promise<void> {
    switch (resource.type) {
      case "webhook":
        await deleteWebhook(resource.id);
        break;

      case "agent":
        if (!resource.provider) {
          throw new Error("Provider required for agent cleanup");
        }
        const provider = getVoiceProvider(resource.provider as any);
        await provider.deleteAgent(resource.id);
        break;

      case "phoneNumber":
        if (!resource.provider) {
          throw new Error("Provider required for phone number cleanup");
        }
        const phoneProvider = getVoiceProvider(resource.provider as any);
        await phoneProvider.releasePhoneNumber(resource.id);
        break;

      default:
        console.warn(`[Transaction] Unknown resource type: ${(resource as any).type}`);
    }
  }

  /**
   * Get list of tracked resources (for debugging)
   */
  getTrackedResources(): TransactionResource[] {
    return [...this.resources];
  }
}

/**
 * Execute a function within a transaction context
 * Automatically rolls back on error
 */
export async function withTransaction<T>(
  fn: (transaction: CampaignTransaction) => Promise<T>
): Promise<T> {
  const transaction = new CampaignTransaction();

  try {
    const result = await fn(transaction);
    transaction.complete();
    return result;
  } catch (error) {
    console.error("[Transaction] Error occurred, rolling back...", error);
    await transaction.rollback();
    throw error;
  }
}
