"use client";

import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardContent } from "@/components/ui/gradient-card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  FolderKanban, 
  Phone,
  Clock,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const typeIcons = {
  contact: Users,
  deal: DollarSign,
  activity: Calendar,
  project: FolderKanban,
  campaign: Phone,
};

const typeColors = {
  contact: "text-blue-600 bg-blue-50",
  deal: "text-green-600 bg-green-50",
  activity: "text-purple-600 bg-purple-50",
  project: "text-orange-600 bg-orange-50",
  campaign: "text-indigo-600 bg-indigo-50",
};

export function RecentlyViewed() {
  const { recentItems, clearRecentItems } = useRecentlyViewed();

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <GradientCard variant="teal">
      <GradientCardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <GradientCardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Viewed
          </GradientCardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentItems}
            className="h-7 text-xs rounded-full"
          >
            Clear
          </Button>
        </div>
      </GradientCardHeader>
      <GradientCardContent className="pt-0">
        <div className="space-y-1">
          {recentItems.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <Link
                key={item.url}
                href={item.url}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/50 transition-colors group"
              >
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0",
                  typeColors[item.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-teal-600">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-neutral-500 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </GradientCardContent>
    </GradientCard>
  );
}

export function RecentlyViewedCompact() {
  const { recentItems } = useRecentlyViewed();

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
        Recent
      </h3>
      <div className="space-y-1">
        {recentItems.slice(0, 5).map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <Link
              key={item.url}
              href={item.url}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors group"
            >
              <Icon className={cn("h-4 w-4", typeColors[item.type].split(' ')[0])} />
              <span className="text-sm text-gray-700 truncate group-hover:text-gray-900">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

