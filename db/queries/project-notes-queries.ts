/**
 * Project Notes Queries
 * Database queries for managing project progress notes
 */

import { db } from "@/db/db";
import { projectNotesTable, InsertProjectNote, SelectProjectNote } from "@/db/schema/projects-schema";
import { eq, desc } from "drizzle-orm";

/**
 * Create a new project note
 */
export async function createProjectNote(
  projectId: string,
  userId: string,
  content: string
): Promise<SelectProjectNote> {
  const [note] = await db
    .insert(projectNotesTable)
    .values({
      projectId,
      userId,
      content,
    })
    .returning();

  return note;
}

/**
 * Get all notes for a project (ordered newest first)
 */
export async function getProjectNotes(projectId: string): Promise<SelectProjectNote[]> {
  const notes = await db
    .select()
    .from(projectNotesTable)
    .where(eq(projectNotesTable.projectId, projectId))
    .orderBy(desc(projectNotesTable.createdAt));

  return notes;
}

/**
 * Get a single note by ID
 */
export async function getProjectNoteById(noteId: string): Promise<SelectProjectNote | undefined> {
  const [note] = await db
    .select()
    .from(projectNotesTable)
    .where(eq(projectNotesTable.id, noteId))
    .limit(1);

  return note;
}

/**
 * Delete a project note
 */
export async function deleteProjectNote(noteId: string): Promise<void> {
  await db
    .delete(projectNotesTable)
    .where(eq(projectNotesTable.id, noteId));
}

/**
 * Get note count for a project
 */
export async function getProjectNoteCount(projectId: string): Promise<number> {
  const notes = await db
    .select()
    .from(projectNotesTable)
    .where(eq(projectNotesTable.projectId, projectId));

  return notes.length;
}
