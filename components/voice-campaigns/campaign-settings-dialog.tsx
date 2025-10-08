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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateCampaignAction, updateCampaignConfigAction, verifyPhoneWebhookAction } from "@/actions/voice-campaign-actions";
import type { SelectVoiceCampaign } from "@/db/schema";

interface CampaignSettingsDialogProps {
  campaign: SelectVoiceCampaign | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function CampaignSettingsDialog({
  campaign,
  open,
  onClose,
  onSaved,
}: CampaignSettingsDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [voicemailMessage, setVoicemailMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  
  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description || "");
      setIsActive(campaign.isActive || false);
      setSystemPrompt(campaign.systemPrompt || "");
      setFirstMessage(campaign.firstMessage || "");
      setVoicemailMessage(campaign.voicemailMessage || "");
    }
  }, [campaign]);
  
  const handleSave = async () => {
    if (!campaign) return;
    
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const result = await updateCampaignAction(campaign.id, {
        name,
        description,
        isActive,
      });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Campaign updated successfully");
        onSaved?.();
        onClose();
      }
    } catch (error) {
      toast.error("Failed to update campaign");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveConfig = async () => {
    if (!campaign) return;
    
    if (!systemPrompt.trim() || !firstMessage.trim()) {
      toast.error("System prompt and first message are required");
      return;
    }
    
    setIsSavingConfig(true);
    
    try {
      const result = await updateCampaignConfigAction(campaign.id, {
        systemPrompt,
        firstMessage,
        voicemailMessage,
      });
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.warning) {
        toast.warning(result.warning);
        onSaved?.();
      } else {
        toast.success("✅ Configuration updated and synced to AI agent successfully!");
        onSaved?.();
      }
    } catch (error) {
      toast.error("Failed to update configuration");
    } finally {
      setIsSavingConfig(false);
    }
  };
  
  const handleVerifyPhone = async () => {
    if (!campaign) return;
    
    setIsVerifyingPhone(true);
    
    try {
      const result = await verifyPhoneWebhookAction(campaign.id);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.alreadyCorrect) {
        toast.success(result.message, {
          description: `Webhook: ${result.details?.currentWebhook}`,
          duration: 5000,
        });
      } else if (result.wasUpdated) {
        toast.success(result.message, {
          description: `Updated from: ${result.details?.oldWebhook}\nTo: ${result.details?.newWebhook}`,
          duration: 6000,
        });
      }
    } catch (error) {
      toast.error("Failed to verify phone webhook");
    } finally {
      setIsVerifyingPhone(false);
    }
  };
  
  if (!campaign) return null;
  
  const setupAnswers = campaign.setupAnswers as any;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Settings</DialogTitle>
          <DialogDescription>
            View and update your campaign configuration
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
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
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is-active" className="text-base">Campaign Active</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Toggle to enable or disable this campaign
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                These are basic settings you can modify. More advanced settings like prompts
                and voice configuration require recreating the campaign.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="system-prompt" className="text-sm font-semibold">
                  System Prompt <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  The core instructions that define how the AI agent behaves
                </p>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Enter system prompt..."
                />
              </div>
              
              <div>
                <Label htmlFor="first-message" className="text-sm font-semibold">
                  First Message <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  The greeting message when the agent answers or initiates a call
                </p>
                <Textarea
                  id="first-message"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Hi, this is [Agent Name] from [Company Name]..."
                />
              </div>
              
              <div>
                <Label htmlFor="voicemail-message" className="text-sm font-semibold">
                  Voicemail Message
                </Label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  Message to leave if the call goes to voicemail
                </p>
                <Textarea
                  id="voicemail-message"
                  value={voicemailMessage}
                  onChange={(e) => setVoicemailMessage(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Hi, this is [Agent Name] from [Company Name]..."
                />
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  When you save these changes, they will be automatically synced to the AI phone agent.
                  Changes take effect immediately for new calls.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="min-w-[150px]"
                >
                  {isSavingConfig ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving & Syncing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Provider</Label>
                <p className="font-mono font-semibold mt-1 uppercase">{campaign.provider}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Campaign Type</Label>
                <p className="font-semibold mt-1 capitalize">{campaign.campaignType}</p>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Phone Number</Label>
                    <p className="font-mono font-semibold mt-1">{campaign.phoneNumber || "Not assigned"}</p>
                  </div>
                  {campaign.provider === "vapi" && campaign.phoneNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyPhone}
                      disabled={isVerifyingPhone}
                      className="ml-4"
                    >
                      {isVerifyingPhone ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verify Phone Webhook
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {campaign.provider === "vapi" && campaign.phoneNumber && (
                  <Alert className="mt-2 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-xs text-blue-900">
                      This button checks if your Twilio number is correctly configured to route calls to Vapi. 
                      If it's not, it will automatically update it for you.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Provider Agent ID</Label>
                <p className="font-mono text-xs mt-1 break-all">
                  {campaign.providerAssistantId || "N/A"}
                </p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Campaign Goal</Label>
                <p className="mt-1 capitalize">{campaign.campaignGoal?.replace('_', ' ')}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Agent Personality</Label>
                <p className="mt-1 capitalize">{campaign.agentPersonality}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Voice Preference</Label>
                <p className="mt-1 capitalize">{setupAnswers?.voice_preference || "Auto"}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Target Call Duration</Label>
                <p className="mt-1">{setupAnswers?.call_duration_target || 5} minutes</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Working Hours</Label>
                <p className="mt-1 capitalize">{setupAnswers?.working_hours?.replace('_', ' ') || "24/7"}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Created At</Label>
                <p className="mt-1">{new Date(campaign.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Last Updated</Label>
                <p className="mt-1">{new Date(campaign.updatedAt).toLocaleString()}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <p className="mt-1 capitalize">{campaign.status}</p>
              </div>
            </div>
            
            {setupAnswers?.must_collect && setupAnswers.must_collect.length > 0 && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-semibold mb-2 block">Data Collection Fields</Label>
                <div className="flex flex-wrap gap-2">
                  {setupAnswers.must_collect.map((field: string) => (
                    <div key={field} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {field.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                Saving...
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
