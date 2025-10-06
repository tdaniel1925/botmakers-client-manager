/**
 * Project Notes Timeline Component
 * Displays progress notes in chronological timeline
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectNote {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

interface ProjectNotesTimelineProps {
  notes: ProjectNote[];
  isPlatformAdmin?: boolean;
  onAddNoteClick?: () => void;
}

export function ProjectNotesTimeline({
  notes,
  isPlatformAdmin = false,
  onAddNoteClick,
}: ProjectNotesTimelineProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle>Progress Notes</CardTitle>
          <Badge variant="secondary">{notes.length}</Badge>
        </div>
        {isPlatformAdmin && onAddNoteClick && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddNoteClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No progress notes yet
            </p>
            {isPlatformAdmin && (
              <p className="text-gray-400 text-xs mt-2">
                Add notes to track important updates and milestones
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div
                key={note.id}
                className={`relative pl-8 pb-4 ${
                  index !== notes.length - 1 ? "border-l-2 border-gray-200" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white -translate-x-[9px]"></div>

                {/* Note content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Platform Admin
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
