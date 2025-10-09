"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle, X, RotateCcw } from "lucide-react";
import { toast } from "@/lib/toast";
import { CampaignQuestionsForm } from "./campaign-questions-form";
import { PhoneNumberSelector, PhoneNumberSelection } from "./phone-number-selector";
import { GenerationPreview } from "./generation-preview";
import { CampaignTestWidget } from "./campaign-test-widget";
import { ScheduleConfigForm, type ScheduleConfig } from "./schedule-config-form";
import { CampaignPreviewStep } from "./campaign-preview-step";
import { createVoiceCampaignAction } from "@/actions/voice-campaign-actions";
import { validateAllAnswers } from "@/types/campaign-setup-questions";
import {
  saveWizardProgress,
  loadWizardProgress,
  clearWizardProgress,
  getProgressAge,
} from "@/lib/wizard-storage";
import type { CampaignSetupAnswers } from "@/types/voice-campaign-types";

interface CampaignWizardProps {
  projectId: string;
  onComplete?: (campaignId: string, campaign?: any) => void;
  onCancel?: () => void;
}

type WizardStep = "questions" | "preview" | "generating" | "testing" | "complete";

export function CampaignWizard({ projectId, onComplete, onCancel }: CampaignWizardProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<WizardStep>("questions");
  const [selectedProvider] = useState<"vapi">("vapi"); // Always use Vapi
  const [answers, setAnswers] = useState<Partial<CampaignSetupAnswers>>({});
  const [phoneSelection, setPhoneSelection] = useState<PhoneNumberSelection>({ source: "vapi" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [savedProgressAge, setSavedProgressAge] = useState<string | null>(null);
  
  // Schedule configuration
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    callDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    callWindows: [
      { start: "09:00", end: "12:00", label: "Morning" },
      { start: "13:00", end: "17:00", label: "Afternoon" },
    ],
    respectTimezones: true,
    maxAttemptsPerContact: 3,
    timeBetweenAttempts: 24,
    maxConcurrentCalls: 10,
  });
  
  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadWizardProgress(projectId);
    if (savedProgress && savedProgress.currentStep !== "generating" && savedProgress.currentStep !== "testing") {
      setShowResumeBanner(true);
      setSavedProgressAge(getProgressAge(projectId));
    }
  }, [projectId]);
  
  // Auto-save progress whenever state changes
  useEffect(() => {
    if (currentStep !== "generating" && currentStep !== "testing" && currentStep !== "complete") {
      saveWizardProgress(projectId, selectedProvider, currentStep, answers);
    }
  }, [projectId, selectedProvider, currentStep, answers]);
  
  // Resume from saved progress
  const handleResumeProgress = () => {
    const savedProgress = loadWizardProgress(projectId);
    if (savedProgress) {
      setSelectedProvider(savedProgress.provider);
      setAnswers(savedProgress.answers);
      setCurrentStep(savedProgress.currentStep);
      setShowResumeBanner(false);
      toast.success("Progress restored!");
    }
  };
  
  // Dismiss resume banner
  const handleDismissResume = () => {
    setShowResumeBanner(false);
    clearWizardProgress(projectId);
  };
  
  const steps = [
    { id: "questions", label: "Setup Campaign", description: "Configure your AI agent" },
    { id: "preview", label: "Review & Confirm", description: "Preview your configuration" },
    { id: "generating", label: "AI Generation", description: "Creating your agent" },
    { id: "testing", label: "Test & Deploy", description: "Test and activate" },
  ];
  
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  const handleNextFromQuestions = () => {
    // Validate all answers
    const validationErrors = validateAllAnswers(answers);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before continuing");
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    // Validate phone number selection
    if (phoneSelection.source === "twilio" && !phoneSelection.twilioNumber) {
      toast.error("Please select a Twilio phone number");
      return;
    }
    
    // All valid, go to preview step
    setCurrentStep("preview");
  };

  const handleNextFromPreview = () => {
    // Generate campaign after preview
    handleGenerateCampaign();
  };
  
  const handleGenerateCampaign = async () => {
    if (!selectedProvider) return;
    
    setCurrentStep("generating");
    setError(null);
    
    startTransition(async () => {
      try {
        // Merge phone selection and schedule config into answers
        const finalAnswers = {
          ...answers,
          phone_source: phoneSelection.source,
          twilio_phone_number: phoneSelection.twilioNumber,
          area_code: phoneSelection.areaCode,
          schedule_config: scheduleConfig
        } as CampaignSetupAnswers;
        
        const result = await createVoiceCampaignAction(
          projectId,
          selectedProvider,
          finalAnswers
        );
        
        if (result.error) {
          setError(result.error);
          setCurrentStep("questions");
          toast.error("Error Occurred", {
            description: result.error || "Sorry, please try again later.",
            action: {
              label: "Try again",
              onClick: () => handleGenerateCampaign()
            }
          });
        } else {
          setGeneratedCampaign(result);
          setCurrentStep("testing");
          toast.success("Campaign created successfully!", {
            description: "Your AI agent is ready to start making calls."
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to create campaign");
        setCurrentStep("questions");
        toast.error("Error Occurred", {
          description: err.message || "Failed to create campaign. Please try again.",
          action: {
            label: "Try again",
            onClick: () => handleGenerateCampaign()
          }
        });
      }
    });
  };
  
  const handleComplete = () => {
    if (generatedCampaign?.campaign?.id) {
      // Clear saved progress on completion
      clearWizardProgress(projectId);
      onComplete?.(generatedCampaign.campaign.id, generatedCampaign.campaign);
    }
  };
  
  const handleCancel = () => {
    // Optionally keep progress on cancel for now
    // clearWizardProgress(projectId);
    onCancel?.();
  };
  
  const handleBack = () => {
    const stepOrder: WizardStep[] = ["questions", "preview", "generating", "testing"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Resume Banner */}
      {showResumeBanner && (
        <Alert className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Resume Your Campaign?</h4>
                <p className="text-sm text-blue-700">
                  You have unsaved progress from {savedProgressAge}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismissResume}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <X className="h-4 w-4 mr-1" />
                Start Fresh
              </Button>
              <Button
                size="sm"
                onClick={handleResumeProgress}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Resume
              </Button>
            </div>
          </div>
        </Alert>
      )}
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Create Voice Campaign</h1>
        <p className="text-gray-600">
          Set up an AI voice agent in minutes with our guided wizard
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                idx <= currentStepIndex ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div className="text-sm font-medium">{step.label}</div>
              <div className="text-xs">{step.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === "questions" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Campaign Setup Questions</h3>
                <p className="text-sm text-gray-600">
                  Answer these questions to help our AI create the perfect voice agent for you
                </p>
              </div>
              <CampaignQuestionsForm
                answers={answers}
                onAnswersChange={setAnswers}
                errors={errors}
                onErrorsChange={setErrors}
              />
              
              {/* Phone Number Selection - Simplified for Vapi Auto-Buy */}
              <div className="border-t pt-6">
                <PhoneNumberSelector
                  value={phoneSelection}
                  onChange={setPhoneSelection}
                  provider="vapi"
                />
              </div>
              
              {/* Call Scheduling Configuration */}
              {answers.campaign_type === "outbound" && (
                <div className="border-t pt-6">
                  <ScheduleConfigForm
                    value={scheduleConfig}
                    onChange={setScheduleConfig}
                    campaignType="outbound"
                  />
                </div>
              )}
            </div>
          )}
          
          {currentStep === "preview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Review Your Configuration</h3>
                <p className="text-sm text-gray-600">
                  Please review the details below before creating your voice agent
                </p>
              </div>
              <CampaignPreviewStep
                answers={answers}
                phoneSelection={phoneSelection}
                scheduleConfig={scheduleConfig}
              />
            </div>
          )}
          
          {currentStep === "generating" && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Creating Your Voice Agent</h3>
                <p className="text-gray-600">This will take 30-60 seconds...</p>
              </div>
              <div className="space-y-2 text-sm text-gray-500 max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>Generating AI configuration with GPT-4</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>Creating AI voice agent</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>Provisioning phone number</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>Setting up webhooks</span>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === "testing" && generatedCampaign && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Campaign Created Successfully!</h3>
                    <p className="text-sm text-green-700">
                      Your voice agent is ready. Test it below before going live.
                    </p>
                  </div>
                </div>
              </div>
              
              <GenerationPreview
                campaign={generatedCampaign.campaign}
                phoneNumber={generatedCampaign.phoneNumber}
                provider="vapi"
              />
              
              <CampaignTestWidget
                campaignId={generatedCampaign.campaign.id}
                phoneNumber={generatedCampaign.phoneNumber}
                provider="vapi"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === "questions" ? onCancel : handleBack}
          disabled={isPending || currentStep === "generating"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === "questions" ? "Cancel" : "Back"}
        </Button>
        
        <div className="space-x-2">
          {currentStep === "questions" && (
            <Button onClick={handleNextFromQuestions} disabled={isPending}>
              Next: Review
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === "preview" && (
            <Button onClick={handleNextFromPreview} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate with AI
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
          
          {currentStep === "testing" && (
            <Button onClick={handleComplete}>
              Complete Setup
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
