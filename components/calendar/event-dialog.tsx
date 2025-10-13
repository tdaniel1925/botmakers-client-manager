/**
 * Event Dialog Component
 * Create and edit calendar events
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import type { SelectCalendarEvent, SelectCalendar } from '@/db/schema/calendar-schema';
import { createEventAction, updateEventAction, deleteEventAction } from '@/actions/calendar-actions';
import { format } from 'date-fns';

interface EventDialogProps {
  event: SelectCalendarEvent | null;
  calendars: SelectCalendar[];
  onClose: () => void;
  onSave: () => void;
}

export function EventDialog({
  event,
  calendars,
  onClose,
  onSave,
}: EventDialogProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [calendarId, setCalendarId] = useState(
    event?.calendarId || calendars.find(c => c.isDefault)?.id || calendars[0]?.id || ''
  );
  const [startDate, setStartDate] = useState(
    event ? format(new Date(event.startTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState(
    event ? format(new Date(event.startTime), 'HH:mm') : '09:00'
  );
  const [endDate, setEndDate] = useState(
    event ? format(new Date(event.endTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [endTime, setEndTime] = useState(
    event ? format(new Date(event.endTime), 'HH:mm') : '10:00'
  );
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false);
  const [conferenceLink, setConferenceLink] = useState(event?.conferenceLink || '');
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!calendarId) {
      setError('Please select a calendar');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Combine date and time
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime <= startDateTime) {
        setError('End time must be after start time');
        setSaving(false);
        return;
      }

      if (event) {
        // Update existing event
        const result = await updateEventAction(event.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startTime: startDateTime,
          endTime: endDateTime,
          isAllDay,
          conferenceLink: conferenceLink.trim() || undefined,
          calendarId,
        });

        if (!result.success) {
          setError(result.error || 'Failed to update event');
          setSaving(false);
          return;
        }
      } else {
        // Create new event
        const result = await createEventAction({
          calendarId,
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startTime: startDateTime,
          endTime: endDateTime,
          isAllDay,
          conferenceLink: conferenceLink.trim() || undefined,
        });

        if (!result.success) {
          setError(result.error || 'Failed to create event');
          setSaving(false);
          return;
        }
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteEventAction(event.id);
      if (!result.success) {
        setError(result.error || 'Failed to delete event');
        setDeleting(false);
        return;
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              required
            />
          </div>

          {/* Calendar */}
          <div>
            <Label htmlFor="calendar">Calendar *</Label>
            <select
              id="calendar"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>
          </div>

          {/* All Day */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="allDay" className="!mb-0">All day event</Label>
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            {!isAllDay && (
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            {!isAllDay && (
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
            />
          </div>

          {/* Conference Link */}
          <div>
            <Label htmlFor="conferenceLink">Video Conference Link</Label>
            <Input
              id="conferenceLink"
              value={conferenceLink}
              onChange={(e) => setConferenceLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              type="url"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {event && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                >
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || deleting}>
                {saving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}



