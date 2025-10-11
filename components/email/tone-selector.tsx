"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

const TONES = [
  { value: "auto", label: "Auto-detect", description: "Match recipient's style" },
  { value: "professional", label: "Professional", description: "Formal and business-like" },
  { value: "friendly", label: "Friendly", description: "Warm and casual" },
  { value: "concise", label: "Concise", description: "Brief and to the point" },
  { value: "detailed", label: "Detailed", description: "Thorough and informative" },
];

interface ToneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  const selectedTone = TONES.find((t) => t.value === value) || TONES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-xs">Tone:</span>
          <span className="font-semibold">{selectedTone.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {TONES.map((tone) => (
          <DropdownMenuItem
            key={tone.value}
            onClick={() => onChange(tone.value)}
            className="flex items-start gap-3 py-3"
          >
            <div className="flex h-5 items-center">
              {value === tone.value && <Check className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <div className="font-medium">{tone.label}</div>
              <div className="text-xs text-muted-foreground">
                {tone.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

