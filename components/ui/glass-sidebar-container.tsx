/**
 * GlassSidebarContainer - Reusable glassmorphism sidebar wrapper
 * Provides consistent frosted glass effect for all sidebars
 */
"use client";

import { ReactNode } from "react";

export interface GlassSidebarContainerProps {
  children?: ReactNode;
  width?: string; // e.g., "w-64", "w-[220px]"
  className?: string;
}

export function GlassSidebarContainer({ 
  children, 
  width = "w-64",
  className = ""
}: GlassSidebarContainerProps) {
  return (
    <div className={`${width} bg-white/60 backdrop-blur-xl border-r border-white/40 flex flex-col relative overflow-hidden ${className}`}>
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none opacity-50" />
      
      {/* Edge highlights for 3D effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-80" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-80" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
}
