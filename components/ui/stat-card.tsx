import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({ icon: Icon, value, label, sublabel, iconColor = "text-cyan-600", className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <span className="text-3xl font-semibold">{value}</span>
      </div>
      <span className="text-xs uppercase tracking-wide text-neutral-500 text-center">
        {label}
        {sublabel && (
          <>
            <br />
            {sublabel}
          </>
        )}
      </span>
    </div>
  );
}

interface StatsGridProps {
  children: ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn("flex gap-14", className)}>
      {children}
    </div>
  );
}

export function StatsDivider() {
  return <div className="w-px bg-neutral-200" />;
}

