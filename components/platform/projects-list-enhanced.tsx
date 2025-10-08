"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FolderKanban, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { deleteProjectAction, bulkDeleteProjectsAction } from "@/actions/projects-actions";

interface Project {
  id: string;
  name: string;
  description: string | null;
  organizationName?: string;
  status: string;
  priority: string;
  createdAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  budget: string | null;
}

interface ProjectsListEnhancedProps {
  projects: Project[];
  basePath: string;
}

const ITEMS_PER_PAGE = 12;

export function ProjectsListEnhanced({ projects, basePath }: ProjectsListEnhancedProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false); // true = all projects, false = current page only
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleProjectSelection = (projectId: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
      // Exit select all mode if user manually deselects
      setSelectAllMode(false);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedProjects.size === currentProjects.length && !selectAllMode) {
      setSelectedProjects(new Set());
      setSelectAllMode(false);
    } else {
      setSelectedProjects(new Set(currentProjects.map(p => p.id)));
      setSelectAllMode(false);
    }
  };

  const selectAllProjects = () => {
    setSelectedProjects(new Set(projects.map(p => p.id)));
    setSelectAllMode(true);
  };

  const clearAllSelections = () => {
    setSelectedProjects(new Set());
    setSelectAllMode(false);
  };

  const allCurrentPageSelected = currentProjects.length > 0 && 
    currentProjects.every(p => selectedProjects.has(p.id)) &&
    selectedProjects.size === currentProjects.length;

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    startTransition(async () => {
      try {
        const result = await deleteProjectAction(projectToDelete.id);
        if (result.isSuccess) {
          toast.success("Project deleted", {
            description: `${projectToDelete.name} has been deleted successfully.`
          });
          setDeleteDialogOpen(false);
          setProjectToDelete(null);
          router.refresh();
        } else {
          toast.error("Delete failed", {
            description: result.message || "Failed to delete project."
          });
        }
      } catch (error: any) {
        toast.error("Error occurred", {
          description: error.message || "An unexpected error occurred."
        });
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.size === 0) return;

    startTransition(async () => {
      try {
        const projectIds = Array.from(selectedProjects);
        const result = await bulkDeleteProjectsAction(projectIds);
        
        if (result.isSuccess) {
          toast.success("Projects deleted", {
            description: `${projectIds.length} project(s) deleted successfully.`
          });
          setSelectedProjects(new Set());
          setBulkDeleteDialogOpen(false);
          router.refresh();
        } else {
          toast.error("Delete failed", {
            description: result.message || "Failed to delete projects."
          });
        }
      } catch (error: any) {
        toast.error("Error occurred", {
          description: error.message || "An unexpected error occurred."
        });
      }
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <>
      <div className="space-y-3">
        {/* Bulk Actions Bar */}
        {selectedProjects.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectAllMode ? (
                <>All {projects.length} projects selected</>
              ) : (
                <>{selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected</>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllSelections}
              >
                Clear Selection
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Select All Projects Banner */}
        {allCurrentPageSelected && !selectAllMode && projects.length > currentProjects.length && (
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-sm text-amber-900">
              All {currentProjects.length} projects on this page are selected.
            </span>
            <Button 
              variant="link" 
              size="sm"
              onClick={selectAllProjects}
              className="text-amber-900 underline font-semibold"
            >
              Select all {projects.length} projects
            </Button>
          </div>
        )}

        {/* Select All Checkbox */}
        {currentProjects.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Checkbox
              checked={allCurrentPageSelected || selectAllMode}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all projects on this page"
            />
            <span className="text-sm text-gray-600">
              {selectAllMode ? `All ${projects.length} projects selected` : 'Select all on this page'}
            </span>
          </div>
        )}

        {/* Projects List */}
        {currentProjects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <Checkbox
                checked={selectedProjects.has(project.id)}
                onCheckedChange={() => toggleProjectSelection(project.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${project.name}`}
              />

              {/* Project Content - Clickable Link */}
              <Link
                href={`${basePath}/${project.id}`}
                className="flex-1 flex items-center justify-between gap-4"
              >
                {/* Left: Title and Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderKanban className="h-4 w-4 text-gray-400 shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                    {project.organizationName && (
                      <span className="text-xs text-gray-500 truncate">• {project.organizationName}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {project.description || "No description"}
                  </p>
                </div>

                {/* Middle: Metadata */}
                <div className="hidden lg:flex items-center gap-3 text-xs text-gray-400 shrink-0">
                  <span className="whitespace-nowrap">
                    {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {project.budget && (
                    <span className="whitespace-nowrap">${Number(project.budget).toLocaleString()}</span>
                  )}
                </div>

                {/* Right: Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant={
                      project.status === "active" ? "default" :
                      project.status === "completed" ? "secondary" :
                      project.status === "planning" ? "outline" :
                      "destructive"
                    }
                    className="text-xs"
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                  <Badge 
                    variant={
                      project.priority === "critical" ? "destructive" :
                      project.priority === "high" ? "destructive" :
                      project.priority === "medium" ? "default" :
                      "secondary"
                    }
                    className="text-xs"
                  >
                    {project.priority}
                  </Badge>
                </div>
              </Link>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`${basePath}/${project.id}`}>
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, projects.length)} of {projects.length} projects
            </p>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page as number)}
                    className="min-w-[36px]"
                  >
                    {page}
                  </Button>
                )
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteProject}
        loading={isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Projects"
        description={`Are you sure you want to delete ${selectedProjects.size} project(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedProjects.size} Project${selectedProjects.size > 1 ? 's' : ''}`}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleBulkDelete}
        loading={isPending}
      />
    </>
  );
}

