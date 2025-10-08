"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Phone, Webhook, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SelectVoiceCampaign } from "@/db/schema";

interface GenerationPreviewProps {
  campaign: SelectVoiceCampaign;
  phoneNumber: string;
  provider: string;
}

export function GenerationPreview({ campaign, phoneNumber, provider }: GenerationPreviewProps) {
  const setupAnswers = campaign.setupAnswers as any;
  const aiConfig = campaign.aiGeneratedConfig as any;
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Format phone number for display: +17185212804 -> (718) 521-2804
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      const areaCode = cleaned.slice(1, 4);
      const prefix = cleaned.slice(4, 7);
      const lineNumber = cleaned.slice(7, 11);
      return `(${areaCode}) ${prefix}-${lineNumber}`;
    }
    return phone;
  };
  
  return (
    <div className="space-y-4">
      {/* Prominent Phone Number Success Box */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-700 uppercase mb-1">
                  Your Campaign Phone Number
                </h3>
                <div className="text-3xl font-bold text-blue-900 font-mono mb-1">
                  {formatPhoneNumber(phoneNumber)}
                </div>
                <p className="text-sm text-blue-600">
                  Call this number to test your AI agent now!
                </p>
              </div>
            </div>
            <Button
              onClick={() => copyToClipboard(phoneNumber, "Phone number")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Number
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-2">Campaign Overview</h3>
        <p className="text-sm text-gray-600">
          Review the AI-generated configuration for your voice agent
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>AI Agent Type</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm bg-blue-100 text-blue-700 border-blue-300">
              AI AGENT
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Campaign Type</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>
              {campaign.campaignType.charAt(0).toUpperCase() + campaign.campaignType.slice(1)}
            </Badge>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Generated Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <CardTitle>AI-Generated System Prompt</CardTitle>
          </div>
          <CardDescription>
            This is what guides your AI agent's behavior and personality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {campaign.systemPrompt}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => copyToClipboard(campaign.systemPrompt || "", "System prompt")}
          >
            <Copy className="h-3 w-3 mr-2" />
            Copy Prompt
          </Button>
        </CardContent>
      </Card>
      
      {/* First Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">First Message</CardTitle>
          <CardDescription>
            What the agent says when answering/making calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm italic">"{campaign.firstMessage}"</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Voicemail Message */}
      {campaign.voicemailMessage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voicemail Message</CardTitle>
            <CardDescription>
              What the agent says if call goes to voicemail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm italic">"{campaign.voicemailMessage}"</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Goal:</span>
              <p className="mt-1 capitalize">{campaign.campaignGoal?.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Personality:</span>
              <p className="mt-1 capitalize">{campaign.agentPersonality}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Voice Preference:</span>
              <p className="mt-1 capitalize">{setupAnswers.voice_preference}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Target Duration:</span>
              <p className="mt-1">{setupAnswers.call_duration_target} minutes</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Working Hours:</span>
              <p className="mt-1 capitalize">{setupAnswers.working_hours?.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Status:</span>
              <Badge variant={campaign.isActive ? "default" : "secondary"}>
                {campaign.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Collection */}
      {setupAnswers.must_collect && setupAnswers.must_collect.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Collection</CardTitle>
            <CardDescription>
              Information the agent will collect from callers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {setupAnswers.must_collect.map((item: string) => (
                <Badge key={item} variant="outline">
                  {item.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
