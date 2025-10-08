"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, X, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ScheduleConfig {
  callDays: string[];
  callWindows: Array<{
    start: string;
    end: string;
    label: string;
  }>;
  respectTimezones: boolean;
  maxAttemptsPerContact: number;
  timeBetweenAttempts: number; // hours
  maxConcurrentCalls: number;
}

interface ScheduleConfigFormProps {
  value: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  campaignType?: "inbound" | "outbound";
  compact?: boolean;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_WINDOWS = [
  { start: "09:00", end: "12:00", label: "Morning" },
  { start: "13:00", end: "17:00", label: "Afternoon" },
  { start: "18:00", end: "20:00", label: "Evening" },
];

export function ScheduleConfigForm({ value, onChange, campaignType = "outbound", compact = false }: ScheduleConfigFormProps) {
  const [config, setConfig] = useState<ScheduleConfig>(value);

  // Only show for outbound campaigns
  const showScheduling = campaignType === "outbound";

  useEffect(() => {
    setConfig(value);
  }, [value]);

  const updateConfig = (updates: Partial<ScheduleConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const toggleDay = (day: string) => {
    const newDays = config.callDays.includes(day)
      ? config.callDays.filter((d) => d !== day)
      : [...config.callDays, day];
    updateConfig({ callDays: newDays });
  };

  const addCallWindow = () => {
    updateConfig({
      callWindows: [
        ...config.callWindows,
        { start: "09:00", end: "17:00", label: "New Window" },
      ],
    });
  };

  const updateCallWindow = (index: number, updates: Partial<{ start: string; end: string; label: string }>) => {
    const newWindows = [...config.callWindows];
    newWindows[index] = { ...newWindows[index], ...updates };
    updateConfig({ callWindows: newWindows });
  };

  const removeCallWindow = (index: number) => {
    updateConfig({
      callWindows: config.callWindows.filter((_, i) => i !== index),
    });
  };

  const usePreset = (preset: "business" | "aggressive" | "gentle") => {
    const presets = {
      business: {
        callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        callWindows: [
          { start: "09:00", end: "12:00", label: "Morning" },
          { start: "13:00", end: "17:00", label: "Afternoon" },
        ],
        respectTimezones: true,
        maxAttemptsPerContact: 3,
        timeBetweenAttempts: 24,
        maxConcurrentCalls: 10,
      },
      aggressive: {
        callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        callWindows: [
          { start: "09:00", end: "12:00", label: "Morning" },
          { start: "13:00", end: "17:00", label: "Afternoon" },
          { start: "18:00", end: "20:00", label: "Evening" },
        ],
        respectTimezones: true,
        maxAttemptsPerContact: 5,
        timeBetweenAttempts: 12,
        maxConcurrentCalls: 20,
      },
      gentle: {
        callDays: ["Tuesday", "Wednesday", "Thursday"],
        callWindows: [
          { start: "10:00", end: "12:00", label: "Late Morning" },
          { start: "14:00", end: "16:00", label: "Mid Afternoon" },
        ],
        respectTimezones: true,
        maxAttemptsPerContact: 2,
        timeBetweenAttempts: 48,
        maxConcurrentCalls: 5,
      },
    };
    
    updateConfig(presets[preset]);
  };

  if (!showScheduling) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Scheduling configuration is only available for outbound campaigns.
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Max Attempts</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={config.maxAttemptsPerContact}
              onChange={(e) => updateConfig({ maxAttemptsPerContact: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Hours Between Attempts</Label>
            <Input
              type="number"
              min={1}
              max={168}
              value={config.timeBetweenAttempts}
              onChange={(e) => updateConfig({ timeBetweenAttempts: parseInt(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-sm">Respect Timezones</Label>
          <Switch
            checked={config.respectTimezones}
            onCheckedChange={(checked) => updateConfig({ respectTimezones: checked })}
          />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Call Scheduling
        </CardTitle>
        <CardDescription>
          Configure when and how outbound calls should be made
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Presets */}
        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => usePreset("business")}
            >
              Business Hours
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => usePreset("aggressive")}
            >
              Aggressive
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => usePreset("gentle")}
            >
              Gentle
            </Button>
          </div>
        </div>

        {/* Call Days */}
        <div className="space-y-3">
          <Label>Call Days</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Badge
                key={day}
                variant={config.callDays.includes(day) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 3)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Call Windows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Call Windows</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCallWindow}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Window
            </Button>
          </div>
          
          <div className="space-y-2">
            {config.callWindows.map((window, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Label"
                  value={window.label}
                  onChange={(e) => updateCallWindow(index, { label: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={window.start}
                  onChange={(e) => updateCallWindow(index, { start: e.target.value })}
                  className="w-32"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="time"
                  value={window.end}
                  onChange={(e) => updateCallWindow(index, { end: e.target.value })}
                  className="w-32"
                />
                {config.callWindows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCallWindow(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-sm">Advanced Settings</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Respect Contact Timezones</Label>
              <p className="text-sm text-gray-500">
                Call contacts during their local business hours
              </p>
            </div>
            <Switch
              checked={config.respectTimezones}
              onCheckedChange={(checked) => updateConfig({ respectTimezones: checked })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max Attempts</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={config.maxAttemptsPerContact}
                onChange={(e) => updateConfig({ maxAttemptsPerContact: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Per contact</p>
            </div>
            
            <div className="space-y-2">
              <Label>Time Between</Label>
              <Input
                type="number"
                min={1}
                max={168}
                value={config.timeBetweenAttempts}
                onChange={(e) => updateConfig({ timeBetweenAttempts: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Hours</p>
            </div>
            
            <div className="space-y-2">
              <Label>Max Concurrent</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={config.maxConcurrentCalls}
                onChange={(e) => updateConfig({ maxConcurrentCalls: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Calls</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

