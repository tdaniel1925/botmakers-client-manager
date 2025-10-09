import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type GradientVariant = "violet" | "teal" | "amber" | "indigo" | "emerald" | "rose" | "cyan" | "none";

interface GradientCardProps {
  children: ReactNode;
  variant?: GradientVariant;
  className?: string;
  hover?: boolean;
}

const gradientClasses: Record<GradientVariant, string> = {
  violet: "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100",
  teal: "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100",
  amber: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100",
  indigo: "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100",
  emerald: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100",
  rose: "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100",
  cyan: "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-100",
  none: "bg-white border-neutral-200",
};

export function GradientCard({ children, variant = "none", className, hover = true }: GradientCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border shadow-sm p-6",
        gradientClasses[variant],
        hover && "transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GradientCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-6", className)}>{children}</div>;
}

export function GradientCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-2xl font-semibold text-neutral-900 mb-2", className)}>{children}</h2>;
}

export function GradientCardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-neutral-600", className)}>{children}</p>;
}

export function GradientCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

export function GradientCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-6 flex items-center justify-between", className)}>{children}</div>;
}

