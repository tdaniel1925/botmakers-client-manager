"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  MessageSquare,
  Mic,
  Database,
  Phone,
  CheckCircle,
  Edit,
  Info,
} from "lucide-react";

interface CampaignPreviewProps {
  config: {
    provider: string;
    campaignType: string;
    name: string;
    description?: string;
    systemPrompt: string;
    firstMessage: string;
    voicemailMessage?: string;
    agentPersonality: string;
    campaignGoal: string;
    voicePreference: string;
    mustCollect?: string[];
    setupAnswers: any;
  };
  onEdit?: () => void;
  onRegenerate?: () => Promise<void>;
  isRegenerating?: boolean;
}

export function CampaignPreview({
  config,
  onEdit,
  onRegenerate,
  isRegenerating = false,
}: CampaignPreviewProps) {
  const renderMarkdown = (text: string) => {
    return text
      .split("\n")
      .map((line) => {
        if (line.startsWith("### ")) {
          return `<h3 class="text-lg font-semibold mt-3 mb-2">${line.slice(4)}</h3>`;
        }
        if (line.startsWith("## ")) {
          return `<h2 class="text-xl font-semibold mt-3 mb-2">${line.slice(3)}</h2>`;
        }
        if (line.startsWith("# ")) {
          return `<h1 class="text-2xl font-bold mt-3 mb-2">${line.slice(2)}</h1>`;
        }
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return `<li class="ml-4 mb-1">${line.slice(2)}</li>`;
        }
        if (/^\d+\.\s/.test(line)) {
          return `<li class="ml-4 mb-1">${line.replace(/^\d+\.\s/, "")}</li>`;
        }
        if (line.trim() === "") {
          return "<br />";
        }
        return `<p class="mb-2">${line}</p>`;
      })
      .join("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Preview</h2>
          <p className="text-gray-500 mt-1">
            Review your AI-generated campaign configuration before deploying
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Answers
            </Button>
          )}
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </Button>
          )}
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This configuration was AI-generated based on your answers. You can regenerate it or
          proceed to deploy your campaign.
        </AlertDescription>
      </Alert>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Campaign Name</p>
              <p className="font-semibold">{config.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Provider</p>
              <Badge variant="outline" className="uppercase font-mono">
                {config.provider}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Campaign Type</p>
              <p className="font-semibold capitalize">{config.campaignType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Goal</p>
              <p className="font-semibold capitalize">{config.campaignGoal.replace("_", " ")}</p>
            </div>
          </div>
          {config.description && (
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1">{config.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">System Prompt</p>
              <Badge variant="secondary">{config.systemPrompt.length} characters</Badge>
            </div>
            <div
              className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(config.systemPrompt) }}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">First Message</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="italic">"{config.firstMessage}"</p>
            </div>
          </div>

          {config.voicemailMessage && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Voicemail Message</p>
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="italic">"{config.voicemailMessage}"</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-sm text-gray-500">Agent Personality</p>
              <p className="font-semibold capitalize">{config.agentPersonality}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Voice Preference</p>
              <p className="font-semibold capitalize">{config.voicePreference}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Collection */}
      {config.mustCollect && config.mustCollect.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              Data Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              The agent will collect the following information:
            </p>
            <div className="flex flex-wrap gap-2">
              {config.mustCollect.map((field) => (
                <Badge key={field} variant="outline" className="px-3 py-1">
                  {field}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-500" />
            Additional Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {config.setupAnswers?.working_hours && (
              <div>
                <p className="text-gray-500">Working Hours</p>
                <p className="font-medium capitalize">
                  {config.setupAnswers.working_hours.replace("_", " ")}
                </p>
              </div>
            )}
            {config.setupAnswers?.call_duration_target && (
              <div>
                <p className="text-gray-500">Target Call Duration</p>
                <p className="font-medium">{config.setupAnswers.call_duration_target} minutes</p>
              </div>
            )}
            {config.setupAnswers?.company_industry && (
              <div>
                <p className="text-gray-500">Industry</p>
                <p className="font-medium capitalize">{config.setupAnswers.company_industry}</p>
              </div>
            )}
            {config.setupAnswers?.company_type && (
              <div>
                <p className="text-gray-500">Company Type</p>
                <p className="font-medium capitalize">{config.setupAnswers.company_type}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Notice */}
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          <strong>Ready to deploy!</strong> Click "Create Campaign" to provision resources and go
          live, or "Save as Draft" to save this configuration for later.
        </AlertDescription>
      </Alert>
    </div>
  );
}
