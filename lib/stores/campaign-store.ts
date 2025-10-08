/**
 * Campaign Store - Zustand store for voice campaign state management
 * Handles optimistic updates and automatic refetching
 */

import { create } from 'zustand';
import type { SelectVoiceCampaign } from '@/db/schema';
import { getCampaignsForProjectAction } from '@/actions/voice-campaign-actions';

interface CampaignStore {
  // State
  campaigns: SelectVoiceCampaign[];
  loading: boolean;
  lastFetch: number | null;
  projectId: string | null;
  
  // Actions
  setCampaigns: (campaigns: SelectVoiceCampaign[]) => void;
  addCampaign: (campaign: SelectVoiceCampaign) => void;
  updateCampaign: (id: string, updates: Partial<SelectVoiceCampaign>) => void;
  deleteCampaign: (id: string) => void;
  fetchCampaigns: (projectId: string, force?: boolean) => Promise<void>;
  
  // Optimistic updates with rollback
  optimisticUpdate: (
    id: string,
    updates: Partial<SelectVoiceCampaign>,
    action: () => Promise<any>
  ) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const STALE_TIME = 30000; // 30 seconds

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  // Initial state
  campaigns: [],
  loading: false,
  lastFetch: null,
  projectId: null,
  
  // Set campaigns
  setCampaigns: (campaigns) => set({ 
    campaigns, 
    lastFetch: Date.now() 
  }),
  
  // Add single campaign
  addCampaign: (campaign) => set((state) => ({
    campaigns: [campaign, ...state.campaigns],
  })),
  
  // Update campaign
  updateCampaign: (id, updates) => set((state) => ({
    campaigns: state.campaigns.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
  })),
  
  // Delete campaign
  deleteCampaign: (id) => set((state) => ({
    campaigns: state.campaigns.filter((c) => c.id !== id),
  })),
  
  // Fetch campaigns with caching
  fetchCampaigns: async (projectId, force = false) => {
    const state = get();
    
    // Skip if not stale and not forced
    if (
      !force &&
      state.projectId === projectId &&
      state.lastFetch &&
      Date.now() - state.lastFetch < STALE_TIME
    ) {
      return;
    }
    
    set({ loading: true, projectId });
    
    try {
      const result = await getCampaignsForProjectAction(projectId);
      if (result.campaigns) {
        set({ 
          campaigns: result.campaigns, 
          lastFetch: Date.now(),
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('[Campaign Store] Fetch error:', error);
      set({ loading: false });
    }
  },
  
  // Optimistic update with automatic rollback on error
  optimisticUpdate: async (id, updates, action) => {
    const state = get();
    const originalCampaign = state.campaigns.find((c) => c.id === id);
    
    if (!originalCampaign) {
      throw new Error('Campaign not found');
    }
    
    // Apply optimistic update immediately
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    
    try {
      // Execute the actual action
      await action();
      // Success - optimistic update is now confirmed
    } catch (error) {
      // Rollback to original state
      set((state) => ({
        campaigns: state.campaigns.map((c) =>
          c.id === id ? originalCampaign : c
        ),
      }));
      throw error;
    }
  },
  
  // Reset store
  reset: () => set({
    campaigns: [],
    loading: false,
    lastFetch: null,
    projectId: null,
  }),
}));
