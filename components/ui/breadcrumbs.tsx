import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, showHome = true, className }: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: "Home", href: "/dashboard", icon: <Home className="h-3.5 w-3.5" /> }, ...items]
    : items;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-600", className)} aria-label="Breadcrumb">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        return (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />}
            {isLast ? (
              <span className="flex items-center gap-1.5 font-medium text-gray-900">
                {item.icon}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

