/**
 * Calendar Header Component
 * Navigation, view switcher, and actions
 */

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, ArrowLeft, Mail } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CalendarHeaderProps {
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreateEvent: () => void;
}

export function CalendarHeader({
  view,
  onViewChange,
  currentDate,
  onPrevious,
  onNext,
  onToday,
  onCreateEvent,
}: CalendarHeaderProps) {
  const pathname = usePathname();
  const isPlatform = pathname?.startsWith('/platform');
  const dashboardPath = isPlatform ? '/platform/dashboard' : '/dashboard';
  const emailsPath = isPlatform ? '/platform/emails' : '/dashboard/emails';

  const getDateDisplay = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      return format(currentDate, 'MMM dd, yyyy');
    } else {
      return format(currentDate, 'EEEE, MMMM dd, yyyy');
    }
  };

  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Navigation Links & Title */}
        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link href={emailsPath}>
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Emails</span>
              </Button>
            </Link>
            <Link href={dashboardPath}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Calendar</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={onToday} variant="outline" size="sm">
              Today
            </Button>

            <div className="flex items-center gap-1">
              <Button onClick={onPrevious} variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={onNext} variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-lg font-semibold min-w-[200px]">
              {getDateDisplay()}
            </div>
          </div>
        </div>

        {/* Right: View Switcher & Create Button */}
        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('day')}
              className="px-3"
            >
              Day
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('week')}
              className="px-3"
            >
              Week
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('month')}
              className="px-3"
            >
              Month
            </Button>
          </div>

          {/* Create Event Button */}
          <Button onClick={onCreateEvent} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
}

