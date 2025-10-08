/**
 * Wizard Progress Storage - Auto-save and resume wizard state
 * Uses localStorage to persist wizard progress across sessions
 */

import type { CampaignSetupAnswers } from "@/types/voice-campaign-types";

export interface WizardProgress {
  projectId: string;
  provider: "vapi" | "autocalls" | "synthflow" | "retell" | null;
  currentStep: "provider" | "questions" | "generating" | "testing";
  answers: Partial<CampaignSetupAnswers>;
  timestamp: number;
  version: string; // For schema migrations
}

const WIZARD_STORAGE_KEY = "voice_campaign_wizard_progress";
const STORAGE_VERSION = "1.0";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Save wizard progress to localStorage
 */
export function saveWizardProgress(
  projectId: string,
  provider: "vapi" | "autocalls" | "synthflow" | "retell" | null,
  currentStep: "provider" | "questions" | "generating" | "testing",
  answers: Partial<CampaignSetupAnswers>
): void {
  if (typeof window === "undefined") return; // SSR safety

  try {
    const progress: WizardProgress = {
      projectId,
      provider,
      currentStep,
      answers,
      timestamp: Date.now(),
      version: STORAGE_VERSION,
    };

    // Store with project ID as key suffix for multi-project support
    const storageKey = `${WIZARD_STORAGE_KEY}_${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(progress));
    
    console.log("[Wizard Storage] Progress saved", { projectId, currentStep });
  } catch (error) {
    console.error("[Wizard Storage] Failed to save progress:", error);
    // Fail silently - don't interrupt wizard flow
  }
}

/**
 * Load wizard progress from localStorage
 * Returns null if no progress found or if expired
 */
export function loadWizardProgress(projectId: string): WizardProgress | null {
  if (typeof window === "undefined") return null; // SSR safety

  try {
    const storageKey = `${WIZARD_STORAGE_KEY}_${projectId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return null;
    }

    const progress: WizardProgress = JSON.parse(stored);
    
    // Validate version
    if (progress.version !== STORAGE_VERSION) {
      console.warn("[Wizard Storage] Version mismatch, clearing old progress");
      clearWizardProgress(projectId);
      return null;
    }
    
    // Check if expired
    const age = Date.now() - progress.timestamp;
    if (age > MAX_AGE_MS) {
      console.log("[Wizard Storage] Progress expired, clearing");
      clearWizardProgress(projectId);
      return null;
    }
    
    // Validate project ID matches
    if (progress.projectId !== projectId) {
      console.warn("[Wizard Storage] Project ID mismatch");
      return null;
    }
    
    console.log("[Wizard Storage] Progress loaded", { projectId, currentStep: progress.currentStep });
    return progress;
  } catch (error) {
    console.error("[Wizard Storage] Failed to load progress:", error);
    return null;
  }
}

/**
 * Clear wizard progress from localStorage
 */
export function clearWizardProgress(projectId: string): void {
  if (typeof window === "undefined") return; // SSR safety

  try {
    const storageKey = `${WIZARD_STORAGE_KEY}_${projectId}`;
    localStorage.removeItem(storageKey);
    console.log("[Wizard Storage] Progress cleared", { projectId });
  } catch (error) {
    console.error("[Wizard Storage] Failed to clear progress:", error);
  }
}

/**
 * Check if wizard progress exists
 */
export function hasWizardProgress(projectId: string): boolean {
  return loadWizardProgress(projectId) !== null;
}

/**
 * Get formatted age of saved progress
 */
export function getProgressAge(projectId: string): string | null {
  const progress = loadWizardProgress(projectId);
  if (!progress) return null;

  const ageMs = Date.now() - progress.timestamp;
  const ageMinutes = Math.floor(ageMs / (60 * 1000));
  const ageHours = Math.floor(ageMinutes / 60);
  const ageDays = Math.floor(ageHours / 24);

  if (ageDays > 0) {
    return `${ageDays} day${ageDays > 1 ? "s" : ""} ago`;
  } else if (ageHours > 0) {
    return `${ageHours} hour${ageHours > 1 ? "s" : ""} ago`;
  } else if (ageMinutes > 0) {
    return `${ageMinutes} minute${ageMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
}

/**
 * Clean up old progress entries (call on app startup or periodically)
 */
export function cleanupExpiredProgress(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    const wizardKeys = keys.filter((key) => key.startsWith(WIZARD_STORAGE_KEY));
    
    let cleanedCount = 0;
    wizardKeys.forEach((key) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const progress: WizardProgress = JSON.parse(stored);
          const age = Date.now() - progress.timestamp;
          
          if (age > MAX_AGE_MS || progress.version !== STORAGE_VERSION) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        // Invalid JSON, remove it
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`[Wizard Storage] Cleaned up ${cleanedCount} expired progress entries`);
    }
  } catch (error) {
    console.error("[Wizard Storage] Failed to cleanup:", error);
  }
}
