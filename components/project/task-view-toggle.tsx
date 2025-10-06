/**
 * Task View Toggle Component
 * Toggle between Kanban and List views
 */

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";

interface TaskViewToggleProps {
  view: "kanban" | "list";
  onViewChange: (view: "kanban" | "list") => void;
}

export function TaskViewToggle({ view, onViewChange }: TaskViewToggleProps) {
  return (
    <Tabs value={view} onValueChange={(v) => onViewChange(v as "kanban" | "list")}>
      <TabsList>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Kanban
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          List
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
