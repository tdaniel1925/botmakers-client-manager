"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, Send, Bot, User } from "lucide-react";
import { toast } from "@/lib/toast";
import { PhoneNumberSelector, PhoneNumberSelection } from "./phone-number-selector";
import { CampaignTestWidget } from "./campaign-test-widget";
import { GenerationPreview } from "./generation-preview";
import { 
  generateNextQuestionAction, 
  generateCampaignConfigFromConversationAction,
  type ConversationMessage, 
  type NextQuestionResponse 
} from "@/actions/ai-campaign-questions-actions";
import { createVoiceCampaignAction } from "@/actions/voice-campaign-actions";

interface AICampaignWizardProps {
  projectId: string;
  onComplete?: (campaignId: string, campaign?: any) => void;
  onCancel?: () => void;
}

type WizardStep = 'conversation' | 'phone-number' | 'generating' | 'testing';

export function AICampaignWizard({ projectId, onComplete, onCancel }: AICampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('conversation');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<NextQuestionResponse | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [campaignType, setCampaignType] = useState<'inbound' | 'outbound' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Phone number selection
  const [phoneSelection, setPhoneSelection] = useState<PhoneNumberSelection>({ source: "twilio" });
  
  // Generated campaign
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);

  // Start with first question
  useEffect(() => {
    if (conversationHistory.length === 0) {
      // Ask the very first question
      setCurrentQuestion({
        question: "Let's start building your voice AI agent! What type of campaign do you want to create?",
        fieldType: 'radio',
        options: ['Inbound - Receive customer calls', 'Outbound - Call customers proactively'],
        isComplete: false,
        reasoning: 'Campaign type determines the flow'
      });
    }
  }, []);

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !currentQuestion) return;

    setIsGeneratingQuestion(true);
    
    // Add answer to history
    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'assistant', content: currentQuestion.question },
      { role: 'user', content: currentAnswer }
    ];
    
    setConversationHistory(newHistory);
    
    // Extract campaign type if this was the first question
    if (conversationHistory.length === 0) {
      const type = currentAnswer.toLowerCase().includes('inbound') ? 'inbound' : 'outbound';
      setCampaignType(type);
    }

    // Generate next question
    const result = await generateNextQuestionAction(newHistory, campaignType || undefined);
    
    if (!result.success || !result.data) {
      toast.error('Failed to generate next question');
      setIsGeneratingQuestion(false);
      return;
    }

    setCurrentQuestion(result.data);
    setCurrentAnswer('');
    
    // Check if conversation is complete
    if (result.data.isComplete) {
      setIsConversationComplete(true);
      toast.success('Great! We have all the information we need.', {
        description: result.data.reasoning
      });
    }
    
    setIsGeneratingQuestion(false);
  };

  const handleContinueToPhoneNumber = () => {
    setCurrentStep('phone-number');
  };

  const handleGenerateFromPhoneSelection = () => {
    // Go straight to generation after phone selection
    // Contacts, SMS, email, and scheduling are configured post-creation
    handleGenerateCampaign();
  };

  const handleGenerateCampaign = async () => {
    setCurrentStep('generating');
    setError(null);

    try {
      // Generate campaign config from conversation
      toast.info('Analyzing conversation and generating agent configuration...');
      
      const configResult = await generateCampaignConfigFromConversationAction(conversationHistory);
      
      if (!configResult.success || !configResult.data) {
        throw new Error(configResult.error || 'Failed to generate configuration');
      }

      const config = configResult.data;
      
      // Create campaign
      toast.info('Creating voice campaign...');
      
      const result = await createVoiceCampaignAction({
        name: config.campaignName,
        projectId,
        type: config.campaignType,
        systemPrompt: config.systemPrompt,
        firstMessage: config.firstMessage,
        mustCollectFields: config.qualifyingQuestions,
        voiceProvider: 'vapi',
        model: 'gpt-4o-mini',
        phoneNumberSource: phoneSelection.source as any,
        preferredPhoneNumber: phoneSelection.twilioNumber,
        twilioPhoneNumber: phoneSelection.twilioNumber,
        areaCode: phoneSelection.areaCode,
        // Contacts, SMS, email, and scheduling configured post-creation
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setGeneratedCampaign(result);
      setCurrentStep('testing');
      toast.success('Campaign created successfully!');
      
    } catch (err: any) {
      console.error('Campaign generation error:', err);
      setError(err.message || 'Failed to create campaign');
      setCurrentStep('conversation');
      toast.error('Failed to create campaign', {
        description: err.message
      });
    }
  };

  const renderConversationStep = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Campaign Builder</h1>
        <p className="text-gray-600">
          I'll ask you a few questions to understand your needs
        </p>
        <Badge variant="secondary" className="mt-2">
          <Sparkles className="h-3 w-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={(conversationHistory.length / 2 / 10) * 100} className="h-2" />
        <p className="text-sm text-gray-500 text-center">
          Question {Math.floor(conversationHistory.length / 2) + 1} of ~8-10
        </p>
      </div>

      {/* Conversation History */}
      <Card>
        <CardContent className="pt-6 space-y-4 max-h-[400px] overflow-y-auto">
          {conversationHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-3 text-blue-500" />
              <p>Let's get started building your voice agent!</p>
            </div>
          )}
          
          {conversationHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  msg.role === 'assistant'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {msg.content}
              </div>
              
              {msg.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && !isConversationComplete && (
        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
                
                {currentQuestion.fieldType === 'text' && (
                  <Input
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                    autoFocus
                  />
                )}
                
                {currentQuestion.fieldType === 'textarea' && (
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="min-h-[100px]"
                    autoFocus
                  />
                )}
                
                {currentQuestion.fieldType === 'radio' && (
                  <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                    {currentQuestion.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion.fieldType === 'select' && (
                  <Select value={currentAnswer} onValueChange={setCurrentAnswer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isGeneratingQuestion}
                  className="mt-4"
                >
                  {isGeneratingQuestion ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Message */}
      {isConversationComplete && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription>
            <div>
              <p className="font-semibold text-green-900 mb-1">All set!</p>
              <p className="text-sm text-green-700">{currentQuestion?.reasoning}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        {isConversationComplete && (
          <Button onClick={handleContinueToPhoneNumber}>
            Continue to Phone Setup
          </Button>
        )}
      </div>
    </div>
  );

  const renderPhoneNumberStep = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Phone Number</h2>
        <p className="text-gray-600">Select or provision a phone number for your campaign</p>
      </div>
      
      <PhoneNumberSelector
        value={phoneSelection}
        onChange={setPhoneSelection}
        provider="twilio"
      />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('conversation')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleGenerateFromPhoneSelection}>
          Continue
        </Button>
      </div>
    </div>
  );


  const renderGeneratingStep = () => (
    <div className="text-center py-12 space-y-4">
      <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto" />
      <div>
        <h3 className="text-xl font-semibold mb-2">Creating Your AI Agent</h3>
        <p className="text-gray-600">Analyzing conversation and building configuration...</p>
      </div>
      <div className="space-y-2 text-sm text-gray-500 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Analyzing your answers with GPT-4</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Generating custom system prompt</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Creating voice agent</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Provisioning phone number</span>
        </div>
      </div>
    </div>
  );

  const renderTestingStep = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertDescription>
          <p className="font-semibold text-green-900">Campaign Created Successfully!</p>
          <p className="text-sm text-green-700">Your AI voice agent is ready to test</p>
        </AlertDescription>
      </Alert>

      {generatedCampaign && (
        <>
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
        </>
      )}

      <div className="flex justify-center">
        <Button 
          onClick={() => {
            if (generatedCampaign?.campaign?.id) {
              onComplete?.(generatedCampaign.campaign.id, generatedCampaign.campaign);
            }
          }}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Complete Setup
        </Button>
      </div>
    </div>
  );

  return (
    <div className="py-8">
      {currentStep === 'conversation' && renderConversationStep()}
      {currentStep === 'phone-number' && renderPhoneNumberStep()}
      {currentStep === 'generating' && renderGeneratingStep()}
      {currentStep === 'testing' && renderTestingStep()}

      {error && (
        <Alert variant="destructive" className="max-w-3xl mx-auto mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

