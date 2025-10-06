/**
 * Reusable Error State Components
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showHome?: boolean;
}

/**
 * Generic error state component
 */
export function ErrorState({ 
  title = "Something went wrong",
  message = "We encountered an error while loading this page. Please try again.",
  showRetry = true,
  onRetry,
  showHome = false
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Empty state component (no data)
 */
interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-4">
      <div className="text-center max-w-md">
        {icon && (
          <div className="flex justify-center mb-4 opacity-50">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Permission denied error state
 */
export function PermissionDeniedError() {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to access this resource. Contact your administrator if you believe this is a mistake."
      showRetry={false}
      showHome={true}
    />
  );
}

/**
 * Not found error state
 */
export function NotFoundError({ resourceType = "resource" }: { resourceType?: string }) {
  return (
    <ErrorState
      title="Not Found"
      message={`The ${resourceType} you're looking for doesn't exist or has been deleted.`}
      showRetry={false}
      showHome={true}
    />
  );
}



