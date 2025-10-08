"use client";

// Updated: Fixed dropdown overflow and duplicate organizations
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronsUpDown, Check, Shield } from "lucide-react";
import { setCurrentViewAction, getCurrentViewAction } from "@/actions/view-switcher-actions";
import { useEffect } from "react";

export interface ViewSwitcherOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface ViewSwitcherProps {
  currentView: {
    type: "platform" | "organization";
    organizationId?: string;
    organizationName?: string;
    organizationSlug?: string;
  };
  availableOrganizations: ViewSwitcherOrganization[];
  isPlatformAdmin: boolean;
}

export function ViewSwitcher({
  currentView,
  availableOrganizations,
  isPlatformAdmin,
}: ViewSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localView, setLocalView] = useState(currentView);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalView(currentView);
  }, [currentView]);

  const handleSwitchView = async (type: "platform" | "organization", orgId?: string) => {
    if (!orgId && type === "organization") return;

    startTransition(async () => {
      try {
        // Set cookie to persist view across page refreshes
        await setCurrentViewAction(type, orgId);

        // Update local state immediately for responsive UI
        if (type === "platform") {
          setLocalView({ type: "platform" });
          router.push("/platform/dashboard");
        } else if (type === "organization" && orgId) {
          const org = availableOrganizations.find((o) => o.id === orgId);
          if (org) {
            setLocalView({
              type: "organization",
              organizationId: org.id,
              organizationName: org.name,
              organizationSlug: org.slug,
            });
            router.push("/dashboard");
          }
        }

        // Refresh the page to reload with new context
        router.refresh();
      } catch (error) {
        console.error("Error switching view:", error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[220px] justify-between"
          disabled={isPending}
        >
          <div className="flex items-center gap-2">
            {localView.type === "platform" ? (
              <>
                <Shield className="h-4 w-4" />
                <span>Platform Admin</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span className="truncate">{localView.organizationName}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-[220px] max-h-[400px] overflow-y-auto max-w-[calc(100vw-32px)]" 
        align="start" 
        side="bottom"
        sideOffset={8}
        collisionPadding={20}
        avoidCollisions={true}
      >
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Platform Admin View */}
        {isPlatformAdmin && (
          <>
            <DropdownMenuItem
              onClick={() => handleSwitchView("platform")}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Platform Admin</span>
              </div>
              {localView.type === "platform" && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
          </>
        )}

        {/* Organization Views */}
        {availableOrganizations.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-sm text-muted-foreground">
              No organizations available
            </span>
          </DropdownMenuItem>
        ) : (
          availableOrganizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitchView("organization", org.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{org.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="outline" className="text-xs capitalize">
                  {org.plan}
                </Badge>
                {localView.type === "organization" &&
                  localView.organizationId === org.id && (
                    <Check className="h-4 w-4 text-green-600 ml-1" />
                  )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
