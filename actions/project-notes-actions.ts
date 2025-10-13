/**
 * Project Notes Server Actions
 * Actions for platform admins to manage project progress notes
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { ActionResult } from "@/types";
import { isPlatformAdmin } from "@/lib/platform-admin";
import {
  createProjectNote,
  getProjectNotes,
  getProjectNoteById,
  deleteProjectNote,
} from "@/db/queries/project-notes-queries";
import { getProjectById } from "@/db/queries/projects-queries";
import { SelectProjectNote } from "@/db/schema/projects-schema";
import { logOrganizationChange } from "@/lib/audit-logger";

/**
 * Add a progress note to a project (Platform Admin only)
 */
export async function addProjectNoteAction(
  projectId: string,
  content: string
): Promise<ActionResult<SelectProjectNote>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized. Platform admin access required." };
    }

    // Validate inputs
    if (!content || content.trim().length === 0) {
      return { isSuccess: false, message: "Note content is required." };
    }

    if (content.length > 2000) {
      return { isSuccess: false, message: "Note content must be 2000 characters or less." };
    }

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return { isSuccess: false, message: "Project not found." };
    }

    // Create the note
    const note = await createProjectNote(projectId, userId, content.trim());

    // Log action
    await logOrganizationChange(
      'create',
      project.organizationId,
      {
        action: 'project.note_added',
        projectId,
        noteId: note.id,
        contentLength: content.length,
      }
    );

    return {
      isSuccess: true,
      message: "Progress note added successfully.",
      data: note,
    };
  } catch (error) {
    console.error("Error adding project note:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to add progress note.",
    };
  }
}

/**
 * Get all progress notes for a project
 */
export async function getProjectNotesAction(
  projectId: string
): Promise<ActionResult<SelectProjectNote[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized." };
    }

    // Verify project exists and user has access
    const project = await getProjectById(projectId);
    if (!project) {
      return { isSuccess: false, message: "Project not found." };
    }

    // Get all notes
    const notes = await getProjectNotes(projectId);

    return {
      isSuccess: true,
      message: "Project notes retrieved successfully.",
      data: notes,
    };
  } catch (error) {
    console.error("Error fetching project notes:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to fetch progress notes.",
    };
  }
}

/**
 * Delete a progress note (Platform Admin only)
 */
export async function deleteProjectNoteAction(
  noteId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId || !(await isPlatformAdmin())) {
      return { isSuccess: false, message: "Unauthorized. Platform admin access required." };
    }

    // Verify note exists
    const note = await getProjectNoteById(noteId);
    if (!note) {
      return { isSuccess: false, message: "Note not found." };
    }

    // Get project for logging
    const project = await getProjectById(note.projectId);

    // Delete the note
    await deleteProjectNote(noteId);

    // Log action
    if (project) {
      await logOrganizationChange(
        'delete',
        project.organizationId,
        {
          action: 'project.note_deleted',
          projectId: note.projectId,
          noteId,
        }
      );
    }

    return {
      isSuccess: true,
      message: "Progress note deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting project note:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to delete progress note.",
    };
  }
}
