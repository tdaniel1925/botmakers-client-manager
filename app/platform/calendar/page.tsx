/**
 * Calendar Page
 * Full-featured calendar with month/week/day views
 */

'use client';

import { useState, useEffect } from 'react';
import { CalendarHeader } from '@/components/calendar/calendar-header';
import { CalendarSidebar } from '@/components/calendar/calendar-sidebar';
import { MonthView } from '@/components/calendar/month-view';
import { WeekView } from '@/components/calendar/week-view';
import { DayView } from '@/components/calendar/day-view';
import { EventDialog } from '@/components/calendar/event-dialog';
import { getAllEventsAction, getCalendarsAction } from '@/actions/calendar-actions';
import type { SelectCalendarEvent, SelectCalendar } from '@/db/schema/calendar-schema';
import { addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';

type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<SelectCalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<SelectCalendar[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectCalendarEvent | null>(null);

  // Load calendars
  useEffect(() => {
    loadCalendars();
  }, []);

  // Load events when date or view changes
  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  async function loadCalendars() {
    const result = await getCalendarsAction();
    if (result.success && result.data) {
      setCalendars(result.data.calendars);
      // Select all calendars by default
      setSelectedCalendars(new Set(result.data.calendars.map(c => c.id)));
    }
  }

  async function loadEvents() {
    setLoading(true);
    
    // Calculate date range based on view
    let startDate: Date;
    let endDate: Date;

    if (view === 'month') {
      startDate = startOfWeek(startOfMonth(currentDate));
      endDate = endOfWeek(endOfMonth(currentDate));
    } else if (view === 'week') {
      startDate = startOfWeek(currentDate);
      endDate = endOfWeek(currentDate);
    } else {
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const result = await getAllEventsAction(startDate, endDate);
    if (result.success && result.data) {
      setEvents(result.data.events);
    }
    
    setLoading(false);
  }

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: SelectCalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setEventDialogOpen(true);
  };

  const handleEventSaved = () => {
    loadEvents();
    setEventDialogOpen(false);
  };

  const handleCalendarToggle = (calendarId: string) => {
    const newSelected = new Set(selectedCalendars);
    if (newSelected.has(calendarId)) {
      newSelected.delete(calendarId);
    } else {
      newSelected.add(calendarId);
    }
    setSelectedCalendars(newSelected);
  };

  // Filter events by selected calendars
  const filteredEvents = events.filter(event => 
    selectedCalendars.has(event.calendarId)
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <CalendarHeader
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onCreateEvent={handleCreateEvent}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <CalendarSidebar
          currentDate={currentDate}
          onDateSelect={setCurrentDate}
          calendars={calendars}
          selectedCalendars={selectedCalendars}
          onCalendarToggle={handleCalendarToggle}
          onRefresh={loadCalendars}
        />

        {/* Calendar Views */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            </div>
          ) : (
            <>
              {view === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  events={filteredEvents}
                  calendars={calendars}
                  onEventClick={handleEventClick}
                  onDateClick={(date) => {
                    setCurrentDate(date);
                    setView('day');
                  }}
                />
              )}
              {view === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  calendars={calendars}
                  onEventClick={handleEventClick}
                />
              )}
              {view === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  calendars={calendars}
                  onEventClick={handleEventClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Event Dialog */}
      {eventDialogOpen && (
        <EventDialog
          event={selectedEvent}
          calendars={calendars}
          onClose={() => setEventDialogOpen(false)}
          onSave={handleEventSaved}
        />
      )}
    </div>
  );
}

