import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type BadgeVariant = 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "neutral"
  | "emerald"
  | "rose"
  | "amber"
  | "violet"
  | "teal"
  | "indigo";

interface ModernBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const badgeClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-cyan-100 text-cyan-700",
  neutral: "bg-neutral-100 text-neutral-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  teal: "bg-teal-100 text-teal-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

const dotClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-500",
  info: "bg-cyan-400",
  neutral: "bg-neutral-400",
  emerald: "bg-emerald-400",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  teal: "bg-teal-500",
  indigo: "bg-indigo-500",
};

export function ModernBadge({ children, variant = "neutral", className, dot = false }: ModernBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium",
        badgeClasses[variant],
        className
      )}
    >
      {dot && <span className={cn("w-2 h-2 rounded-full", dotClasses[variant])} />}
      {children}
    </span>
  );
}

