"use client";

import { useOrganization } from "@/lib/organization-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function OrganizationSwitcher() {
  const { currentOrganization, organizations, setCurrentOrganization, isLoading } = useOrganization();

  if (isLoading || organizations.length === 0) {
    return null;
  }

  if (organizations.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
        <Building2 size={16} />
        <span className="font-medium">{currentOrganization?.name}</span>
      </div>
    );
  }

  return (
    <Select
      value={currentOrganization?.id}
      onValueChange={(value) => {
        const org = organizations.find((o) => o.id === value);
        if (org) {
          setCurrentOrganization(org);
          window.location.reload(); // Reload to fetch new org data
        }
      }}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <Building2 size={16} />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            <div className="flex flex-col">
              <span className="font-medium">{org.name}</span>
              <span className="text-xs text-gray-500 capitalize">{org.role}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}




