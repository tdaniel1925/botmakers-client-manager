import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : Icon ? (
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
      ) : null}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      
      <div className="flex items-center gap-3">
        {action && (
          <Button onClick={action.onClick}>
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function FilteredEmptyState({
  onClearFilters,
  resourceName = "results",
}: {
  onClearFilters: () => void;
  resourceName?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <svg
          className="h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No {resourceName} found</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        We couldn't find any {resourceName} matching your search criteria. Try adjusting your filters or search terms.
      </p>
      
      <Button variant="outline" onClick={onClearFilters}>
        Clear all filters
      </Button>
    </div>
  );
}

