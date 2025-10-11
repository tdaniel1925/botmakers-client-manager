/**
 * Day View Component
 * Single day timeline with events
 */

'use client';

import type { SelectCalendarEvent, SelectCalendar } from '@/db/schema/calendar-schema';
import { format, isSameDay } from 'date-fns';

interface DayViewProps {
  currentDate: Date;
  events: SelectCalendarEvent[];
  calendars: SelectCalendar[];
  onEventClick: (event: SelectCalendarEvent) => void;
}

export function DayView({
  currentDate,
  events,
  calendars,
  onEventClick,
}: DayViewProps) {
  // Filter events for current day
  const dayEvents = events.filter(event =>
    isSameDay(new Date(event.startTime), currentDate)
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Get calendar color
  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(c => c.id === calendarId);
    return calendar?.color || '#3B82F6';
  };

  // Generate hours (5 AM to 11 PM)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  return (
    <div className="h-full overflow-auto">
      {/* Time grid */}
      <div className="relative">
        {hours.map((hour) => {
          // Get events for this hour
          const hourEvents = dayEvents.filter(event => {
            const eventHour = new Date(event.startTime).getHours();
            return eventHour === hour;
          });

          return (
            <div key={hour} className="flex border-b" style={{ minHeight: '80px' }}>
              {/* Time label */}
              <div className="w-24 pr-4 text-right text-sm text-muted-foreground pt-2 border-r">
                {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
              </div>

              {/* Events column */}
              <div className="flex-1 p-2 space-y-2">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: getCalendarColor(event.calendarId) + '20',
                      borderLeft: `4px solid ${getCalendarColor(event.calendarId)}`,
                    }}
                  >
                    <div className="font-semibold text-sm mb-1">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                    </div>
                    {event.location && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* No events message */}
      {dayEvents.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg font-medium">No events scheduled</p>
            <p className="text-sm">Click "Create Event" to add one</p>
          </div>
        </div>
      )}
    </div>
  );
}


