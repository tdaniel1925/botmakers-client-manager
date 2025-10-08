"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Info, Settings, MessageSquare, Mic, Database, Code, Check, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "@/lib/toast";
import { PromptEditor } from "./editors/prompt-editor";
import { ScheduleConfigForm, type ScheduleConfig } from "./schedule-config-form";
import { updateCampaignConfigAction, verifyPhoneWebhookAction } from "@/actions/voice-campaign-actions";
import type { SelectVoiceCampaign } from "@/db/schema";

interface CampaignSettingsDialogEnhancedProps {
  campaign: SelectVoiceCampaign | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isPlatformAdmin?: boolean;
}

export function CampaignSettingsDialogEnhanced({
  campaign,
  open,
  onClose,
  onSaved,
  isPlatformAdmin = false,
}: CampaignSettingsDialogEnhancedProps) {
  // Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState<"inbound" | "outbound">("inbound");
  const [isActive, setIsActive] = useState(true);
  const [campaignGoal, setCampaignGoal] = useState("");
  
  // Agent Config
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [voicemailMessage, setVoicemailMessage] = useState("");
  const [agentPersonality, setAgentPersonality] = useState("");
  
  // Voice Settings
  const [voicePreference, setVoicePreference] = useState("auto");
  
  // Data Collection
  const [mustCollect, setMustCollect] = useState<string[]>([]);
  const [newCollectField, setNewCollectField] = useState("");
  
  // Schedule Configuration
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
  
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  useEffect(() => {
    if (campaign) {
      const setupAnswers = campaign.setupAnswers as any;
      
      // Basic Info
      setName(campaign.name);
      setDescription(campaign.description || "");
      setCampaignType(campaign.campaignType as "inbound" | "outbound");
      setIsActive(campaign.isActive || false);
      setCampaignGoal(campaign.campaignGoal || "");
      
      // Agent Config
      setSystemPrompt(campaign.systemPrompt || "");
      setFirstMessage(campaign.firstMessage || "");
      setVoicemailMessage(campaign.voicemailMessage || "");
      setAgentPersonality(campaign.agentPersonality || "professional");
      
      // Voice Settings
      setVoicePreference(setupAnswers?.voice_preference || "auto");
      
      // Data Collection
      setMustCollect(setupAnswers?.must_collect || []);
      
      // Schedule Configuration
      if (campaign.scheduleConfig) {
        setScheduleConfig(campaign.scheduleConfig as ScheduleConfig);
      }
    }
  }, [campaign]);
  
  const handleSave = async () => {
    if (!campaign) return;
    
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    
    if (!systemPrompt.trim()) {
      toast.error("System prompt is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const result = await updateCampaignConfigAction(campaign.id, {
        name,
        description,
        campaignType,
        isActive,
        campaignGoal,
        systemPrompt,
        firstMessage,
        voicemailMessage,
        agentPersonality,
        voicePreference,
        mustCollect,
        scheduleConfig,
      });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Campaign updated successfully!");
        onSaved?.();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update campaign");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddCollectField = () => {
    if (newCollectField.trim() && !mustCollect.includes(newCollectField.trim())) {
      setMustCollect([...mustCollect, newCollectField.trim()]);
      setNewCollectField("");
    }
  };
  
  const handleRemoveCollectField = (field: string) => {
    setMustCollect(mustCollect.filter((f) => f !== field));
  };
  
  const handleVerifyWebhook = async () => {
    if (!campaign) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyPhoneWebhookAction(campaign.id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.alreadyCorrect) {
        toast.success(result.message || "✅ Webhook is correctly configured!");
      } else if (result.wasUpdated) {
        toast.success(result.message || "✅ Webhook updated successfully!");
      } else {
        toast.success("✅ Webhook verified!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify webhook");
    } finally {
      setIsVerifying(false);
    }
  };
  
  if (!campaign) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Campaign Settings</DialogTitle>
          <DialogDescription>
            Edit all aspects of your voice campaign configuration
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">
              <Settings className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="agent">
              <MessageSquare className="h-4 w-4 mr-2" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Code className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Voice Campaign"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Campaign description..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-type">Campaign Type *</Label>
              <Select value={campaignType} onValueChange={(value: any) => setCampaignType(value)}>
                <SelectTrigger id="campaign-type">
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound (Receive Calls)</SelectItem>
                  <SelectItem value="outbound">Outbound (Make Calls)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {campaignType === "inbound" && "This campaign will only receive incoming calls"}
                {campaignType === "outbound" && "This campaign will only make outbound calls with smart scheduling"}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal">Campaign Goal</Label>
              <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                <SelectTrigger id="goal">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_qualification">Lead Qualification</SelectItem>
                  <SelectItem value="appointment_booking">Appointment Booking</SelectItem>
                  <SelectItem value="customer_support">Customer Support</SelectItem>
                  <SelectItem value="sales_followup">Sales Follow-up</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is-active" className="text-base">Campaign Active</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enable or disable this campaign
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </TabsContent>
          
          {/* Tab 2: Agent Config */}
          <TabsContent value="agent" className="space-y-6 mt-4">
            <PromptEditor
              value={systemPrompt}
              onChange={setSystemPrompt}
              label="System Prompt"
              placeholder="Enter the AI agent's system prompt..."
              helpText="This defines how your AI agent will behave and respond to callers."
              maxLength={4000}
              minLength={50}
              showAIRegenerate={false}
            />
            
            <div className="space-y-2">
              <Label htmlFor="first-message">First Message *</Label>
              <Textarea
                id="first-message"
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="Hello! How can I help you today?"
                rows={2}
              />
              <p className="text-sm text-gray-500">
                The initial greeting the agent will use when answering calls
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="voicemail">Voicemail Message</Label>
              <Textarea
                id="voicemail"
                value={voicemailMessage}
                onChange={(e) => setVoicemailMessage(e.target.value)}
                placeholder="You've reached [Company]. Please leave a message..."
                rows={2}
              />
              <p className="text-sm text-gray-500">
                Message to play if the agent needs to leave a voicemail
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="personality">Agent Personality</Label>
              <Select value={agentPersonality} onValueChange={setAgentPersonality}>
                <SelectTrigger id="personality">
                  <SelectValue placeholder="Select personality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          {/* Tab 3: Voice Settings */}
          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="voice-pref">Voice Preference</Label>
              <Select value={voicePreference} onValueChange={setVoicePreference}>
                <SelectTrigger id="voice-pref">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Match Personality)</SelectItem>
                  <SelectItem value="male">Male Voice</SelectItem>
                  <SelectItem value="female">Female Voice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Voice speed, pitch, and specific voice selection depend on your provider
                ({campaign.provider.toUpperCase()}). Advanced voice settings can be configured
                in the provider's dashboard.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm text-gray-500">Provider</Label>
                <p className="font-mono font-semibold mt-1 uppercase">{campaign.provider}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Agent ID</Label>
                <p className="font-mono text-xs mt-1 break-all">
                  {campaign.providerAssistantId}
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab 4: Data Collection */}
          <TabsContent value="data" className="space-y-4 mt-4">
            <div>
              <Label className="text-base font-semibold">Fields to Collect</Label>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Specify what information the agent should collect from callers
              </p>
              
              <div className="flex gap-2 mb-4">
                <Input
                  value={newCollectField}
                  onChange={(e) => setNewCollectField(e.target.value)}
                  placeholder="e.g., email, phone number, company name"
                  onKeyPress={(e) => e.key === "Enter" && handleAddCollectField()}
                />
                <Button onClick={handleAddCollectField} variant="outline">
                  Add Field
                </Button>
              </div>
              
              {mustCollect.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mustCollect.map((field) => (
                    <div
                      key={field}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {field}
                      <button
                        onClick={() => handleRemoveCollectField(field)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                  No fields specified. Add fields above.
                </div>
              )}
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                The agent will attempt to collect these fields during the conversation.
                Make sure your system prompt instructs the agent on how to collect this data.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          {/* Tab 5: Schedule Configuration */}
          <TabsContent value="schedule" className="space-y-4 mt-4">
            <ScheduleConfigForm
              value={scheduleConfig}
              onChange={setScheduleConfig}
              campaignType={campaignType}
            />
          </TabsContent>
          
          {/* Tab 6: Advanced */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Campaign Type</Label>
                <p className="font-semibold mt-1 capitalize">{campaign.campaignType}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Phone Number</Label>
                <p className="font-mono font-semibold mt-1">{campaign.phoneNumber || "Not assigned"}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Webhook ID</Label>
                <p className="font-mono text-xs mt-1 break-all">{campaign.webhookId}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <p className="mt-1 capitalize">{campaign.status}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Created At</Label>
                <p className="mt-1 text-sm">{new Date(campaign.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Last Updated</Label>
                <p className="mt-1 text-sm">{new Date(campaign.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Verify Webhook Button - Platform Admin Only */}
            {isPlatformAdmin && campaign.provider === "vapi" && campaign.phoneNumber?.startsWith("+") && (
              <div className="border-t pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Phone Number Webhook Configuration</h4>
                    <p className="text-sm text-gray-600">
                      For Twilio numbers, ensure the webhook is correctly pointing to Vapi's inbound call endpoint.
                      This fixes "Application Error" issues when calling the number.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleVerifyWebhook}
                  disabled={isVerifying}
                  variant="outline"
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying Webhook...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Verify & Fix Phone Webhook
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-900">
                <strong>Note:</strong> Changes to agent configuration will sync to {campaign.provider.toUpperCase()}.
                Some providers may take a few minutes to apply updates.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving & Syncing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
