import { Badge } from "@/components/ui/badge";
import { Shield, Users, User } from "lucide-react";

interface RoleBadgeProps {
  role: "admin" | "manager" | "sales_rep";
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const roleConfig = {
    admin: {
      label: "Admin",
      variant: "default" as const,
      icon: Shield,
      className: "bg-purple-600 text-white hover:bg-purple-700",
    },
    manager: {
      label: "Manager",
      variant: "secondary" as const,
      icon: Users,
      className: "bg-blue-600 text-white hover:bg-blue-700",
    },
    sales_rep: {
      label: "Sales Rep",
      variant: "outline" as const,
      icon: User,
      className: "bg-gray-600 text-white hover:bg-gray-700",
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}>
      <Icon size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
      {config.label}
    </Badge>
  );
}




