/**
 * Provider Health Check
 * Check status of voice providers
 */

export interface ProviderHealth {
  provider: string;
  status: "operational" | "degraded" | "down" | "unknown";
  lastChecked: Date;
  message?: string;
  statusPageUrl: string;
}

const PROVIDER_STATUS_PAGES: Record<string, string> = {
  vapi: "https://status.vapi.ai",
  autocalls: "https://status.autocalls.ai",
  synthflow: "https://status.synthflow.ai",
  retell: "https://status.retellai.com",
};

/**
 * Check provider health status
 * Note: This is a mock implementation. In production, you would:
 * 1. Call actual provider status API endpoints
 * 2. Cache results for 5-10 minutes
 * 3. Use a background job to keep status fresh
 */
export async function checkProviderHealth(provider: string): Promise<ProviderHealth> {
  try {
    // Mock implementation - always return operational
    // In production, call provider status API
    return {
      provider,
      status: "operational",
      lastChecked: new Date(),
      statusPageUrl: PROVIDER_STATUS_PAGES[provider] || "#",
    };
  } catch (error) {
    console.error(`[Health Check] Error checking ${provider}:`, error);
    return {
      provider,
      status: "unknown",
      lastChecked: new Date(),
      message: "Could not fetch status",
      statusPageUrl: PROVIDER_STATUS_PAGES[provider] || "#",
    };
  }
}

/**
 * Check all providers
 */
export async function checkAllProviders(): Promise<Record<string, ProviderHealth>> {
  const providers = Object.keys(PROVIDER_STATUS_PAGES);
  const results = await Promise.all(
    providers.map(async (provider) => {
      const health = await checkProviderHealth(provider);
      return [provider, health];
    })
  );

  return Object.fromEntries(results);
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: ProviderHealth["status"]): string {
  switch (status) {
    case "operational":
      return "text-green-500";
    case "degraded":
      return "text-yellow-500";
    case "down":
      return "text-red-500";
    case "unknown":
    default:
      return "text-gray-400";
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: ProviderHealth["status"]): string {
  switch (status) {
    case "operational":
      return "All Systems Operational";
    case "degraded":
      return "Degraded Performance";
    case "down":
      return "Service Outage";
    case "unknown":
    default:
      return "Status Unknown";
  }
}
