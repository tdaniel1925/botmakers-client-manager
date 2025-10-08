"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  LineChart, 
  MessageSquare, 
  Settings, 
  FolderKanban, 
  CheckCircle, 
  HelpCircle, 
  FileText, 
  Activity,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

interface NavSection {
  name: string;
  icon: any;
  items: NavItem[];
  defaultOpen?: boolean;
}

export function CompactAdminNav() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["core"]));

  const toggleSection = (sectionName: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionName)) {
      newOpenSections.delete(sectionName);
    } else {
      newOpenSections.add(sectionName);
    }
    setOpenSections(newOpenSections);
  };

  const isActive = (href: string) => pathname === href;
  const isSectionActive = (items: NavItem[]) => 
    items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"));

  // Core items (always visible, no submenu)
  const coreItems: NavItem[] = [
    { name: "Dashboard", href: "/platform/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/platform/organizations", icon: Building2 },
    { name: "Projects", href: "/platform/projects", icon: FolderKanban },
  ];

  // Grouped items into submenus
  const sections: NavSection[] = [
    {
      name: "System",
      icon: Activity,
      items: [
        { name: "Analytics", href: "/platform/analytics", icon: LineChart },
        { name: "System Health", href: "/platform/system-health", icon: Activity },
        { name: "Onboarding", href: "/platform/onboarding", icon: CheckCircle },
      ]
    },
    {
      name: "Resources",
      icon: FileText,
      items: [
        { name: "Support", href: "/platform/support", icon: MessageSquare },
        { name: "Templates", href: "/platform/templates", icon: FileText },
        { name: "Help", href: "/platform/help", icon: HelpCircle },
      ]
    }
  ];

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {/* Core Items - Always visible */}
      {coreItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
            isActive(item.href)
              ? "bg-blue-100 text-blue-900 font-medium shadow-sm"
              : "text-gray-700 hover:bg-white/50 hover:shadow-sm"
          )}
        >
          <item.icon size={20} />
          <span>{item.name}</span>
        </Link>
      ))}

      {/* Collapsible Sections */}
      {sections.map((section) => {
        const isOpen = openSections.has(section.name);
        const hasActiveItem = isSectionActive(section.items);

        return (
          <div key={section.name} className="space-y-1">
            {/* Section Header - Clickable */}
            <button
              onClick={() => toggleSection(section.name)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                hasActiveItem && !isOpen
                  ? "bg-blue-50 text-blue-900 font-medium"
                  : "text-gray-700 hover:bg-white/50"
              )}
            >
              <div className="flex items-center gap-3">
                <section.icon size={20} />
                <span className="font-medium">{section.name}</span>
              </div>
              {isOpen ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>

            {/* Section Items - Collapsible */}
            {isOpen && (
              <div className="ml-6 space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-900 font-medium shadow-sm"
                        : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                    )}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Settings - Always at bottom */}
      <div className="pt-2 mt-2 border-t border-white/40">
        <Link
          href="/platform/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
            isActive("/platform/settings")
              ? "bg-blue-100 text-blue-900 font-medium shadow-sm"
              : "text-gray-700 hover:bg-white/50 hover:shadow-sm"
          )}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
}

