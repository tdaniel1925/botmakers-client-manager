/**
 * Choice Step Component
 * Visual choice selection with images/icons
 */

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceStepProps {
  step: any;
  data: any;
  onChange: (data: any) => void;
}

export function ChoiceStep({ step, data, onChange }: ChoiceStepProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>(
    data?.selectedChoices || []
  );

  useEffect(() => {
    onChange({ selectedChoices });
  }, [selectedChoices]);

  const toggleChoice = (choiceId: string) => {
    setSelectedChoices((prev) => {
      if (prev.includes(choiceId)) {
        return prev.filter((id) => id !== choiceId);
      } else {
        return [...prev, choiceId];
      }
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Select the options that best match your preferences (you can choose multiple)
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {step.choices?.map((choice: any) => {
          const isSelected = selectedChoices.includes(choice.id);

          return (
            <Card
              key={choice.id}
              onClick={() => toggleChoice(choice.id)}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-lg relative",
                isSelected
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border-2 border-gray-200 hover:border-gray-300"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              )}

              {choice.imageUrl && (
                <div className="mb-4">
                  <img
                    src={choice.imageUrl}
                    alt={choice.label}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              <h4 className="font-semibold text-gray-900 mb-2">{choice.label}</h4>
              {choice.description && (
                <p className="text-sm text-gray-600">{choice.description}</p>
              )}
            </Card>
          );
        })}
      </div>

      {selectedChoices.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✓ {selectedChoices.length} option(s) selected
          </p>
        </div>
      )}
    </div>
  );
}
