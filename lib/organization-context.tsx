"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SelectOrganization, SelectUserRole } from "@/db/schema";
import { getUserOrganizationsAction, getUserRoleAction } from "@/actions/organizations-actions";

interface OrganizationContextType {
  currentOrganization: (SelectOrganization & { role: string }) | null;
  organizations: (SelectOrganization & { role: string })[];
  userRole: SelectUserRole | null;
  isLoading: boolean;
  organizationId: string | null; // Convenience property
  setCurrentOrganization: (org: SelectOrganization & { role: string }) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<(SelectOrganization & { role: string })[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<(SelectOrganization & { role: string }) | null>(null);
  const [userRole, setUserRole] = useState<SelectUserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrganizations = async () => {
    setIsLoading(true);
    const result = await getUserOrganizationsAction();
    
    if (result.isSuccess && result.data) {
      setOrganizations(result.data);
      
      // Set current organization if not set
      if (!currentOrganization && result.data.length > 0) {
        const savedOrgId = localStorage.getItem("currentOrganizationId");
        const org = savedOrgId 
          ? result.data.find(o => o.id === savedOrgId) || result.data[0]
          : result.data[0];
        
        setCurrentOrganization(org);
        localStorage.setItem("currentOrganizationId", org.id);
        
        // Fetch user role for current organization
        const roleResult = await getUserRoleAction(org.id);
        if (roleResult.isSuccess && roleResult.data) {
          setUserRole(roleResult.data);
        }
      }
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    refreshOrganizations();
  }, []);

  const handleSetCurrentOrganization = async (org: SelectOrganization & { role: string }) => {
    setCurrentOrganization(org);
    localStorage.setItem("currentOrganizationId", org.id);
    
    // Fetch user role for new organization
    const roleResult = await getUserRoleAction(org.id);
    if (roleResult.isSuccess && roleResult.data) {
      setUserRole(roleResult.data);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        userRole,
        isLoading,
        organizationId: currentOrganization?.id || null,
        setCurrentOrganization: handleSetCurrentOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}

// Alias for convenience
export const useOrganizationContext = useOrganization;




