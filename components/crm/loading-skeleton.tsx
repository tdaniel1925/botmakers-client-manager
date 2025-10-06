/**
 * Reusable Loading Skeleton Components
 */
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Dashboard metrics loading skeleton
 */
export function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Table loading skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[300px]" />
            <Skeleton className="h-3 w-full max-w-[200px]" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Kanban board loading skeleton
 */
export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <Card key={j} className="p-4">
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-3 w-32" />
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

/**
 * Contact detail page loading skeleton
 */
export function ContactDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b pb-3 last:border-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Analytics charts loading skeleton
 */
export function AnalyticsChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Activity calendar loading skeleton
 */
export function ActivityCalendarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



