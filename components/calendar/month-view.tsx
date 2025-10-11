/**
 * Month View Component
 * Calendar month grid with events
 */

'use client';

import type { SelectCalendarEvent, SelectCalendar } from '@/db/schema/calendar-schema';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format, isToday } from 'date-fns';

interface MonthViewProps {
  currentDate: Date;
  events: SelectCalendarEvent[];
  calendars: SelectCalendar[];
  onEventClick: (event: SelectCalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  calendars,
  onEventClick,
  onDateClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group events by day
  const eventsByDay = new Map<string, SelectCalendarEvent[]>();
  events.forEach(event => {
    const eventDate = new Date(event.startTime);
    const dayKey = format(eventDate, 'yyyy-MM-dd');
    if (!eventsByDay.has(dayKey)) {
      eventsByDay.set(dayKey, []);
    }
    eventsByDay.get(dayKey)!.push(event);
  });

  // Get calendar color
  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(c => c.id === calendarId);
    return calendar?.color || '#3B82F6';
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="h-full flex flex-col">
      {/* Week headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div key={day} className="px-2 py-3 text-sm font-semibold text-center border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: '1fr' }}>
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(dayKey) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={dayKey}
              className={`border-r border-b last:border-r-0 p-2 overflow-y-auto cursor-pointer hover:bg-muted/30 transition-colors ${
                !isCurrentMonth ? 'bg-muted/10' : ''
              }`}
              onClick={() => onDateClick(day)}
            >
              {/* Date number */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                    isTodayDate ? 'bg-primary text-primary-foreground' : ''
                  } ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="text-xs p-1 rounded cursor-pointer truncate hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: getCalendarColor(event.calendarId) + '20',
                      borderLeft: `3px solid ${getCalendarColor(event.calendarId)}`,
                    }}
                    title={event.title}
                  >
                    <div className="font-medium truncate">
                      {format(new Date(event.startTime), 'h:mm a')} {event.title}
                    </div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


