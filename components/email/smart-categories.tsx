/**
 * Smart Categories Component
 * AI-powered email categorization and filtering
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Star, Users, Tag, Bell, Newspaper, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getCategoryStatsAction,
  categorizeAllEmailsAction,
  scoreAllThreadsAction,
} from '@/actions/email-thread-management-actions';

interface CategoryStats {
  category: string;
  count: number;
}

interface SmartCategoriesProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CATEGORY_CONFIG = {
  important: {
    label: 'Important',
    icon: Star,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-900',
  },
  social: {
    label: 'Social',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-900',
  },
  promotions: {
    label: 'Promotions',
    icon: Tag,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-900',
  },
  updates: {
    label: 'Updates',
    icon: Bell,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-900',
  },
  newsletters: {
    label: 'Newsletters',
    icon: Newspaper,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-900',
  },
};

export function SmartCategories({ selectedCategory, onCategoryChange }: SmartCategoriesProps) {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorizing, setCategorizing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const result = await getCategoryStatsAction();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading category stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCategorizeAll() {
    if (!confirm('This will categorize all uncategorized emails. Continue?')) {
      return;
    }

    try {
      setCategorizing(true);
      const [catResult, scoreResult] = await Promise.all([
        categorizeAllEmailsAction(),
        scoreAllThreadsAction(),
      ]);

      if (catResult.success && scoreResult.success) {
        alert(
          `Successfully categorized ${catResult.categorizedCount} emails and scored ${scoreResult.scoredCount} threads!`
        );
        loadStats();
      } else {
        alert('Failed to categorize emails. Please try again.');
      }
    } catch (error) {
      console.error('Error categorizing:', error);
      alert('An error occurred while categorizing emails.');
    } finally {
      setCategorizing(false);
    }
  }

  const getCategoryCount = (category: string): number => {
    const stat = stats.find(s => s.category === category);
    return stat?.count || 0;
  };

  return (
    <div className="border-b bg-muted/20 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Smart Categories</span>
        </div>
        <Button
          onClick={handleCategorizeAll}
          size="sm"
          variant="outline"
          disabled={categorizing || loading}
          className="text-xs"
        >
          {categorizing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              Auto-Categorize All
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* All filter */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-background hover:bg-muted border'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>All</span>
          </button>

          {/* Category buttons */}
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = getCategoryCount(key);
            const isSelected = selectedCategory === key;

            if (count === 0 && !isSelected) {
              return null; // Don't show categories with no emails
            }

            return (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? `${config.bgColor} ${config.color} ${config.borderColor} border shadow-sm`
                    : 'bg-background hover:bg-muted border'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? config.color : 'text-muted-foreground'}`} />
                <span>{config.label}</span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/50 dark:bg-black/20'
                      : 'bg-muted'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {stats.length === 0 && !loading && (
        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          <span>Click "Auto-Categorize All" to enable AI-powered email sorting</span>
        </div>
      )}
    </div>
  );
}



