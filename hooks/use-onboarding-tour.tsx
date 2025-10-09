import { useState, useEffect } from "react";
import { Step } from "react-joyride";

const TOUR_COMPLETED_KEY = "clientflow_tour_completed";

export interface TourConfig {
  id: string;
  steps: Step[];
}

export function useOnboardingTour(tourConfig: TourConfig) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem(`${TOUR_COMPLETED_KEY}_${tourConfig.id}`);
    
    // Auto-start tour if not completed (with a small delay for page load)
    if (!tourCompleted) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourConfig.id]);

  const startTour = () => {
    setStepIndex(0);
    setRun(true);
  };

  const stopTour = () => {
    setRun(false);
  };

  const resetTour = () => {
    localStorage.removeItem(`${TOUR_COMPLETED_KEY}_${tourConfig.id}`);
    setStepIndex(0);
    setRun(true);
  };

  const completeTour = () => {
    localStorage.setItem(`${TOUR_COMPLETED_KEY}_${tourConfig.id}`, "true");
    setRun(false);
  };

  const handleJoyrideCallback = (data: any) => {
    const { status, type, index } = data;

    // Tour finished or skipped
    if (status === "finished" || status === "skipped") {
      completeTour();
    }

    // Update step index
    if (type === "step:after") {
      setStepIndex(index + 1);
    }
  };

  return {
    run,
    stepIndex,
    steps: tourConfig.steps,
    startTour,
    stopTour,
    resetTour,
    completeTour,
    handleJoyrideCallback,
  };
}

