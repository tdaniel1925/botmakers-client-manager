"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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

interface ProjectsListPaginatedProps {
  projects: Project[];
  basePath: string;
}

const ITEMS_PER_PAGE = 12;

export function ProjectsListPaginated({ projects, basePath }: ProjectsListPaginatedProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="space-y-3">
      {currentProjects.map((project) => (
        <Link
          key={project.id}
          href={`${basePath}/${project.id}`}
          className="block border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between gap-4">
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
          </div>
        </Link>
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
  );
}
