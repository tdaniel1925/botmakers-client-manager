import { getUserRole } from "@/db/queries/organizations-queries";

export type UserRole = "admin" | "manager" | "sales_rep";

export interface Permission {
  canViewAllContacts: boolean;
  canEditAllContacts: boolean;
  canDeleteAllContacts: boolean;
  canViewAllDeals: boolean;
  canEditAllDeals: boolean;
  canDeleteAllDeals: boolean;
  canViewAllActivities: boolean;
  canEditAllActivities: boolean;
  canDeleteAllActivities: boolean;
  canManageUsers: boolean;
  canManageOrganization: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canCustomizePipeline: boolean;
}

const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    canViewAllContacts: true,
    canEditAllContacts: true,
    canDeleteAllContacts: true,
    canViewAllDeals: true,
    canEditAllDeals: true,
    canDeleteAllDeals: true,
    canViewAllActivities: true,
    canEditAllActivities: true,
    canDeleteAllActivities: true,
    canManageUsers: true,
    canManageOrganization: true,
    canViewAnalytics: true,
    canExportData: true,
    canCustomizePipeline: true,
  },
  manager: {
    canViewAllContacts: true,
    canEditAllContacts: true,
    canDeleteAllContacts: false,
    canViewAllDeals: true,
    canEditAllDeals: true,
    canDeleteAllDeals: false,
    canViewAllActivities: true,
    canEditAllActivities: true,
    canDeleteAllActivities: false,
    canManageUsers: false,
    canManageOrganization: false,
    canViewAnalytics: true,
    canExportData: true,
    canCustomizePipeline: false,
  },
  sales_rep: {
    canViewAllContacts: false,
    canEditAllContacts: false,
    canDeleteAllContacts: false,
    canViewAllDeals: false,
    canEditAllDeals: false,
    canDeleteAllDeals: false,
    canViewAllActivities: false,
    canEditAllActivities: false,
    canDeleteAllActivities: false,
    canManageUsers: false,
    canManageOrganization: false,
    canViewAnalytics: false,
    canExportData: false,
    canCustomizePipeline: false,
  },
};

export function getPermissions(role: UserRole): Permission {
  return rolePermissions[role];
}

export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<{ role: UserRole; permissions: Permission } | null> {
  const userRole = await getUserRole(userId, organizationId);
  
  if (!userRole) {
    return null;
  }
  
  return {
    role: userRole.role as UserRole,
    permissions: getPermissions(userRole.role as UserRole),
  };
}

export function canAccessResource(
  userRole: UserRole,
  resourceOwnerId: string,
  userId: string
): boolean {
  const permissions = getPermissions(userRole);
  
  // Admins and managers can access all resources
  if (userRole === "admin" || userRole === "manager") {
    return true;
  }
  
  // Sales reps can only access their own resources
  return resourceOwnerId === userId;
}

export function canEditResource(
  userRole: UserRole,
  resourceOwnerId: string,
  userId: string
): boolean {
  const permissions = getPermissions(userRole);
  
  // Admins and managers can edit all resources
  if (userRole === "admin" || userRole === "manager") {
    return true;
  }
  
  // Sales reps can only edit their own resources
  return resourceOwnerId === userId;
}

export function canDeleteResource(
  userRole: UserRole,
  resourceOwnerId: string,
  userId: string
): boolean {
  // Only admins can delete any resource
  if (userRole === "admin") {
    return true;
  }
  
  // Others can only delete their own resources
  return resourceOwnerId === userId;
}

export function getRoleHierarchy(): UserRole[] {
  return ["admin", "manager", "sales_rep"];
}

export function isRoleHigherOrEqual(role1: UserRole, role2: UserRole): boolean {
  const hierarchy = getRoleHierarchy();
  return hierarchy.indexOf(role1) <= hierarchy.indexOf(role2);
}




