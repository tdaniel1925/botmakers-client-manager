import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectActivity } from "@/db/schema";
import { Calendar, Mail, Phone, Users, FileText, CheckCircle2, Clock } from "lucide-react";

interface ActivityItemProps {
  activity: SelectActivity & { contactName?: string; dealTitle?: string };
  onComplete?: (activityId: string) => void;
  onEdit?: (activity: SelectActivity) => void;
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  task: CheckCircle2,
  note: FileText,
};

const activityColors = {
  call: "text-blue-600",
  email: "text-purple-600",
  meeting: "text-green-600",
  task: "text-orange-600",
  note: "text-gray-600",
};

export function ActivityItem({ activity, onComplete, onEdit }: ActivityItemProps) {
  const Icon = activityIcons[activity.type] || FileText;
  const iconColor = activityColors[activity.type] || "text-gray-600";
  
  const isOverdue = activity.dueDate && !activity.completed && new Date(activity.dueDate) < new Date();
  const isToday = activity.dueDate && new Date(activity.dueDate).toDateString() === new Date().toDateString();

  return (
    <Card className={`${activity.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Checkbox
              checked={activity.completed}
              onCheckedChange={() => onComplete?.(activity.id)}
              className="h-5 w-5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
                <h4 className={`font-medium ${activity.completed ? 'line-through' : ''}`}>
                  {activity.subject}
                </h4>
              </div>
              <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                {activity.type}
              </Badge>
            </div>

            {activity.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {activity.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {activity.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-blue-600 font-medium' : ''}`}>
                  <Clock className="h-3 w-3" />
                  {isOverdue && 'Overdue: '}
                  {isToday && 'Today: '}
                  {new Date(activity.dueDate).toLocaleString()}
                </div>
              )}
              
              {activity.contactName && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {activity.contactName}
                </div>
              )}
              
              {activity.dealTitle && (
                <Badge variant="secondary" className="text-xs">
                  {activity.dealTitle}
                </Badge>
              )}

              {activity.completed && activity.completedAt && (
                <Badge variant="default" className="text-xs bg-green-600">
                  Completed {new Date(activity.completedAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(activity)}
              className="flex-shrink-0"
            >
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



