/**
 * Calendar Sidebar Component
 * Mini calendar and calendar list
 */

'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import type { SelectCalendar } from '@/db/schema/calendar-schema';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

interface CalendarSidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  calendars: SelectCalendar[];
  selectedCalendars: Set<string>;
  onCalendarToggle: (calendarId: string) => void;
  onRefresh: () => void;
}

export function CalendarSidebar({
  currentDate,
  onDateSelect,
  calendars,
  selectedCalendars,
  onCalendarToggle,
  onRefresh,
}: CalendarSidebarProps) {
  const today = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-64 border-r bg-background p-4 space-y-6 overflow-y-auto">
      {/* Mini Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">{format(currentDate, 'MMMM yyyy')}</h3>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-muted-foreground h-6 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, currentDate);

            return (
              <button
                key={index}
                onClick={() => onDateSelect(day)}
                className={`
                  h-8 w-full text-xs rounded flex items-center justify-center
                  transition-colors
                  ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  ${isToday ? 'font-bold' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendars List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">My Calendars</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onRefresh}
              title="Refresh calendars"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Add calendar"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {calendars.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No calendars yet
            </div>
          ) : (
            calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="flex items-center gap-2 hover:bg-muted p-1 rounded cursor-pointer"
                onClick={() => onCalendarToggle(calendar.id)}
              >
                <Checkbox
                  checked={selectedCalendars.has(calendar.id)}
                  onCheckedChange={() => onCalendarToggle(calendar.id)}
                  className="flex-shrink-0"
                />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calendar.color || '#3B82F6' }}
                />
                <span className="text-sm truncate flex-1">{calendar.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Link */}
      <div className="pt-4 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Calendar Settings
        </Button>
      </div>
    </div>
  );
}



