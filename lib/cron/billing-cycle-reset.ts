// Billing Cycle Reset & Invoice Generation
// This script should be run daily (e.g., via cron job or scheduled task)
// It handles billing period transitions, usage resets, and invoice generation

import {
  getSubscriptionsDueForReset,
  resetUsageCycle,
  getUsageForPeriod,
  createInvoice,
  getPlanById,
} from "@/db/queries/billing-queries";
import { getPaymentProvider } from "@/lib/payment-providers/provider-factory";

interface CycleResetResult {
  subscriptionsProcessed: number;
  invoicesGenerated: number;
  errors: number;
  errorDetails: Array<{ subscriptionId: string; error: string }>;
}

/**
 * Process billing cycle resets and generate invoices
 * Run this daily to check for subscriptions due for renewal
 */
export async function processBillingCycles(): Promise<CycleResetResult> {
  console.log("🔄 Starting billing cycle reset process...\n");
  
  const result: CycleResetResult = {
    subscriptionsProcessed: 0,
    invoicesGenerated: 0,
    errors: 0,
    errorDetails: [],
  };
  
  try {
    // Get all subscriptions that have reached their period end
    const subscriptionsDue = await getSubscriptionsDueForReset();
    
    console.log(`📊 Found ${subscriptionsDue.length} subscriptions due for renewal\n`);
    
    for (const subscription of subscriptionsDue) {
      result.subscriptionsProcessed++;
      
      try {
        console.log(`Processing subscription ${subscription.id}...`);
        
        // Get plan details
        const plan = await getPlanById(subscription.planId);
        if (!plan) {
          throw new Error("Plan not found");
        }
        
        // Get usage records for the period
        const usageRecords = await getUsageForPeriod(
          subscription.organizationId,
          subscription.currentPeriodStart,
          subscription.currentPeriodEnd
        );
        
        // Calculate totals
        const minutesUsed = subscription.minutesUsedThisCycle;
        const overageMinutes = subscription.overageMinutesThisCycle;
        const overageCost = subscription.overageCostThisCycle;
        const subscriptionAmount = plan.monthlyPrice;
        const totalAmount = subscriptionAmount + overageCost;
        
        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${subscription.organizationId.slice(0, 8)}`;
        
        // Create invoice record
        await createInvoice({
          organizationId: subscription.organizationId,
          subscriptionId: subscription.id,
          invoiceNumber,
          subscriptionAmount,
          usageAmount: overageCost,
          subtotal: totalAmount,
          taxAmount: 0,
          totalAmount,
          minutesIncluded: subscription.minutesIncludedThisCycle,
          minutesUsed,
          overageMinutes,
          paymentProvider: subscription.paymentProvider,
          status: "open",
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        });
        
        result.invoicesGenerated++;
        console.log(`  ✅ Generated invoice: ${invoiceNumber} ($${(totalAmount / 100).toFixed(2)})`);
        
        // Report overage usage to payment provider if any
        if (overageMinutes > 0 && subscription.externalSubscriptionId) {
          try {
            const provider = getPaymentProvider(subscription.paymentProvider as any);
            await provider.reportMeteredUsage({
              subscriptionId: subscription.externalSubscriptionId,
              quantity: overageMinutes,
              timestamp: subscription.currentPeriodEnd,
              idempotencyKey: `${subscription.id}-${subscription.currentPeriodEnd.getTime()}`,
            });
            console.log(`  💳 Reported ${overageMinutes} overage minutes to ${subscription.paymentProvider}`);
          } catch (providerError) {
            console.error(`  ⚠️  Failed to report usage to provider:`, providerError);
            // Don't fail the whole process
          }
        }
        
        // Reset usage for new cycle
        const newPeriodStart = new Date(subscription.currentPeriodEnd);
        const newPeriodEnd = new Date(newPeriodStart);
        newPeriodEnd.setDate(newPeriodEnd.getDate() + 30); // 30-day cycle
        
        await resetUsageCycle(subscription.id, newPeriodStart, newPeriodEnd);
        
        console.log(`  🔄 Reset usage cycle: ${newPeriodStart.toISOString()} → ${newPeriodEnd.toISOString()}`);
        console.log(`  📊 Previous cycle: ${minutesUsed}/${subscription.minutesIncludedThisCycle} minutes (${overageMinutes} overage)\n`);
      } catch (error) {
        console.error(`  ❌ Error processing subscription ${subscription.id}:`, error);
        result.errors++;
        result.errorDetails.push({
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    
    // Summary
    console.log("=" .repeat(60));
    console.log("📊 Billing Cycle Reset Complete!");
    console.log("=".repeat(60));
    console.log(`Subscriptions processed: ${result.subscriptionsProcessed}`);
    console.log(`Invoices generated: ${result.invoicesGenerated}`);
    console.log(`Errors: ${result.errors}`);
    
    if (result.errorDetails.length > 0) {
      console.log("\n❌ Error Details:");
      result.errorDetails.forEach((err) => {
        console.log(`  - Subscription ${err.subscriptionId}: ${err.error}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error("\n❌ Fatal error during billing cycle reset:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  processBillingCycles()
    .then((result) => {
      console.log("\n✅ Done!");
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Billing cycle reset failed:", error);
      process.exit(1);
    });
}

/**
 * Check for subscriptions expiring in the next 7 days
 * This can be used to send reminder emails
 */
export async function getSubscriptionsExpiringWord() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  // This would need a custom query
  // For now, return empty array
  return [];
}
