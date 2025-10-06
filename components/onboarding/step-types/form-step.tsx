/**
 * Form Step Component
 * Dynamic form builder for collecting information
 */

"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FormStepProps {
  step: any;
  data: any;
  onChange: (data: any) => void;
}

export function FormStep({ step, data, onChange }: FormStepProps) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleCheckboxChange = (fieldName: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldName] || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v: string) => v !== option);

    handleFieldChange(fieldName, newValues);
  };

  const renderField = (field: any) => {
    const value = formData[field.name] || "";

    switch (field.type) {
      case "text":
      case "number":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.name, val)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${option}`}
                  checked={(formData[field.name] || []).includes(option)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(field.name, option, checked as boolean)
                  }
                />
                <label
                  htmlFor={`${field.name}-${option}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleFieldChange(field.name, val)}
          >
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.name}-${option}`} />
                <Label htmlFor={`${field.name}-${option}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFieldChange(field.name, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {step.fields?.map((field: any) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-base">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {field.helpText && (
              <span className="ml-2 inline-flex items-center text-sm text-gray-500 font-normal">
                <HelpCircle className="h-3 w-3 mr-1" />
                {field.helpText}
              </span>
            )}
          </Label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
