/**
 * Onboarding Wizard Component
 * Multi-step wizard for client onboarding
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save, CheckCircle, Cloud } from "lucide-react";
import { toast } from "sonner";
import {
  saveStepResponseAction,
  submitStepAction,
  startOnboardingAction,
  completeOnboardingAction,
} from "@/actions/client-onboarding-actions";
import { StepRenderer } from "./step-renderer";
import Image from "next/image";
import { getVisibleSteps, calculateDynamicProgress } from "@/lib/condition-evaluator";

interface OnboardingWizardProps {
  session: any;
  project: any;
  token: string;
}

export function OnboardingWizard({ session, project, token }: OnboardingWizardProps) {
  const steps = session.steps as any[];
  const [currentStep, setCurrentStep] = useState(session.currentStep || 0);
  const [stepData, setStepData] = useState<Record<number, any>>(session.responses || {});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(session.status !== 'pending');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Flatten nested responses for condition evaluation
  const flatResponses = useMemo(() => {
    const flat: Record<string, any> = {};
    Object.values(stepData).forEach((stepResponse: any) => {
      if (typeof stepResponse === "object" && stepResponse !== null) {
        Object.assign(flat, stepResponse);
      }
    });
    return flat;
  }, [stepData]);

  // Calculate visible steps based on conditions
  const visibleStepIndices = useMemo(() => {
    return getVisibleSteps(steps, flatResponses);
  }, [steps, flatResponses]);

  // Check if current step is visible
  const currentStepConfig = steps[currentStep];
  const isCurrentStepVisible = visibleStepIndices.includes(currentStep);

  // Navigation helpers
  const currentVisibleIndex = visibleStepIndices.indexOf(currentStep);
  const isFirstStep = currentVisibleIndex === 0;
  const isLastStep = currentVisibleIndex === visibleStepIndices.length - 1;

  // Dynamic progress calculation
  const completionPercentage = useMemo(() => {
    if (visibleStepIndices.length === 0) return 0;
    return calculateDynamicProgress(currentStep, visibleStepIndices);
  }, [currentStep, visibleStepIndices]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStepConfig && stepData[currentStep]) {
        autoSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentStep, stepData]);

  // Mark session as started on first interaction
  useEffect(() => {
    if (!hasStarted) {
      startOnboarding();
    }
  }, []);

  const startOnboarding = async () => {
    const result = await startOnboardingAction(token);
    if (result.isSuccess) {
      setHasStarted(true);
    }
  };

  const autoSave = async () => {
    if (!stepData[currentStep] || saving) return;

    setSaving(true);
    const result = await saveStepResponseAction(token, currentStep, stepData[currentStep]);
    setSaving(false);

    if (result.isSuccess) {
      setLastSaved(new Date());
    }
  };

  const handleStepDataChange = (data: any) => {
    setStepData((prev) => ({
      ...prev,
      [currentStep]: data,
    }));
  };

  const handleNext = async () => {
    const stepsRequiringData = ['form', 'upload', 'choice'];
    const currentStepData = stepData[currentStep];
    
    console.log('=== SUBMITTING STEP ===');
    console.log('Step index:', currentStep);
    console.log('Step type:', currentStepConfig.type);
    console.log('Step data:', currentStepData);
    console.log('All step data:', stepData);
    
    if (currentStepConfig.required && stepsRequiringData.includes(currentStepConfig.type)) {
      if (!currentStepData || Object.keys(currentStepData).length === 0) {
        toast.error("Please complete this step before continuing");
        return;
      }
      
      if (currentStepConfig.type === 'upload') {
        const hasAnyFiles = Object.values(currentStepData).some(
          (files: any) => Array.isArray(files) && files.length > 0
        );
        if (!hasAnyFiles) {
          toast.error("Please upload at least one file before continuing");
          return;
        }
      }
    }

    setSubmitting(true);
    console.log('Calling submitStepAction with:', { token, currentStep, data: currentStepData });
    const result = await submitStepAction(token, currentStep, currentStepData || {});
    console.log('Submit result:', result);
    setSubmitting(false);

    if (!result.isSuccess) {
      toast.error(result.message || "Failed to save progress");
      return;
    }

    if (!isLastStep) {
      // Navigate to next visible step
      const nextVisibleIndex = currentVisibleIndex + 1;
      if (nextVisibleIndex < visibleStepIndices.length) {
        setCurrentStep(visibleStepIndices[nextVisibleIndex]);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      // Navigate to previous visible step
      const prevVisibleIndex = currentVisibleIndex - 1;
      if (prevVisibleIndex >= 0) {
        setCurrentStep(visibleStepIndices[prevVisibleIndex]);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    const result = await completeOnboardingAction(token, stepData[currentStep]);
    setSubmitting(false);

    if (!result.isSuccess) {
      toast.error(result.message || "Failed to complete onboarding");
      return;
    }

    toast.success("Onboarding completed successfully!");

    // Reload page to show completion state
    window.location.reload();
  };

  const handleSaveAndExit = async () => {
    await autoSave();
    toast.success("Progress saved! You can return to this link anytime.");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20(6)-g1KNX9rs5vhkLkPUQzTLfKANbCNcSI.png"
              alt="Botmakers Logo"
              width={200}
              height={60}
              priority
              className="h-12 w-auto"
            />
          </div>
          <p className="text-gray-600">{project.name} - Onboarding</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentVisibleIndex + 1} of {visibleStepIndices.length}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {saving && (
                <div className="flex items-center gap-1">
                  <Cloud className="h-4 w-4 animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && !saving && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            {completionPercentage}% complete
          </p>
        </Card>

        {/* Step Content */}
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepConfig.title}
            </h2>
            <p className="text-gray-600">{currentStepConfig.description}</p>
            {currentStepConfig.estimatedMinutes && (
              <p className="text-sm text-gray-500 mt-2">
                Estimated time: {currentStepConfig.estimatedMinutes} minutes
              </p>
            )}
          </div>

          <StepRenderer
            step={currentStepConfig}
            stepIndex={currentStep}
            data={stepData[currentStep]}
            onChange={handleStepDataChange}
            token={token}
            organizationId={session.organizationId}
          />
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {!isFirstStep && (
              <Button onClick={handleBack} variant="outline" disabled={submitting}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveAndExit} variant="ghost" disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              Save & Exit
            </Button>

            {!isLastStep ? (
              <Button onClick={handleNext} disabled={submitting}>
                {submitting ? "Saving..." : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={submitting}>
                {submitting ? "Submitting..." : "Complete Onboarding"}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Your progress is automatically saved. You can return to this page anytime using the link provided.
        </p>
      </div>
    </div>
  );
}