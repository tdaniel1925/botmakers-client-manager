import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SelectProject } from "@/db/schema";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ProjectProgressOverviewProps {
  projects: SelectProject[];
}

const statusColors = {
  planning: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  on_hold: "bg-orange-100 text-orange-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const priorityColors = {
  low: "text-gray-600",
  medium: "text-blue-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export function ProjectProgressOverview({ projects }: ProjectProgressOverviewProps) {
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "planning");

  if (activeProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Track progress on your ongoing projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No active projects</p>
            <p className="text-sm mt-2">Projects will appear here once they are created</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Track progress on your ongoing projects</CardDescription>
        </div>
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activeProjects.slice(0, 5).map((project) => {
            const progress = project.autoCalculatedProgress || 0;
            const isOverdue = project.endDate && new Date(project.endDate) < new Date();

            return (
              <div key={project.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge 
                      className={statusColors[project.status] || statusColors.planning}
                      variant="secondary"
                    >
                      {project.status}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={priorityColors[project.priority] || priorityColors.medium}
                    >
                      {project.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-right">
                    {progress}%
                  </span>
                </div>

                {project.endDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {isOverdue ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">
                          Overdue - Due {format(new Date(project.endDate), "MMM d, yyyy")}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>
                          Due {format(new Date(project.endDate), "MMM d, yyyy")}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
