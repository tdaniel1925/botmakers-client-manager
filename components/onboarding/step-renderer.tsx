/**
 * Step Renderer Component
 * Dynamically renders different step types
 */

"use client";

import { WelcomeStep } from "./step-types/welcome-step";
import { FormStep } from "./step-types/form-step";
import { UploadStep } from "./step-types/upload-step";
import { ChoiceStep } from "./step-types/choice-step";
import { ReviewStep } from "./step-types/review-step";
import { CompleteStep } from "./step-types/complete-step";

interface StepRendererProps {
  step: any;
  stepIndex: number;
  data: any;
  onChange: (data: any) => void;
  token: string;
  organizationId: string;
}

export function StepRenderer({
  step,
  stepIndex,
  data,
  onChange,
  token,
  organizationId,
}: StepRendererProps) {
  switch (step.type) {
    case "welcome":
      return <WelcomeStep step={step} />;

    case "form":
      return <FormStep step={step} data={data} onChange={onChange} />;

    case "upload":
      return (
        <UploadStep
          step={step}
          data={data}
          onChange={onChange}
          token={token}
          organizationId={organizationId}
        />
      );

    case "choice":
      return <ChoiceStep step={step} data={data} onChange={onChange} />;

    case "review":
      return <ReviewStep step={step} allStepData={data} />;

    case "complete":
      return <CompleteStep step={step} />;

    default:
      return (
        <div className="text-center py-10">
          <p className="text-gray-600">
            Unknown step type: <code>{step.type}</code>
          </p>
        </div>
      );
  }
}
