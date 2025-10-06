"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ActivityFormDialog } from "@/components/crm/activity-form-dialog";
import { ActivityItem } from "@/components/crm/activity-item";
import { getActivitiesAction, markActivityCompleteAction } from "@/actions/activities-actions";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { SelectActivity } from "@/db/schema";
import { Plus, Calendar as CalendarIcon, List, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<(SelectActivity & { contactName?: string; dealTitle?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<"all" | "today" | "overdue" | "completed">("all");
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const orgsResult = await getUserOrganizationsAction();
      if (orgsResult.isSuccess && orgsResult.data && orgsResult.data.length > 0) {
        const orgId = orgsResult.data[0].id;
        setOrganizationId(orgId);
        
        const options: any = { limit: 100, sortBy: "dueDate", sortOrder: "asc" };
        
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
            <div className="text-center py-8">
              <p className="text-gray-500">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No activities found</p>
                <ActivityFormDialog
                  organizationId={organizationId}
                  onSuccess={loadActivities}
                  trigger={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Activity
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
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



