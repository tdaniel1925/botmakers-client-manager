"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface ScheduleSendDialogProps {
  onSchedule: (date: Date) => void;
  trigger?: React.ReactNode;
}

export function ScheduleSendDialog({ onSchedule, trigger }: ScheduleSendDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const presets = [
    {
      label: 'Tomorrow 9 AM',
      getValue: () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(9, 0, 0, 0);
        return date;
      },
    },
    {
      label: 'Monday 9 AM',
      getValue: () => {
        const date = new Date();
        const day = date.getDay();
        const daysUntilMonday = day === 0 ? 1 : 8 - day;
        date.setDate(date.getDate() + daysUntilMonday);
        date.setHours(9, 0, 0, 0);
        return date;
      },
    },
    {
      label: 'In 1 Hour',
      getValue: () => {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        date.setMinutes(0, 0, 0);
        return date;
      },
    },
    {
      label: 'In 3 Hours',
      getValue: () => {
        const date = new Date();
        date.setHours(date.getHours() + 3);
        date.setMinutes(0, 0, 0);
        return date;
      },
    },
  ];

  const handlePresetClick = (getDate: () => Date) => {
    const date = getDate();
    onSchedule(date);
    setOpen(false);
  };

  const handleCustomSchedule = () => {
    if (!selectedDate || !selectedTime) return;
    
    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    if (date < new Date()) {
      alert('Please select a future date and time');
      return;
    }
    
    onSchedule(date);
    setOpen(false);
    setSelectedDate('');
    setSelectedTime('');
  };

  // Set default date/time to tomorrow 9 AM
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Clock className="h-4 w-4" />
            Schedule Send
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Send
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Presets */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Quick Schedule</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  onClick={() => handlePresetClick(preset.getValue)}
                  className="justify-start"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date/Time */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-semibold mb-3 block">Custom Schedule</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="schedule-date" className="text-xs">Date</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="schedule-time" className="text-xs">Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleCustomSchedule}
                disabled={!selectedDate || !selectedTime}
                className="w-full"
              >
                Schedule for {selectedDate && selectedTime && (
                  <>
                    {new Date(`${selectedDate}T${selectedTime}`).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </>
                )}
                {(!selectedDate || !selectedTime) && 'Custom Time'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

