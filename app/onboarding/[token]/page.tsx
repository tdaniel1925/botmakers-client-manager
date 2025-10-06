/**
 * Client Onboarding Page (Public)
 * Public onboarding interface accessible via unique token
 */

import { redirect } from "next/navigation";
import { getOnboardingByTokenAction } from "@/actions/client-onboarding-actions";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

interface OnboardingPageProps {
  params: {
    token: string;
  };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { token } = params;

  // Fetch onboarding session by token
  const result = await getOnboardingByTokenAction(token);

  if (!result.isSuccess || !result.data) {
    // Invalid or expired token
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Onboarding Link</h1>
          <p className="text-gray-600 mb-6">
            {result.message || "This onboarding link is invalid or has expired."}
          </p>
          <p className="text-sm text-gray-500">
            Please contact us if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const { session, project } = result.data;

  // If already completed, show completion page
  if (session.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Complete!</h1>
          <p className="text-gray-600 mb-2">
            You've already completed the onboarding for <strong>{project.name}</strong>.
          </p>
          <p className="text-sm text-gray-500">
            We'll be in touch with you soon with next steps.
          </p>
        </div>
      </div>
    );
  }

  // Render onboarding wizard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <OnboardingWizard
        session={session}
        project={project}
        token={token}
      />
    </div>
  );
}
