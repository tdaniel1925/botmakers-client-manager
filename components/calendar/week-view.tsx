/**
 * Week View Component
 * 7-day calendar with time slots
 */

'use client';

import type { SelectCalendarEvent, SelectCalendar } from '@/db/schema/calendar-schema';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  events: SelectCalendarEvent[];
  calendars: SelectCalendar[];
  onEventClick: (event: SelectCalendarEvent) => void;
}

export function WeekView({
  currentDate,
  events,
  calendars,
  onEventClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  // Generate hours (6 AM to 10 PM)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
        <div className="w-16 border-r" /> {/* Time column */}
        {days.map((day) => {
          const isTodayDate = isToday(day);
          return (
            <div key={day.toISOString()} className="px-2 py-3 text-center border-r last:border-r-0">
              <div className={`text-sm font-semibold ${isTodayDate ? 'text-primary' : ''}`}>
                {format(day, 'EEE')}
              </div>
              <div
                className={`text-2xl font-bold ${
                  isTodayDate ? 'text-primary' : ''
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 relative">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b" style={{ height: '60px' }}>
            {/* Time label */}
            <div className="w-16 pr-2 text-right text-xs text-muted-foreground pt-1 border-r">
              {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = (eventsByDay.get(dayKey) || []).filter(event => {
                const eventHour = new Date(event.startTime).getHours();
                return eventHour === hour;
              });

              return (
                <div key={`${day}-${hour}`} className="border-r last:border-r-0 p-1 relative">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="text-xs p-2 rounded mb-1 cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: getCalendarColor(event.calendarId) + '20',
                        borderLeft: `3px solid ${getCalendarColor(event.calendarId)}`,
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-muted-foreground text-[10px]">
                        {format(new Date(event.startTime), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


