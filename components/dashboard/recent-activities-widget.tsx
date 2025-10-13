import { GradientCard, GradientCardHeader, GradientCardTitle, GradientCardDescription, GradientCardContent } from "@/components/ui/gradient-card";
import { ModernBadge } from "@/components/ui/modern-badge";
import { Button } from "@/components/ui/button";
import { SelectActivity } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { Phone, Mail, MessageSquare, StickyNote, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentActivitiesWidgetProps {
  activities: SelectActivity[];
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: MessageSquare,
  note: StickyNote,
  task: CheckCircle,
};

const activityColors = {
  call: "bg-blue-100 text-blue-700",
  email: "bg-purple-100 text-purple-700",
  meeting: "bg-green-100 text-green-700",
  note: "bg-yellow-100 text-yellow-700",
  task: "bg-orange-100 text-orange-700",
};

export function RecentActivitiesWidget({ activities }: RecentActivitiesWidgetProps) {
  if (activities.length === 0) {
    return (
      <GradientCard variant="violet">
        <GradientCardHeader>
          <GradientCardTitle className="text-xl">Recent Activities</GradientCardTitle>
          <GradientCardDescription>Your latest activity updates</GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <div className="text-center py-8 text-neutral-500">
            <p>No activities yet</p>
            <p className="text-sm mt-2">Activities will appear here as they are created</p>
          </div>
        </GradientCardContent>
      </GradientCard>
    );
  }

  return (
    <GradientCard variant="violet">
      <GradientCardHeader className="flex flex-row items-center justify-between">
        <div>
          <GradientCardTitle className="text-xl">Recent Activities</GradientCardTitle>
          <GradientCardDescription>Your latest activity updates</GradientCardDescription>
        </div>
        <Link href="/dashboard/activities">
          <Button variant="ghost" size="sm" className="rounded-full">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </GradientCardHeader>
      <GradientCardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => {
            const Icon = activityIcons[activity.type] || StickyNote;
            const colorClass = activityColors[activity.type] || activityColors.note;

            return (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-neutral-200 last:border-0">
                <div className={`p-2 rounded-xl ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.subject}</p>
                  {activity.description && (
                    <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <ModernBadge variant="neutral" className="text-xs">
                      {activity.type}
                    </ModernBadge>
                    <span className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                    {activity.completed && (
                      <ModernBadge variant="emerald" className="text-xs">
                        Completed
                      </ModernBadge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GradientCardContent>
    </GradientCard>
  );
}
