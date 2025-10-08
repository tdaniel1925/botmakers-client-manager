"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  Users,
  FolderKanban,
  Phone,
  MessageSquare,
  ClipboardList,
  Database,
  LifeBuoy,
  Settings,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Mail,
} from "lucide-react";

export default function PlatformHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    {
      id: "overview",
      title: "System Overview",
      icon: BookOpen,
      color: "blue",
      subsections: [
        {
          id: "what-is-clientflow",
          title: "What is ClientFlow?",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                ClientFlow is a comprehensive multi-tenant SaaS platform designed for agencies and service providers to manage multiple client organizations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Organization Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Create and manage client organizations with custom plans and features</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-purple-600" />
                      Project Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Track projects across all clients with tasks and milestones</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      Voice Campaigns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">AI-powered phone agents for inbound and outbound calling</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-600" />
                      Campaign Messaging
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Automated SMS and email follow-ups based on call outcomes</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Your Role as Platform Admin</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Access to all organizations and their data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Platform-wide analytics and reporting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Voice campaign management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Platform settings and integrations</span>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "quick-start",
          title: "Quick Start Workflow",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Get started with these essential workflows:</p>
              
              <div className="space-y-3">
                {[
                  { num: 1, title: "Create Organization", desc: "Platform → Organizations → + New Organization" },
                  { num: 2, title: "Configure Plan & Features", desc: "Set subscription plan and feature flags" },
                  { num: 3, title: "Create Project", desc: "Platform → Projects → New Project" },
                  { num: 4, title: "Set Up Voice Campaign", desc: "Platform → Voice Campaigns → New Campaign" },
                  { num: 5, title: "Configure Messaging", desc: "Add SMS/Email templates for follow-ups" },
                  { num: 6, title: "Launch Campaign", desc: "Review settings and click Launch" },
                  { num: 7, title: "Monitor Activity", desc: "Track calls, messages, and analytics" },
                  { num: 8, title: "Manage Support", desc: "Respond to tickets and user questions" },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "organizations",
      title: "Organization Management",
      icon: Users,
      color: "purple",
      subsections: [
        {
          id: "create-org",
          title: "Creating Organizations",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Create and configure new client organizations:</p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Steps to Create:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Navigate to <strong>Platform → Organizations</strong></li>
                  <li>Click <strong>+ New Organization</strong></li>
                  <li>Fill in required fields:
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>Organization Name</li>
                      <li>Slug (URL-friendly identifier)</li>
                      <li>Plan (Free, Pro, Enterprise)</li>
                      <li>Status (Trial, Active, Suspended)</li>
                    </ul>
                  </li>
                  <li>Configure optional settings:
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>Contact information</li>
                      <li>Custom branding (logo, colors)</li>
                      <li>Feature flags</li>
                    </ul>
                  </li>
                  <li>Click <strong>Create Organization</strong></li>
                </ol>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plan Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-medium">Free</span>
                    <span className="text-sm text-gray-600">Trial/freemium tier</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-medium">Pro</span>
                    <span className="text-sm text-gray-600">Standard paid plan</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">Enterprise</span>
                    <span className="text-sm text-gray-600">Premium features</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: "manage-org",
          title: "Managing Organizations",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Key management actions for organizations:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Suspend Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600 space-y-2">
                    <p>Temporarily disable access while preserving data:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open organization details</li>
                      <li>Click Actions → Suspend</li>
                      <li>Provide reason</li>
                      <li>Confirm suspension</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Restore Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600 space-y-2">
                    <p>Reactivate a suspended organization:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open suspended organization</li>
                      <li>Click Restore Organization</li>
                      <li>Status changes to Active</li>
                      <li>Users regain access</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Deleting Organizations</h4>
                    <p className="text-sm text-red-800 mt-1">
                      Deletion is permanent and cannot be undone. All data including users, projects, campaigns, and files will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "voice-campaigns",
      title: "Voice Campaigns",
      icon: Phone,
      color: "green",
      subsections: [
        {
          id: "campaign-overview",
          title: "Campaign Overview",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Voice Campaigns deploy AI-powered phone agents for:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      Inbound Campaigns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    <p>Handle incoming calls with AI agents that can:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Answer questions</li>
                      <li>Collect information</li>
                      <li>Route calls</li>
                      <li>Schedule appointments</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Outbound Campaigns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    <p>Make automated calls with smart scheduling:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Lead generation</li>
                      <li>Appointment setting</li>
                      <li>Follow-up calls</li>
                      <li>Surveys and feedback</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Agent Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Natural Language", "Data Collection", "Sentiment Analysis", "Call Routing"].map((capability) => (
                      <div key={capability} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{capability}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: "create-campaign",
          title: "Creating Campaigns",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Step-by-step guide to creating voice campaigns:</p>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Step 1: Campaign Basics</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="text-gray-600">Navigate to Platform → Voice Campaigns → New Campaign</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Campaign Name (internal reference)</li>
                      <li>Project (link to existing project)</li>
                      <li>Campaign Type (Inbound or Outbound)</li>
                      <li>Campaign Goal (what you want to achieve)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Step 2: AI Agent Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">System Prompt</p>
                      <p className="text-gray-600">Core instructions defining the AI's personality and role</p>
                      <div className="bg-gray-50 p-2 rounded mt-1 font-mono text-xs">
                        "You are a friendly receptionist for ABC Company..."
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">First Message</p>
                      <p className="text-gray-600">What the AI says first (outbound) or as greeting (inbound)</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Must Collect Fields</p>
                      <p className="text-gray-600">Information AI must gather before ending call</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Step 3: Phone Number Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="font-medium text-green-900">Recommended: Auto-Buy</p>
                      <p className="text-green-700 text-xs mt-1">
                        System automatically provisions a number, configured and ready to use immediately
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="font-medium text-blue-900">Alternative: Use Twilio Number</p>
                      <p className="text-blue-700 text-xs mt-1">
                        Enter your existing Twilio number, system configures webhooks automatically
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "messaging",
      title: "Campaign Messaging",
      icon: MessageSquare,
      color: "orange",
      subsections: [
        {
          id: "messaging-overview",
          title: "Messaging Overview",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                Campaign Messaging allows automated SMS and email follow-ups based on call outcomes.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      1
                    </div>
                    <p className="text-gray-700">Call completes and data is analyzed</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      2
                    </div>
                    <p className="text-gray-700">System checks templates for matching triggers</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      3
                    </div>
                    <p className="text-gray-700">If trigger matches, message is sent automatically</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      4
                    </div>
                    <p className="text-gray-700">Message is personalized with call variables</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      5
                    </div>
                    <p className="text-gray-700">Delivery is logged and tracked</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600">
                    Create SMS and email templates with triggers and personalization
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600">
                    Campaign-level settings for rate limits and defaults
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Delivery Log</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600">
                    Track all sent messages with status and analytics
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
        {
          id: "create-templates",
          title: "Creating Message Templates",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Create personalized message templates with smart triggers:</p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Template Variables</CardTitle>
                  <CardDescription>Insert dynamic data from calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {[
                      { var: "{{contact_name}}", desc: "Contact's name" },
                      { var: "{{contact_phone}}", desc: "Contact's phone" },
                      { var: "{{call_summary}}", desc: "AI summary of call" },
                      { var: "{{call_sentiment}}", desc: "Detected sentiment" },
                      { var: "{{agent_name}}", desc: "AI agent's name" },
                      { var: "{{campaign_name}}", desc: "Campaign name" },
                    ].map((item) => (
                      <div key={item.var} className="flex flex-col gap-1">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{item.var}</code>
                        <span className="text-xs text-gray-600">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trigger Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Call Completed Successfully</p>
                        <p className="text-xs text-gray-600">Send thank you or next steps</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Voicemail Left</p>
                        <p className="text-xs text-gray-600">Follow up with alternative contact method</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Specific Sentiment</p>
                        <p className="text-xs text-gray-600">Based on positive, neutral, or negative sentiment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Custom Condition</p>
                        <p className="text-xs text-gray-600">Based on specific call variables</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: "byok-credentials",
          title: "BYOK Messaging Credentials",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                By default, messages use platform-wide credentials. Organizations can configure their own credentials (BYOK - Bring Your Own Keys).
              </p>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base text-blue-900">Platform-Wide Credentials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-blue-800">Configure in Platform → Settings → Messaging:</p>
                  <div className="space-y-2">
                    <div className="bg-white rounded p-3">
                      <p className="font-medium text-sm">Twilio (SMS)</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        <li>• Account SID</li>
                        <li>• Auth Token</li>
                        <li>• Phone Number</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="font-medium text-sm">Resend (Email)</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        <li>• API Key</li>
                        <li>• From Email</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-base text-green-900">Organization BYOK</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-green-800">Organizations can configure their own credentials for:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Dedicated rate limits", "Cost control", "Full transparency", "Compliance"].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded p-3 mt-3">
                    <p className="text-xs text-gray-600">
                      Organizations access this in Settings → Messaging tab. See Organization User Help for setup instructions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
      ],
    },
    {
      id: "settings",
      title: "Platform Settings",
      icon: Settings,
      color: "gray",
      subsections: [
        {
          id: "integrations",
          title: "Integrations",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Configure external services and API keys:</p>
              
              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      OpenAI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="text-gray-600">Required for AI features:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      <li>AI template generation</li>
                      <li>To-do list generation</li>
                      <li>Call analysis</li>
                      <li>Smart project suggestions</li>
                    </ul>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <strong>Setup:</strong> API Key, Model (GPT-4o), Temperature
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      Voice Provider (Vapi)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="text-gray-600">Required for voice campaigns:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      <li>AI phone agent creation</li>
                      <li>Call management</li>
                      <li>Phone number provisioning</li>
                      <li>Real-time call handling</li>
                    </ul>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <strong>Setup:</strong> API Key, Webhook Secret
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      Messaging Providers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="text-gray-600">Platform-wide credentials for SMS and Email:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <strong>Twilio:</strong> Account SID, Auth Token, Phone Number
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <strong>Resend:</strong> API Key, From Email
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: LifeBuoy,
      color: "red",
      subsections: [
        {
          id: "campaign-issues",
          title: "Campaign Issues",
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                <Card className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Campaign Won't Launch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="font-medium text-gray-900">Possible Causes:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      <li>Missing required fields</li>
                      <li>No contact list (outbound)</li>
                      <li>No phone number configured (inbound)</li>
                      <li>AI agent not created</li>
                    </ul>
                    <p className="font-medium text-gray-900 mt-3">Solutions:</p>
                    <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                      <li>Check campaign status (must be "Pending")</li>
                      <li>Review all tabs for validation errors</li>
                      <li>Verify phone number is active</li>
                      <li>Check provider API keys in Settings</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Inbound Calls Not Connecting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="font-medium text-gray-900">Solutions:</p>
                    <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                      <li>Open campaign settings → Advanced tab</li>
                      <li>Click "Verify & Fix Phone Webhook"</li>
                      <li>If using Twilio, check webhook points to correct URL</li>
                      <li>Test by calling the number</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      Messages Not Sending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="font-medium text-gray-900">For SMS:</p>
                    <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                      <li>Go to Settings → Messaging</li>
                      <li>Click "Test Connection" for Twilio</li>
                      <li>Check Twilio account balance</li>
                      <li>Verify phone number has SMS capability</li>
                    </ol>
                    <p className="font-medium text-gray-900 mt-3">For Email:</p>
                    <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                      <li>Go to Settings → Messaging</li>
                      <li>Click "Test Connection" for Resend</li>
                      <li>Verify domain is active in Resend</li>
                      <li>Check "From Email" matches verified domain</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  const filteredSections = searchQuery
    ? sections.filter((section) =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.subsections.some((sub) =>
          sub.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : sections;

  const activeData = sections.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Platform Admin Help Center</h1>
          </div>
          <p className="text-blue-100">
            Comprehensive guide to managing your ClientFlow platform
          </p>

          {/* Search */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search help topics..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Help Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {filteredSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          activeSection === section.id
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Additional Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <a
                  href="mailto:usecodespring@gmail.com"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  Email Support
                </a>
                <a
                  href="/platform/help/pdf"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <BookOpen className="h-4 w-4" />
                  Download PDF Guide
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${activeData.color}-100`}>
                      <activeData.icon className={`h-6 w-6 text-${activeData.color}-600`} />
                    </div>
                    <div>
                      <CardTitle>{activeData.title}</CardTitle>
                      <CardDescription>
                        {activeData.subsections.length} topics
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={activeData.subsections[0]?.id}>
                    <TabsList className="w-full justify-start flex-wrap h-auto">
                      {activeData.subsections.map((sub) => (
                        <TabsTrigger key={sub.id} value={sub.id} className="text-sm">
                          {sub.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {activeData.subsections.map((sub) => (
                      <TabsContent key={sub.id} value={sub.id} className="mt-6">
                        {sub.content}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
