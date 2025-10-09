"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ActivityFormDialog } from "@/components/crm/activity-form-dialog";
import { ActivityItem } from "@/components/crm/activity-item";
import { getActivitiesAction, markActivityCompleteAction } from "@/actions/activities-actions";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { SelectActivity } from "@/db/schema";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  List, 
  AlertCircle, 
  CheckCircle,
  Search,
  Filter,
  X,
  Download,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonStats, SkeletonList } from "@/components/ui/skeleton-card";
import { EmptyState, FilteredEmptyState } from "@/components/ui/empty-state";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<(SelectActivity & { contactName?: string; dealTitle?: string })[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<(SelectActivity & { contactName?: string; dealTitle?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<"all" | "today" | "overdue" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate-asc");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [filter, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [activities, searchQuery, typeFilter, sortBy]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const orgsResult = await getUserOrganizationsAction();
      if (orgsResult.isSuccess && orgsResult.data && orgsResult.data.length > 0) {
        const orgId = orgsResult.data[0].id;
        setOrganizationId(orgId);
        
        const [sortField, sortOrder] = sortBy.split("-") as [any, "asc" | "desc"];
        const options: any = { limit: 500, sortBy: sortField, sortOrder: sortOrder };
        
        if (filter === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          options.dueDateFrom = today;
          options.dueDateTo = tomorrow;
        } else if (filter === "overdue") {
          options.dueDateTo = new Date();
          options.completed = false;
        } else if (filter === "completed") {
          options.completed = true;
        }
        
        const result = await getActivitiesAction(orgId, options);
        if (result.isSuccess && result.data) {
          setActivities(result.data.activities);
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load activities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title?.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.contactName?.toLowerCase().includes(query) ||
        activity.dealTitle?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    setFilteredActivities(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortBy("dueDate-asc");
    setFilter("all");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "all" || sortBy !== "dueDate-asc" || filter !== "all";

  const handleComplete = async (activityId: string) => {
    try {
      const result = await markActivityCompleteAction(activityId, organizationId);
      if (result.isSuccess) {
        toast({ title: "Success", description: "Activity marked as complete" });
        loadActivities();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update activity", variant: "destructive" });
    }
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter((activity) => {
      if (!activity.dueDate) return false;
      const activityDate = new Date(activity.dueDate);
      return activityDate.toDateString() === date.toDateString();
    });
  };

  const getDayActivitiesCount = (date: Date) => {
    return getActivitiesForDate(date).length;
  };

  if (!organizationId) {
    return (
      <main className="p-6 md:p-10">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <h1 className="text-3xl font-bold mb-4">No Organization Found</h1>
          <p className="text-gray-600">You need to be part of an organization to manage activities.</p>
        </div>
      </main>
    );
  }

  const overdueCount = activities.filter(a => 
    a.dueDate && !a.completed && new Date(a.dueDate) < new Date()
  ).length;
  
  const todayCount = activities.filter(a => 
    a.dueDate && new Date(a.dueDate).toDateString() === new Date().toDateString()
  ).length;

  // Use filtered activities for display
  const displayActivities = filteredActivities;

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = ['Title', 'Type', 'Description', 'Contact', 'Deal', 'Due Date', 'Completed', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...displayActivities.map(activity => [
        `"${activity.title || 'N/A'}"`,
        activity.type || 'N/A',
        `"${activity.description || 'N/A'}"`,
        `"${activity.contactName || 'N/A'}"`,
        `"${activity.dealTitle || 'N/A'}"`,
        activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : 'N/A',
        activity.completed ? 'Yes' : 'No',
        new Date(activity.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast({ title: "Success", description: `Exported ${displayActivities.length} activities to CSV` });
  };

  return (
    <main className="p-6 md:p-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Activities</h1>
            <p className="text-gray-600">Manage your tasks and activities</p>
          </div>
          <ActivityFormDialog organizationId={organizationId} onSuccess={loadActivities} />
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <SkeletonStats />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-2xl font-bold">{todayCount}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Active</p>
                <p className="text-2xl font-bold">{activities.filter(a => !a.completed).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities by title, description, contact, or deal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-gray-100" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dueDate-asc">Due Date (Earliest)</SelectItem>
                      <SelectItem value="dueDate-desc">Due Date (Latest)</SelectItem>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Results Counter */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {loading ? "Loading..." : `Showing ${displayActivities.length} of ${activities.length} activities`}
              </span>
              {displayActivities.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Actions
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export to CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("today")}
            >
              Today
            </Button>
            <Button
              variant={filter === "overdue" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("overdue")}
            >
              Overdue ({overdueCount})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </div>

          {/* Activities List */}
          {loading ? (
            <SkeletonList />
          ) : displayActivities.length === 0 ? (
            <Card>
              <CardContent className="py-0">
                {hasActiveFilters ? (
                  <FilteredEmptyState 
                    onClearFilters={clearFilters}
                    resourceName="activities"
                  />
                ) : (
                  <EmptyState
                    icon={CalendarIcon}
                    title="No activities yet"
                    description="Track calls, meetings, emails, and tasks to stay on top of your work. Start by creating your first activity."
                    action={{
                      label: "Create Activity",
                      onClick: () => {}, // Will be handled by the trigger
                      icon: Plus
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onComplete={handleComplete}
                  onEdit={(activity) => {
                    // You could open edit dialog here
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select a Date</CardTitle>
                <CardDescription>View activities for a specific day</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasActivities: (date) => getDayActivitiesCount(date) > 0,
                  }}
                  modifiersStyles={{
                    hasActivities: {
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  {selectedDate && `${getDayActivitiesCount(selectedDate)} activities scheduled`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-3">
                    {getActivitiesForDate(selectedDate).length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No activities scheduled for this day
                      </p>
                    ) : (
                      getActivitiesForDate(selectedDate).map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          onComplete={handleComplete}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Select a date to view activities
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}



