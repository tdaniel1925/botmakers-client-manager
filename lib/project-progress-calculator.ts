/**
 * Project Progress Calculator
 * Utilities for calculating and managing project progress
 */

import { SelectProject } from "@/db/schema/projects-schema";

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
}

export interface ProgressData {
  autoCalculated: number;
  manual: number | null;
  displayProgress: number;
  isManualOverride: boolean;
  taskStats: TaskStats;
}

/**
 * Calculate progress percentage from task stats
 */
export function calculateAutoProgress(taskStats: TaskStats): number {
  if (taskStats.total === 0) {
    return 0;
  }
  
  return Math.round((taskStats.completed / taskStats.total) * 100);
}

/**
 * Get the display progress for a project
 * Uses manual override if set, otherwise auto-calculated
 */
export function getDisplayProgress(
  project: Pick<SelectProject, 'progressPercentage' | 'autoCalculatedProgress'>,
  taskStats: TaskStats
): number {
  // If manual override exists, use it
  if (project.progressPercentage !== null && project.progressPercentage !== undefined) {
    return project.progressPercentage;
  }
  
  // Otherwise, use auto-calculated progress
  if (project.autoCalculatedProgress !== null && project.autoCalculatedProgress !== undefined) {
    return project.autoCalculatedProgress;
  }
  
  // Fallback: calculate from task stats
  return calculateAutoProgress(taskStats);
}

/**
 * Get comprehensive progress data for a project
 */
export function getProgressData(
  project: Pick<SelectProject, 'progressPercentage' | 'autoCalculatedProgress'>,
  taskStats: TaskStats
): ProgressData {
  const autoCalculated = project.autoCalculatedProgress ?? calculateAutoProgress(taskStats);
  const manual = project.progressPercentage ?? null;
  const isManualOverride = manual !== null;
  const displayProgress = isManualOverride ? manual : autoCalculated;
  
  return {
    autoCalculated,
    manual,
    displayProgress,
    isManualOverride,
    taskStats,
  };
}

/**
 * Validate progress percentage (0-100)
 */
export function validateProgressPercentage(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 100;
}

/**
 * Format progress percentage for display
 */
export function formatProgress(percentage: number): string {
  return `${percentage}%`;
}

/**
 * Get progress status color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage === 0) return 'gray';
  if (percentage < 25) return 'red';
  if (percentage < 50) return 'orange';
  if (percentage < 75) return 'yellow';
  if (percentage < 100) return 'blue';
  return 'green';
}

/**
 * Get progress status label
 */
export function getProgressLabel(percentage: number): string {
  if (percentage === 0) return 'Not Started';
  if (percentage < 25) return 'Just Started';
  if (percentage < 50) return 'In Progress';
  if (percentage < 75) return 'Halfway There';
  if (percentage < 100) return 'Almost Done';
  return 'Completed';
}
