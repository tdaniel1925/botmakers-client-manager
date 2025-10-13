/**
 * Calendar View Component
 * Full-featured calendar with event management
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit,
  Loader2,
  Mail,
} from 'lucide-react';
import { getCalendarEventsAction, createCalendarEventAction, updateCalendarEventAction, deleteCalendarEventAction } from '@/actions/reminders-calendar-actions';
import type { SelectCalendarEvent } from '@/db/schema';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<SelectCalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SelectCalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    const result = await getCalendarEventsAction({
      startDate: start,
      endDate: end,
    });

    if (result.success) {
      setEvents(result.data || []);
    }
    setLoading(false);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      startTime: format(date, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(date.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    });
    setShowEventDialog(true);
  };

  const handleEventClick = (event: SelectCalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
      isAllDay: event.isAllDay || false,
    });
    setShowEventDialog(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (selectedEvent) {
      // Update existing event
      const result = await updateCalendarEventAction(selectedEvent.id, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        isAllDay: formData.isAllDay,
      });

      if (result.success) {
        toast({
          title: 'Event updated',
          description: 'Your event has been updated',
        });
        closeDialog();
        loadEvents();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } else {
      // Create new event
      const result = await createCalendarEventAction({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        isAllDay: formData.isAllDay,
      });

      if (result.success) {
        toast({
          title: 'Event created',
          description: 'Your event has been added to the calendar',
        });
        closeDialog();
        loadEvents();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    const result = await deleteCalendarEventAction(selectedEvent.id);

    if (result.success) {
      toast({
        title: 'Event deleted',
        description: 'The event has been removed from your calendar',
      });
      closeDialog();
      loadEvents();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const closeDialog = () => {
    setShowEventDialog(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      isAllDay: false,
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      return isSameDay(eventStart, date);
    });
  };

  // Calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad with days from previous/next month to fill weeks
  const firstDayOfWeek = monthStart.getDay();
  const paddingStart = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    paddingStart.push(new Date(monthStart.getTime() - (firstDayOfWeek - i) * 24 * 60 * 60 * 1000));
  }

  const lastDayOfWeek = monthEnd.getDay();
  const paddingEnd = [];
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    paddingEnd.push(new Date(monthEnd.getTime() + i * 24 * 60 * 60 * 1000));
  }

  const allDays = [...paddingStart, ...calendarDays, ...paddingEnd];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Calendar</h1>
              <p className="text-sm text-muted-foreground">
                {events.length} {events.length === 1 ? 'event' : 'events'} this month
              </p>
            </div>
          </div>
          <Button onClick={() => handleDateClick(new Date())} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-background border rounded-lg overflow-hidden">
            {/* Week days header */}
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {allDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                      !isCurrentMonth ? 'bg-muted/50' : ''
                    } ${isTodayDate ? 'bg-blue-50' : ''} cursor-pointer hover:bg-accent transition-colors`}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className={`text-sm mb-1 ${!isCurrentMonth ? 'text-muted-foreground' : ''} ${isTodayDate ? 'font-bold text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="text-xs p-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white truncate hover:shadow-md transition-shadow"
                        >
                          {event.relatedEmailId && <Mail className="inline h-3 w-3 mr-1" />}
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={(open) => {
        if (!open) closeDialog();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
            <DialogDescription>
              {selectedEvent ? 'Update event details' : 'Add a new event to your calendar'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Team meeting"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Conference Room A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting agenda..."
                rows={4}
              />
            </div>
            {selectedEvent?.relatedEmailId && (
              <div className="rounded-lg border bg-blue-50 p-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-900">Created from email</span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            {selectedEvent && (
              <Button
                variant="destructive"
                onClick={handleDeleteEvent}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent}>
              {selectedEvent ? 'Update' : 'Create'} Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


