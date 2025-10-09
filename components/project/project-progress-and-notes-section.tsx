/**
 * Project Progress and Notes Section
 * Client component wrapper for progress meter and notes timeline
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectProgressMeter } from "./project-progress-meter";
import { ProjectNotesTimeline } from "./project-notes-timeline";
import { AddProjectNoteDialog } from "./add-project-note-dialog";
import { OverrideProgressDialog } from "./override-progress-dialog";

interface ProjectProgressAndNotesSectionProps {
  projectId: string;
  progressData: {
    displayProgress: number;
    autoCalculated: number;
    manual: number | null;
    isManualOverride: boolean;
    taskStats: {
      total: number;
      completed: number;
      inProgress: number;
      todo: number;
    };
  };
  notes: Array<{
    id: string;
    projectId: string;
    userId: string;
    content: string;
    createdAt: Date;
  }>;
  isPlatformAdmin?: boolean;
}

export function ProjectProgressAndNotesSection({
  projectId,
  progressData,
  notes,
  isPlatformAdmin = false,
}: ProjectProgressAndNotesSectionProps) {
  const router = useRouter();
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [overrideProgressDialogOpen, setOverrideProgressDialogOpen] = useState(false);

  const handleNoteAdded = () => {
    // Refresh the page to show new note
    router.refresh();
  };

  const handleProgressUpdated = () => {
    // Refresh the page to show updated progress
    router.refresh();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Meter */}
        <ProjectProgressMeter
          projectId={projectId}
          displayProgress={progressData.displayProgress}
          autoCalculated={progressData.autoCalculated}
          isManualOverride={progressData.isManualOverride}
          taskStats={progressData.taskStats}
          isPlatformAdmin={isPlatformAdmin}
          onOverrideClick={() => setOverrideProgressDialogOpen(true)}
        />

        {/* Notes Timeline */}
        <ProjectNotesTimeline
          notes={notes}
          isPlatformAdmin={isPlatformAdmin}
          onAddNoteClick={() => setAddNoteDialogOpen(true)}
        />
      </div>

      {/* Dialogs */}
      {isPlatformAdmin && (
        <>
          <AddProjectNoteDialog
            projectId={projectId}
            open={addNoteDialogOpen}
            onOpenChange={setAddNoteDialogOpen}
            onNoteAdded={handleNoteAdded}
          />

          <OverrideProgressDialog
            projectId={projectId}
            currentProgress={progressData.displayProgress}
            autoCalculatedProgress={progressData.autoCalculated}
            isManualOverride={progressData.isManualOverride}
            open={overrideProgressDialogOpen}
            onOpenChange={setOverrideProgressDialogOpen}
            onProgressUpdated={handleProgressUpdated}
          />
        </>
      )}
    </>
  );
}
