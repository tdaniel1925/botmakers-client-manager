/**
 * Sidebar component for the Template App
 * Provides primary navigation for the dashboard with a clean, modern UI
 * Features user avatar at the bottom and billing management option
 */
"use client";

import { Home, Settings, Database, Target, Users, Sparkles, CreditCard, LayoutDashboard, CheckSquare, BarChart3, Shield, FolderKanban, UserCircle, HelpCircle, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SelectProfile } from "@/db/schema/profiles-schema";
import { CreditUsageDisplay } from "@/components/credit-usage-display";
import UpgradePlanPopup from "@/components/upgrade-plan-popup";
import { GlassSidebarContainer } from "@/components/ui/glass-sidebar-container";
import { useState, useEffect, useCallback } from "react";
import { OrgSwitcherDropdown, OrgSwitcherOrganization } from "@/components/org-switcher-dropdown";
import { UserMenu } from "@/components/user-menu";

interface SidebarProps {
  profile: SelectProfile | null;
  userEmail?: string;
  whopMonthlyPlanId: string;
  whopYearlyPlanId: string;
  isPlatformAdmin?: boolean;
  currentView?: {
    type: "platform" | "organization";
    organizationId?: string;
    organizationName?: string;
    organizationSlug?: string;
  };
  availableOrganizations?: OrgSwitcherOrganization[];
}

export default function Sidebar({ 
  profile, 
  userEmail, 
  whopMonthlyPlanId, 
  whopYearlyPlanId, 
  isPlatformAdmin,
  currentView,
  availableOrganizations = []
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  
  const isActive = (path: string) => pathname === path;
  
  // Check if user has reached credit limit
  const hasReachedCreditLimit = useCallback(() => {
    if (!profile) return false;
    const usedCredits = profile.usedCredits ?? 0;
    const usageCredits = profile.usageCredits ?? 0;
    return usedCredits >= usageCredits;
  }, [profile]);

  // Plan IDs now come from props, not environment variables
  
  const navSections = [
    {
      items: [
        { href: "/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
        { href: "/dashboard/projects", icon: <FolderKanban size={16} />, label: "Projects" },
      ]
    },
    {
      label: "CRM",
      items: [
        { href: "/dashboard/emails", icon: <Mail size={16} />, label: "Emails" },
        { href: "/dashboard/contacts", icon: <UserCircle size={16} />, label: "Contacts" },
        { href: "/dashboard/deals", icon: <Target size={16} />, label: "Deals" },
        { href: "/dashboard/activities", icon: <CheckSquare size={16} />, label: "Activities" },
      ]
    },
    {
      label: "Insights",
      items: [
        { href: "/dashboard/analytics", icon: <BarChart3 size={16} />, label: "Analytics" },
        { href: "/dashboard/targets", icon: <Target size={16} />, label: "Targets" },
      ]
    },
    {
      label: "Management",
      items: [
        { href: "/dashboard/team", icon: <Users size={16} />, label: "Team" },
        { href: "/dashboard/data-source", icon: <Database size={16} />, label: "Data Source" },
        { href: "/dashboard/settings", icon: <Settings size={16} />, label: "Settings" },
        { href: "/dashboard/help", icon: <HelpCircle size={16} />, label: "Help" },
      ]
    },
  ];

  // Handle navigation item click
  const handleNavItemClick = (e: React.MouseEvent, href: string) => {
    if (hasReachedCreditLimit()) {
      e.preventDefault(); // Prevent navigation
      setShowUpgradePopup(true); // Show upgrade popup
    } else {
      // Normal navigation handled by Link component
    }
  };
  
  // Show upgrade popup on initial load if needed
  useEffect(() => {
    if (hasReachedCreditLimit()) {
      setShowUpgradePopup(true);
    }
  }, [profile, hasReachedCreditLimit]);

  return (
    <>
      {profile && (
        <UpgradePlanPopup 
          profile={profile} 
          monthlyPlanId={whopMonthlyPlanId} 
          yearlyPlanId={whopYearlyPlanId}
          isOpen={showUpgradePopup}
          onOpenChange={setShowUpgradePopup}
        />
      )}
      
      <GlassSidebarContainer width="w-[60px] md:w-[220px]" className="justify-between py-3">
        {/* Animated glassmorphism overlay - unique to dashboard */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none z-0"
          animate={{ 
            opacity: [0.4, 0.6, 0.4],
            background: [
              "linear-gradient(to bottom, rgba(var(--primary), 0.03), transparent, rgba(var(--primary), 0.03))",
              "linear-gradient(to bottom, rgba(var(--primary), 0.05), transparent, rgba(var(--primary), 0.05))",
              "linear-gradient(to bottom, rgba(var(--primary), 0.03), transparent, rgba(var(--primary), 0.03))"
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Organization Switcher */}
        {currentView && (
          <div className="px-3 mb-4 relative z-10">
            <OrgSwitcherDropdown
              currentView={currentView}
              availableOrganizations={availableOrganizations}
              isPlatformAdmin={isPlatformAdmin ?? false}
            />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 relative z-10 overflow-y-auto">
          <div className="space-y-4">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {/* Section Label */}
                {section.label && (
                  <div className="hidden md:block px-3 mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {section.label}
                    </span>
                  </div>
                )}
                
                {/* Section Items */}
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className="block"
                      onClick={(e) => handleNavItemClick(e, item.href)}
                    >
                      <motion.div 
                        className={`flex items-center py-2 px-3 rounded-full cursor-pointer transition-all ${
                          isActive(item.href) 
                            ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm" 
                            : "text-neutral-600 hover:bg-neutral-100/80 hover:shadow-md"
                        }`}
                        whileHover={{ 
                          scale: 1.03, 
                          x: 4,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-center">
                          {item.icon}
                        </div>
                        <span className={`ml-3 hidden md:block text-sm font-medium`}>
                          {item.label}
                        </span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
                
                {/* Section Divider */}
                {sectionIndex < navSections.length - 1 && (
                  <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-3" />
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom Section - User Menu */}
        <div className="mt-auto pt-4 relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3" />
          <div className="px-3">
            <UserMenu
              profile={profile}
              userEmail={userEmail}
              whopMonthlyPlanId={whopMonthlyPlanId}
              whopYearlyPlanId={whopYearlyPlanId}
            />
          </div>
        </div>
      </GlassSidebarContainer>
    </>
  );
} 