"use client";

import { ReactNode, useEffect } from "react";
import { Lock, Settings, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopilot } from "@/lib/ai-copilot-context";
import { AICopilot } from "@/components/ai-copilot";

interface BrowserFrameProps {
  children: ReactNode;
  url?: string;
  className?: string;
}

export function BrowserFrame({ children, url = "clientflow.app", className }: BrowserFrameProps) {
  const { isOpen, openCopilot, toggleCopilot } = useCopilot();

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCopilot();
      }
      if (e.key === 'Escape' && isOpen) {
        toggleCopilot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleCopilot]);

  return (
    <div className={cn("w-full h-full flex flex-col bg-neutral-100", className)}>
      {/* Browser Chrome */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 shadow-sm">
        {/* Top Bar with Traffic Lights and Controls */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Left: Traffic Lights + ClientFlow Branding */}
          <div className="flex items-center gap-4">
            {/* macOS Traffic Lights */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer" />
            </div>
            
            {/* ClientFlow Branding */}
            <div className="flex items-center gap-2 ml-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">CF</span>
              </div>
              <span className="font-bold text-neutral-900">ClientFlow</span>
            </div>
          </div>

          {/* Center: AI Co-Pilot Address Bar */}
          <div className="flex-1 max-w-3xl mx-4 relative">
            <button
              onClick={openCopilot}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-full transition-all text-left",
                isOpen
                  ? "bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-300"
                  : "bg-neutral-50 border border-neutral-200 hover:border-cyan-300 hover:bg-cyan-50/50"
              )}
            >
              <Sparkles className={cn(
                "w-4 h-4 flex-shrink-0",
                isOpen ? "text-cyan-600" : "text-neutral-400"
              )} />
              <span className={cn(
                "text-sm truncate flex-1",
                isOpen ? "text-cyan-900 font-medium" : "text-neutral-500"
              )}>
                Ask AI Co-Pilot anything...
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-200 text-xs text-neutral-600 font-mono">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            
            {/* AI Co-Pilot Panel */}
            <AICopilot app="clientflow" />
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600 hover:text-neutral-900">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600 hover:text-neutral-900">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-app-bg">
        {children}
      </div>
    </div>
  );
}

