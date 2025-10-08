"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Info } from "lucide-react";

export interface PhoneNumberSelection {
  source: "vapi";
  areaCode?: string;
}

interface PhoneNumberSelectorProps {
  provider: "vapi";
  value: PhoneNumberSelection;
  onChange: (value: PhoneNumberSelection) => void;
}

export function PhoneNumberSelectorEnhanced({
  provider,
  value,
  onChange,
}: PhoneNumberSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Phone className="h-5 w-5 text-blue-600 mt-1" />
        <div className="flex-1">
          <Label className="text-base font-semibold">Phone Number</Label>
          <p className="text-sm text-gray-600 mt-1">
            A phone number will be automatically assigned to your campaign when you create it.
          </p>
        </div>
      </div>

      {/* Optional Area Code Input */}
      <div className="space-y-2">
        <Label htmlFor="area-code" className="text-sm font-medium">
          Preferred Area Code (Optional)
        </Label>
        <Input
          id="area-code"
          type="text"
          placeholder="e.g., 718"
          maxLength={3}
          value={value.areaCode || ""}
          onChange={(e) => {
            const newValue = e.target.value.replace(/\D/g, ""); // Only allow digits
            onChange({ ...value, areaCode: newValue });
          }}
          className="max-w-xs"
        />
        <p className="text-xs text-gray-500">
          Enter a 3-digit US area code to request a number in that region. If unavailable, a random number will be assigned.
        </p>
      </div>

      {/* Informational Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>What happens next:</strong> We'll automatically purchase a new phone number when you create the campaign. 
          This usually takes 30-60 seconds. Your phone number will be displayed on the campaign page after creation.
        </AlertDescription>
      </Alert>
    </div>
  );
}
