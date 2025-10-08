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
  LayoutDashboard,
  FolderKanban,
  Users,
  TrendingUp,
  MessageSquare,
  LifeBuoy,
  Settings,
  User,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  Zap,
  Clock,
} from "lucide-react";

export default function OrganizationHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Zap,
      color: "blue",
      subsections: [
        {
          id: "welcome",
          title: "Welcome to ClientFlow",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                ClientFlow is your organization's central hub for managing projects, tasks, contacts, deals, and more.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-blue-600" />
                      Projects & Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    Track all your active projects and manage your to-do list
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      Contacts & Deals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    Keep track of business relationships and sales opportunities
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      Activities & Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    Log meetings, calls, and important communications
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <LifeBuoy className="h-4 w-4 text-orange-600" />
                      Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    Get help when you need it with our support system
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User Roles</CardTitle>
                  <CardDescription>Your access depends on your role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                      <p className="text-gray-700">Full access to all features, settings, and billing</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
                      <p className="text-gray-700">Access to all features except billing and advanced settings</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-gray-100 text-gray-800">Member</Badge>
                      <p className="text-gray-700">View access to most features, limited editing capabilities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: "accessing-dashboard",
          title: "Accessing Your Dashboard",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Your dashboard is your command center:</p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dashboard Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-1">Quick Stats Cards</h4>
                      <p className="text-xs text-gray-600">
                        View total projects, tasks, contacts, and deals at a glance
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-1">Recent Activity</h4>
                      <p className="text-xs text-gray-600">
                        Latest updates from your team and projects
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-1">Your Task List</h4>
                      <p className="text-xs text-gray-600">
                        Tasks assigned to you, ordered by priority
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-1">Upcoming Events</h4>
                      <p className="text-xs text-gray-600">
                        Scheduled meetings and task deadlines
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> Click "Customize" in the top right to toggle widgets on/off and reorder sections
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "projects-tasks",
      title: "Projects & Tasks",
      icon: FolderKanban,
      color: "purple",
      subsections: [
        {
          id: "viewing-projects",
          title: "Viewing Projects",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Access all your organization's projects:</p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span><strong>Status:</strong> Planning, Active, On Hold, Completed, Cancelled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                      <span><strong>Priority:</strong> Low, Medium, High, Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span><strong>Assigned to:</strong> Filter by team member</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Detail Page</CardTitle>
                  <CardDescription>Click any project to see:</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {["Overview", "Tasks", "Team", "Files", "Activity", "Comments"].map((item) => (
                      <div key={item} className="bg-gray-50 rounded p-2 text-center">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: "managing-tasks",
          title: "Managing Tasks",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Work efficiently with your tasks:</p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Task Workflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-sm">To Do</p>
                        <p className="text-xs text-gray-600">Tasks not yet started</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-sm">In Progress</p>
                        <p className="text-xs text-gray-600">Currently working on</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Done</p>
                        <p className="text-xs text-gray-600">Completed tasks</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Task Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="bg-blue-50 rounded p-3">
                    <p className="font-medium">Start a Task</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Click on task card and click "Start Task" or drag to "In Progress"
                    </p>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="font-medium">Complete a Task</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Click checkbox or drag to "Done". Team members are notified.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="font-medium">Add Comments</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Open task details, scroll to Comments. Use @mention to tag team members.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded p-3">
                    <p className="font-medium">Upload Files</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Open task details, click "Attach Files". Files visible to all project team.
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
      id: "crm",
      title: "CRM - Contacts & Deals",
      icon: Users,
      color: "green",
      subsections: [
        {
          id: "managing-contacts",
          title: "Managing Contacts",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                The CRM system helps you store contact information, track interactions, and manage relationships.
              </p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adding a Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Navigate to <strong>CRM → Contacts</strong></li>
                    <li>Click <strong>+ New Contact</strong></li>
                    <li>Fill in required fields:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li>First Name & Last Name</li>
                        <li>Email (required)</li>
                        <li>Phone, Company, Job Title (optional)</li>
                      </ul>
                    </li>
                    <li>Add tags for categorization</li>
                    <li>Click <strong>Create Contact</strong></li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organizing with Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">Common tag examples:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 rounded p-2">
                      <strong>Source:</strong> Website, Referral, Event
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <strong>Interest:</strong> Service A, Product X
                    </div>
                    <div className="bg-yellow-50 rounded p-2">
                      <strong>Stage:</strong> Cold, Warm, Hot, Customer
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <strong>Type:</strong> Decision Maker, Influencer
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Details Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Click any contact to see:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>All stored contact details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Associated deals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Activity timeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Files and documents</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: "managing-deals",
          title: "Managing Deals",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                Deals represent sales opportunities tracked through stages from lead to close.
              </p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deal Pipeline Stages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { stage: "Lead", color: "gray", desc: "Initial interest" },
                      { stage: "Qualified", color: "blue", desc: "Meets criteria" },
                      { stage: "Proposal", color: "yellow", desc: "Quote sent" },
                      { stage: "Negotiation", color: "orange", desc: "Discussing terms" },
                      { stage: "Won", color: "green", desc: "Deal closed successfully" },
                      { stage: "Lost", color: "red", desc: "Deal didn't close" },
                    ].map((item) => (
                      <div key={item.stage} className={`bg-${item.color}-50 border border-${item.color}-200 rounded p-2 flex items-center justify-between`}>
                        <span className="font-semibold text-sm">{item.stage}</span>
                        <span className="text-xs text-gray-600">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Creating a Deal</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <ol className="list-decimal list-inside space-y-1 text-gray-700">
                    <li>Click <strong>+ New Deal</strong></li>
                    <li>Fill in:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li>Deal Name</li>
                        <li>Value (dollar amount)</li>
                        <li>Stage (current stage)</li>
                        <li>Primary Contact</li>
                        <li>Probability (% chance of closing)</li>
                        <li>Expected Close Date</li>
                      </ul>
                    </li>
                    <li>Click <strong>Create Deal</strong></li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          ),
        },
      ],
    },
    {
      id: "support",
      title: "Support Tickets",
      icon: LifeBuoy,
      color: "orange",
      subsections: [
        {
          id: "creating-tickets",
          title: "Creating Support Tickets",
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Get help when you need it:</p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">When to Create a Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Technical issues</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Account questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Feature requests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Bug reports</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Priority Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-semibold text-sm">Low</p>
                      <p className="text-xs text-gray-600">General question, no rush</p>
                    </div>
                    <div className="bg-yellow-50 rounded p-3">
                      <p className="font-semibold text-sm">Medium</p>
                      <p className="text-xs text-gray-600">Issue affecting work, not urgent</p>
                    </div>
                    <div className="bg-orange-50 rounded p-3">
                      <p className="font-semibold text-sm">High</p>
                      <p className="text-xs text-gray-600">Significant issue, needs attention soon</p>
                    </div>
                    <div className="bg-red-50 rounded p-3">
                      <p className="font-semibold text-sm">Critical</p>
                      <p className="text-xs text-gray-600">System down, blocking work</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Response Times</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Critical:</span>
                    <strong>Within 2 hours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>High:</span>
                    <strong>Within 4 hours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium:</span>
                    <strong>Within 24 hours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Low:</span>
                    <strong>Within 48 hours</strong>
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
      title: "Organization Settings",
      icon: Settings,
      color: "gray",
      subsections: [
        {
          id: "messaging-credentials",
          title: "Messaging Credentials (BYOK)",
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What is BYOK?</h4>
                <p className="text-sm text-blue-800">
                  Bring Your Own Keys (BYOK) allows your organization to configure custom Twilio and Resend credentials for SMS and email messaging.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Why Use Custom Credentials?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Dedicated rate limits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Cost control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Full transparency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Compliance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Setting Up Twilio (SMS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Go to Settings → Messaging</li>
                    <li>Toggle on "Use Custom Twilio Account"</li>
                    <li>Enter your credentials:
                      <ul className="list-disc list-inside ml-6 mt-1 text-xs">
                        <li>Account SID (starts with AC)</li>
                        <li>Auth Token</li>
                        <li>Phone Number (+1234567890 format)</li>
                      </ul>
                    </li>
                    <li>Click "Save & Test Credentials"</li>
                    <li>See green "Verified ✓" badge if successful</li>
                  </ol>

                  <div className="bg-gray-50 rounded p-3 text-xs">
                    <p className="font-medium mb-1">Getting Twilio Credentials:</p>
                    <ul className="space-y-1">
                      <li>• Sign up at twilio.com</li>
                      <li>• Go to Twilio Console</li>
                      <li>• Find Account SID and Auth Token</li>
                      <li>• Buy a phone number with SMS capability</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded p-2 text-xs">
                    <strong>Pricing:</strong> Phone ~$1/month, SMS ~$0.0079 per message (US)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    Setting Up Resend (Email)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Go to Settings → Messaging</li>
                    <li>Toggle on "Use Custom Email Service"</li>
                    <li>Enter your credentials:
                      <ul className="list-disc list-inside ml-6 mt-1 text-xs">
                        <li>API Key (starts with re_)</li>
                        <li>From Email (must be from verified domain)</li>
                      </ul>
                    </li>
                    <li>Click "Save & Test Credentials"</li>
                    <li>See green "Verified ✓" badge if successful</li>
                  </ol>

                  <div className="bg-gray-50 rounded p-3 text-xs">
                    <p className="font-medium mb-1">Getting Resend Credentials:</p>
                    <ul className="space-y-1">
                      <li>• Sign up at resend.com</li>
                      <li>• Go to API Keys and create new key</li>
                      <li>• Go to Domains and verify your domain</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded p-2 text-xs">
                    <strong>Pricing:</strong> Free tier: 3,000 emails/month, Pro: $20/month (50,000 emails)
                  </div>
                </CardContent>
              </Card>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Security Note</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Credentials are encrypted in the database and never displayed in full after saving. You'll need to re-enter them to make changes.
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
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: AlertCircle,
      color: "red",
      subsections: [
        {
          id: "common-issues",
          title: "Common Issues",
          content: (
            <div className="space-y-4">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Can't Log In
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-medium">Solutions:</p>
                  <ol className="list-decimal list-inside text-xs space-y-1">
                    <li>Click "Forgot Password" to reset</li>
                    <li>Check email for activation link</li>
                    <li>Contact your organization admin</li>
                    <li>If organization issue, admin must contact support</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Task Not Appearing
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-medium">Solutions:</p>
                  <ol className="list-decimal list-inside text-xs space-y-1">
                    <li>Go to Tasks → Clear all filters</li>
                    <li>Check "All Tasks" view (not just "My Tasks")</li>
                    <li>Verify project status is active</li>
                    <li>Check if task was deleted (activity log)</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    Messaging Credentials Failing
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-medium">Solutions:</p>
                  <ol className="list-decimal list-inside text-xs space-y-1">
                    <li>Click "Test Connection" to see specific error</li>
                    <li>Log into provider dashboard (Twilio/Resend)</li>
                    <li>Verify API keys are correct</li>
                    <li>Check account status and balance</li>
                    <li>For Resend: Ensure domain is verified</li>
                    <li>For Twilio: Ensure phone number is active</li>
                  </ol>
                </CardContent>
              </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8 px-6 rounded-lg mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Help Center</h1>
          </div>
          <p className="text-purple-100">
            Everything you need to know about using ClientFlow
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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Help Topics</CardTitle>
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
                            ? "bg-purple-50 text-purple-700 border-l-4 border-purple-600"
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
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Create Support Ticket
                </Button>
                <p className="text-xs text-gray-600 mt-3">
                  Or contact your organization admin
                </p>
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

