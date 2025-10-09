"use client";

import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface OnboardingTourProps {
  steps: Step[];
  run: boolean;
  stepIndex: number;
  onCallback: (data: CallBackProps) => void;
}

export function OnboardingTour({ steps, run, stepIndex, onCallback }: OnboardingTourProps) {
  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={onCallback}
      styles={{
        options: {
          primaryColor: "#3b82f6",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: 6,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "#6b7280",
          marginRight: 8,
        },
        buttonSkip: {
          color: "#6b7280",
        },
      }}
      locale={{
        back: "Previous",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
}

