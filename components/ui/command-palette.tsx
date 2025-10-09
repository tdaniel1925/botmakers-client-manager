"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users, 
  DollarSign, 
  Calendar, 
  FolderKanban,
  Phone,
  Settings,
  Home,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
  category?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands?: Command[];
}

export function CommandPalette({ open, onOpenChange, commands: customCommands = [] }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Default commands
  const defaultCommands: Command[] = [
    {
      id: "home",
      label: "Go to Dashboard",
      icon: <Home className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard");
        onOpenChange(false);
      },
      keywords: ["home", "dashboard"],
      category: "Navigation"
    },
    {
      id: "contacts",
      label: "Go to Contacts",
      icon: <Users className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard/contacts");
        onOpenChange(false);
      },
      keywords: ["contacts", "people", "leads"],
      category: "Navigation"
    },
    {
      id: "deals",
      label: "Go to Deals",
      icon: <DollarSign className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard/deals");
        onOpenChange(false);
      },
      keywords: ["deals", "pipeline", "sales"],
      category: "Navigation"
    },
    {
      id: "activities",
      label: "Go to Activities",
      icon: <Calendar className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard/activities");
        onOpenChange(false);
      },
      keywords: ["activities", "tasks", "calendar"],
      category: "Navigation"
    },
    {
      id: "projects",
      label: "Go to Projects",
      icon: <FolderKanban className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard/projects");
        onOpenChange(false);
      },
      keywords: ["projects"],
      category: "Navigation"
    },
    {
      id: "campaigns",
      label: "Go to Voice Campaigns",
      icon: <Phone className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard/voice-campaigns");
        onOpenChange(false);
      },
      keywords: ["campaigns", "voice", "calls"],
      category: "Navigation"
    },
    {
      id: "settings",
      label: "Go to Settings",
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard/settings");
        onOpenChange(false);
      },
      keywords: ["settings", "preferences"],
      category: "Navigation"
    },
  ];

  const allCommands = [...defaultCommands, ...customCommands];

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands;

    const searchLower = search.toLowerCase();
    return allCommands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(searchLower);
      const descMatch = cmd.description?.toLowerCase().includes(searchLower);
      const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower));
      return labelMatch || descMatch || keywordMatch;
    });
  }, [search, allCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      const category = cmd.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedIndex];
        if (selectedCommand) {
          selectedCommand.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl gap-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            autoFocus
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No commands found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </div>
                {commands.map((cmd, idx) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                        globalIndex === selectedIndex
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      )}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      {cmd.icon && (
                        <div className="text-gray-600">{cmd.icon}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

