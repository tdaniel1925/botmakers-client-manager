"use client";

import { useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { OnboardingTour } from "./onboarding-tour";
import { Step } from "react-joyride";

const DASHBOARD_TOUR_STEPS: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">Welcome to ClientFlow! 👋</h2>
        <p>Let's take a quick tour to help you get started. You can skip this tour anytime by clicking "Skip Tour".</p>
      </div>
    ),
    placement: "center",
  },
  {
    target: '[data-tour="recently-viewed"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Recently Viewed</h3>
        <p>Quick access to items you've recently worked on. This updates automatically as you navigate through contacts, deals, activities, and projects.</p>
      </div>
    ),
    placement: "left",
    disableBeacon: true,
  },
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">Pro Tips! 💡</h2>
        <div className="space-y-2 text-sm">
          <p>• Press <kbd className="px-2 py-1 bg-gray-200 rounded">Cmd/Ctrl+K</kbd> to open the command palette and navigate anywhere instantly</p>
          <p>• Press <kbd className="px-2 py-1 bg-gray-200 rounded">Cmd/Ctrl+/</kbd> to see all keyboard shortcuts</p>
          <p>• Double-click on table cells in Contacts to edit inline</p>
          <p>• Use bulk actions to manage multiple items at once</p>
        </div>
      </div>
    ),
    placement: "center",
  },
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">You're all set! 🎉</h2>
        <p className="mb-2">Explore the sidebar to access Contacts, Deals, Activities, Projects, and more.</p>
        <p className="text-sm text-gray-600">You can restart this tour anytime from the Help page.</p>
      </div>
    ),
    placement: "center",
  },
];

export function DashboardTour() {
  const tour = useOnboardingTour({
    id: "dashboard",
    steps: DASHBOARD_TOUR_STEPS,
  });

  return (
    <OnboardingTour
      steps={tour.steps}
      run={tour.run}
      stepIndex={tour.stepIndex}
      onCallback={tour.handleJoyrideCallback}
    />
  );
}

