"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Shield, X } from "lucide-react";
import { setCurrentViewAction } from "@/actions/view-switcher-actions";
import { useEffect } from "react";

export interface BrowserTabsOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface BrowserTabsProps {
  currentView: {
    type: "platform" | "organization";
    organizationId?: string;
    organizationName?: string;
    organizationSlug?: string;
  };
  availableOrganizations: BrowserTabsOrganization[];
  isPlatformAdmin: boolean;
}

export function BrowserTabs({
  currentView,
  availableOrganizations,
  isPlatformAdmin,
}: BrowserTabsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localView, setLocalView] = useState(currentView);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalView(currentView);
  }, [currentView]);

  const handleSwitchTab = async (type: "platform" | "organization", orgId?: string) => {
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
        console.error("Error switching tab:", error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {/* Organization Tabs */}
      {availableOrganizations.map((org) => {
        const isActive = localView.type === "organization" && localView.organizationId === org.id;
        
        return (
          <button
            key={org.id}
            onClick={() => handleSwitchTab("organization", org.id)}
            disabled={isPending}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-t-xl border-t border-x transition-all
              ${isActive 
                ? "bg-app-bg border-neutral-200 text-neutral-900" 
                : "bg-white/50 border-transparent text-neutral-600 hover:bg-white/80 hover:text-neutral-900"
              }
              ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className={`w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 ${
              isActive 
                ? "bg-gradient-to-br from-cyan-600 to-teal-600" 
                : "bg-gradient-to-br from-neutral-400 to-neutral-500"
            }`}>
              <Building2 className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap max-w-[150px] truncate">
              {org.name}
            </span>
          </button>
        );
      })}

      {/* Platform Admin Tab */}
      {isPlatformAdmin && (
        <button
          onClick={() => handleSwitchTab("platform")}
          disabled={isPending}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-t-xl border-t border-x transition-all
            ${localView.type === "platform"
              ? "bg-app-bg border-neutral-200 text-neutral-900" 
              : "bg-white/50 border-transparent text-neutral-600 hover:bg-white/80 hover:text-neutral-900"
            }
            ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className={`w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 ${
            localView.type === "platform"
              ? "bg-gradient-to-br from-indigo-600 to-purple-600" 
              : "bg-gradient-to-br from-neutral-400 to-neutral-500"
          }`}>
            <Shield className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-sm font-medium whitespace-nowrap">
            Platform Admin
          </span>
        </button>
      )}
    </div>
  );
}

