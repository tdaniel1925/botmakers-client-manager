"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  Bot,
  Clock,
  Target,
  Sparkles,
  DollarSign,
  Calendar,
  Info,
  CheckCircle2,
  AlertTriangle,
  Upload,
  MessageSquare,
  Mail
} from "lucide-react";
import type { CampaignSetupAnswers } from "@/types/voice-campaign-types";
import type { ContactsScheduleConfig } from "./contacts-schedule-config";

interface CampaignPreviewStepProps {
  answers: Partial<CampaignSetupAnswers>;
  phoneSelection: { source: string; twilioNumber?: string; areaCode?: string };
  scheduleConfig?: any; // Legacy support
  contactsScheduleConfig?: ContactsScheduleConfig;
}

export function CampaignPreviewStep({ answers, phoneSelection, scheduleConfig, contactsScheduleConfig }: CampaignPreviewStepProps) {
  // Use contactsScheduleConfig if provided, otherwise fall back to legacy scheduleConfig
  const actualScheduleConfig = contactsScheduleConfig?.scheduleConfig || scheduleConfig;
  // Calculate estimated costs
  const estimateCosts = () => {
    const avgCallDuration = 3; // 3 minutes average
    const costPerMinute = 0.02; // $0.02/min for Vapi
    const estimatedCallsPerMonth = answers.campaign_type === "outbound" ? 500 : 200;
    
    const costPerCall = avgCallDuration * costPerMinute;
    const monthlyEstimate = costPerCall * estimatedCallsPerMonth;
    
    return {
      perCall: costPerCall.toFixed(2),
      perMonth: monthlyEstimate.toFixed(2),
      estimatedCalls: estimatedCallsPerMonth
    };
  };

  const costs = estimateCosts();

  return (
    <div className="space-y-6">
      {/* Cost Estimate Banner */}
      <Alert className="bg-blue-50 border-blue-200">
        <DollarSign className="h-5 w-5 text-blue-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">Estimated Costs</p>
              <p className="text-sm text-blue-700">
                ~${costs.perCall}/call • ~${costs.perMonth}/month ({costs.estimatedCalls} calls)
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              Based on 3 min avg
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Campaign Name</p>
              <p className="font-semibold">{answers.campaign_name || "Untitled Campaign"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agent Name</p>
              <p className="font-semibold">{answers.agent_name || "AI Assistant"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="font-semibold">{answers.company_name || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Campaign Type</p>
              <Badge variant="outline" className="capitalize">
                {answers.campaign_type || "inbound"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Agent Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Agent Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Campaign Goal</p>
              <p className="font-semibold capitalize">{answers.campaign_goal?.replace(/_/g, " ") || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agent Personality</p>
              <p className="font-semibold capitalize">{answers.agent_personality || "Professional"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Voice Preference</p>
              <p className="font-semibold capitalize">{answers.voice_preference || "Auto"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Model</p>
              <p className="font-semibold">{answers.model || "GPT-4o"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Phone Number */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-green-600" />
              Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Source</p>
              <Badge variant="outline" className="capitalize">
                {phoneSelection.source === "vapi" ? "Vapi (Auto-provision)" : "Twilio"}
              </Badge>
            </div>
            {phoneSelection.source === "twilio" && phoneSelection.twilioNumber && (
              <div>
                <p className="text-sm text-gray-600">Selected Number</p>
                <p className="font-mono font-semibold">{phoneSelection.twilioNumber}</p>
              </div>
            )}
            {phoneSelection.areaCode && (
              <div>
                <p className="text-sm text-gray-600">Area Code</p>
                <p className="font-semibold">{phoneSelection.areaCode}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Availability</p>
              <p className="font-semibold capitalize">{answers.working_hours?.replace(/_/g, " ") || "24/7"}</p>
            </div>
            {actualScheduleConfig && answers.campaign_type === "outbound" && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Call Days</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {actualScheduleConfig.callDays?.map((day: string) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Attempts</p>
                  <p className="font-semibold">{actualScheduleConfig.maxAttemptsPerContact || 3} per contact</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contacts, SMS, and Email Automation (if configured) */}
      {contactsScheduleConfig && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-blue-600" />
                Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactsScheduleConfig.contacts && contactsScheduleConfig.contacts.length > 0 ? (
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-blue-600">{contactsScheduleConfig.contacts.length}</p>
                  <p className="text-sm text-gray-600 mt-1">contacts uploaded</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No contacts uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* SMS Automation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
                SMS Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Follow-ups</p>
                {contactsScheduleConfig.smsSettings?.followUps?.enabled ? (
                  <Badge variant="default" className="bg-green-600">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Notifications</p>
                {contactsScheduleConfig.smsSettings?.notifications?.enabled ? (
                  <Badge variant="default" className="bg-green-600">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </div>
              {contactsScheduleConfig.smsSettings?.notifications?.enabled && 
               contactsScheduleConfig.smsSettings?.notifications?.triggers?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Triggers:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contactsScheduleConfig.smsSettings.notifications.triggers.map((trigger) => (
                      <Badge key={trigger} variant="outline" className="text-xs">
                        {trigger.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Automation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                Email Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Follow-ups</p>
                {contactsScheduleConfig.emailSettings?.followUps?.enabled ? (
                  <Badge variant="default" className="bg-blue-600">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Notifications</p>
                {contactsScheduleConfig.emailSettings?.notifications?.enabled ? (
                  <Badge variant="default" className="bg-blue-600">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </div>
              {contactsScheduleConfig.emailSettings?.notifications?.enabled && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Frequency:</p>
                  <Badge variant="outline" className="text-xs mt-1 capitalize">
                    {contactsScheduleConfig.emailSettings.notifications.frequency}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Goal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Business Context</p>
            <p className="text-sm bg-gray-50 p-3 rounded-lg border">
              {answers.business_context || "No business context provided"}
            </p>
          </div>
          
          {answers.key_info_to_collect && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Information to Collect</p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                {answers.key_info_to_collect}
              </p>
            </div>
          )}
          
          {answers.follow_up_triggers && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Follow-up Triggers</p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                {answers.follow_up_triggers}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Alert>
        <Info className="h-5 w-5" />
        <AlertDescription>
          <p className="font-semibold mb-2">What happens next:</p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              AI will generate a personalized system prompt
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Phone number will be provisioned and configured
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Voice agent will be created with your specified settings
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              You'll be able to test the agent before going live
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Validation Warnings */}
      {(!answers.campaign_name || !answers.agent_name) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-semibold mb-1">Missing Required Information</p>
            <p className="text-sm">
              Please provide a campaign name and agent name before proceeding.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

