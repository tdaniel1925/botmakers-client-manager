"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateBusinessDescriptionAction } from "@/actions/ai-description-actions";
import {
  CAMPAIGN_SETUP_QUESTIONS,
  getVisibleQuestions,
  validateAnswer,
  type SetupQuestion,
} from "@/types/campaign-setup-questions";
import type { CampaignSetupAnswers } from "@/types/voice-campaign-types";

interface CampaignQuestionsFormProps {
  answers: Partial<CampaignSetupAnswers>;
  onAnswersChange: (answers: Partial<CampaignSetupAnswers>) => void;
  errors: Record<string, string>;
  onErrorsChange: (errors: Record<string, string>) => void;
}

export function CampaignQuestionsForm({
  answers,
  onAnswersChange,
  errors,
  onErrorsChange,
}: CampaignQuestionsFormProps) {
  const visibleQuestions = getVisibleQuestions(answers);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiInput, setAiInput] = useState({
    companyType: "",
    industry: "",
    mainProduct: "",
    targetCustomer: "",
    keyFeatures: ""
  });
  
  const handleChange = (questionId: string, value: any, question: SetupQuestion) => {
    const newAnswers = { ...answers, [questionId]: value };
    onAnswersChange(newAnswers);
    
    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[questionId];
    
    // Validate the answer
    const error = validateAnswer(question, value);
    if (error) {
      newErrors[questionId] = error;
    }
    
    onErrorsChange(newErrors);
  };
  
  const handleAIGenerate = async () => {
    setAiGenerating(true);
    
    try {
      const result = await generateBusinessDescriptionAction(aiInput);
      
      if (result.isSuccess) {
        const question = CAMPAIGN_SETUP_QUESTIONS.find(q => q.id === "business_context");
        if (question) {
          handleChange("business_context", result.description, question);
        }
        toast.success("Business description generated!");
        setShowAIDialog(false);
        // Reset AI input
        setAiInput({
          companyType: "",
          industry: "",
          mainProduct: "",
          targetCustomer: "",
          keyFeatures: ""
        });
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate description");
    } finally {
      setAiGenerating(false);
    }
  };
  
  return (
    <>
      <div className="space-y-6">
        {/* Platform Admin: Billing Type Selection */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm">
            <div className="space-y-3">
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                Campaign Billing Type (Platform Admin Only)
              </div>
              <RadioGroup
                value={answers.billing_type || "billable"}
                onValueChange={(value: "admin_free" | "billable") => {
                  const newAnswers = { ...answers, billing_type: value };
                  onAnswersChange(newAnswers);
                }}
                className="space-y-2"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <RadioGroupItem value="billable" id="billing-billable" className="mt-0.5" />
                  <Label htmlFor="billing-billable" className="flex-1 cursor-pointer">
                    <div className="font-medium">Billable to Organization</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Campaign usage is tracked and billed to the organization's subscription. Counts against their plan limits.
                    </div>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  <RadioGroupItem value="admin_free" id="billing-admin-free" className="mt-0.5" />
                  <Label htmlFor="billing-admin-free" className="flex-1 cursor-pointer">
                    <div className="font-medium text-blue-700 dark:text-blue-300">Admin Free (No Charges)</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Platform provides this campaign for free. Usage is NOT tracked or billed. Does NOT count against plan limits. Only available to platform admins.
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </AlertDescription>
        </Alert>
        
        {visibleQuestions.map((question) => (
          <div key={question.id} className="space-y-2">
            {/* Question Label */}
            <div className="flex items-center justify-between">
              <Label htmlFor={question.id} className="text-base font-medium">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {/* AI Writer Button for business_context */}
              {question.id === "business_context" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIDialog(true)}
                  className="ml-2"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Writer
                </Button>
              )}
            </div>
            
            {/* Help Text */}
            {question.helpText && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm text-blue-900">
                  {question.helpText}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Input Field */}
            {renderField(question, answers, handleChange)}
            
            {/* Error Message */}
            {errors[question.id] && (
              <p className="text-sm text-red-500">{errors[question.id]}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* AI Description Generator Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              AI Business Description Writer
            </DialogTitle>
            <DialogDescription>
              Tell us a few things about your business and AI will write a detailed description for you
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyType">What type of company is this?</Label>
              <Input
                id="companyType"
                placeholder="e.g., SaaS company, E-commerce store, Consulting firm"
                value={aiInput.companyType}
                onChange={(e) => setAiInput({ ...aiInput, companyType: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Healthcare, Finance, Education"
                value={aiInput.industry}
                onChange={(e) => setAiInput({ ...aiInput, industry: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="mainProduct">Main product or service</Label>
              <Input
                id="mainProduct"
                placeholder="e.g., Inventory management software, Online courses"
                value={aiInput.mainProduct}
                onChange={(e) => setAiInput({ ...aiInput, mainProduct: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="targetCustomer">Who are your target customers?</Label>
              <Input
                id="targetCustomer"
                placeholder="e.g., Small businesses, Enterprise companies, Individuals"
                value={aiInput.targetCustomer}
                onChange={(e) => setAiInput({ ...aiInput, targetCustomer: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="keyFeatures">Key features or benefits (optional)</Label>
              <Textarea
                id="keyFeatures"
                placeholder="e.g., Real-time tracking, AI-powered analytics, 24/7 support"
                value={aiInput.keyFeatures}
                onChange={(e) => setAiInput({ ...aiInput, keyFeatures: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAIDialog(false)}
              disabled={aiGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAIGenerate}
              disabled={aiGenerating || !aiInput.companyType}
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Description
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function renderField(
  question: SetupQuestion,
  answers: Partial<CampaignSetupAnswers>,
  handleChange: (questionId: string, value: any, question: SetupQuestion) => void
) {
  const value = answers[question.id as keyof CampaignSetupAnswers];
  
  switch (question.type) {
    case "text":
      return (
        <Input
          id={question.id}
          type="text"
          value={(value as string) || ""}
          placeholder={question.placeholder}
          onChange={(e) => handleChange(question.id, e.target.value, question)}
          className="w-full"
        />
      );
    
    case "number":
      return (
        <Input
          id={question.id}
          type="number"
          value={(value as number) || ""}
          placeholder={question.placeholder}
          min={question.validation?.min}
          max={question.validation?.max}
          onChange={(e) => handleChange(question.id, parseInt(e.target.value) || 0, question)}
          className="w-full"
        />
      );
    
    case "textarea":
      return (
        <Textarea
          id={question.id}
          value={(value as string) || ""}
          placeholder={question.placeholder}
          onChange={(e) => handleChange(question.id, e.target.value, question)}
          className="w-full min-h-[100px]"
        />
      );
    
    case "select":
      return (
        <Select
          value={(value as string) || ""}
          onValueChange={(val) => handleChange(question.id, val, question)}
        >
          <SelectTrigger id={question.id} className="w-full">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    
    case "radio":
      return (
        <RadioGroup
          value={(value as string) || ""}
          onValueChange={(val) => handleChange(question.id, val, question)}
          className="space-y-3"
        >
          {question.options?.map((option) => (
            <div
              key={option.value}
              className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleChange(question.id, option.value, question)}
            >
              <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
              <div className="flex-1">
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="font-medium cursor-pointer"
                >
                  {option.label}
                </Label>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      );
    
    case "multi-select":
      const selectedValues = (value as string[]) || [];
      
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <div
              key={option.value}
              className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-gray-50"
            >
              <Checkbox
                id={`${question.id}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => {
                  const newValues = checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((v) => v !== option.value);
                  handleChange(question.id, newValues, question);
                }}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="font-medium cursor-pointer"
                >
                  {option.label}
                </Label>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    
    default:
      return null;
  }
}
