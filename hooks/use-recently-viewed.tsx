import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export interface RecentlyViewedItem {
  id: string;
  type: "contact" | "deal" | "activity" | "project" | "campaign";
  title: string;
  subtitle?: string;
  url: string;
  timestamp: number;
}

const MAX_RECENT_ITEMS = 10;
const STORAGE_KEY = "clientflow_recently_viewed";

export function useRecentlyViewed() {
  const pathname = usePathname();
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  // Load recent items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[];
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter(item => item.timestamp > thirtyDaysAgo);
        setRecentItems(filtered);
      }
    } catch (error) {
      console.error("Error loading recently viewed items:", error);
    }
  }, []);

  const addRecentItem = (item: Omit<RecentlyViewedItem, "timestamp">) => {
    try {
      setRecentItems((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter((i) => i.url !== item.url);
        
        // Add new item at the beginning
        const newItems = [
          { ...item, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_RECENT_ITEMS);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        
        return newItems;
      });
    } catch (error) {
      console.error("Error adding recently viewed item:", error);
    }
  };

  const clearRecentItems = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentItems([]);
    } catch (error) {
      console.error("Error clearing recently viewed items:", error);
    }
  };

  return {
    recentItems,
    addRecentItem,
    clearRecentItems,
  };
}

