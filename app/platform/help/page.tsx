'use client';

/**
 * Admin Help Center - Dynamic Onboarding System Guide
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  BookOpen,
  Rocket,
  Library,
  Sparkles,
  Settings,
  CheckCircle2,
  UserCheck,
  Activity,
  AlertCircle,
  FileText,
  Video,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Help content sections
  const sections = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: BookOpen,
      color: 'blue',
      subsections: [
        {
          id: 'what-is',
          title: 'What is the Dynamic Onboarding System?',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">
                The Dynamic Onboarding System is an intelligent client intake solution that:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Collects comprehensive project information</strong> through structured questionnaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Adapts questions in real-time</strong> based on client responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Provides AI-powered feedback</strong> to ensure quality responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Automatically generates actionable to-do lists</strong> for both your team and clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Tracks completion progress</strong> and sends automated notifications</span>
                </li>
              </ul>
            </div>
          ),
        },
        {
          id: 'benefits',
          title: 'Key Benefits',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600">75%</div>
                  <div className="text-sm text-gray-700 mt-1">Faster onboarding setup</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600">90%</div>
                  <div className="text-sm text-gray-700 mt-1">Reduction in missing information</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-600">60%</div>
                  <div className="text-sm text-gray-700 mt-1">Higher client task completion</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600">100%</div>
                  <div className="text-sm text-gray-700 mt-1">Complete project context</div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: 'workflow',
          title: 'Quick Start Workflow',
          content: (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold">Navigate to Platform → Projects → Create New Project</h4>
                  <p className="text-sm text-gray-600">Start by creating a new project in the platform</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold">Fill in basic project details</h4>
                  <p className="text-sm text-gray-600">Add project name, organization, and description</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold">Select "Set up client onboarding"</h4>
                  <p className="text-sm text-gray-600">Enable the onboarding feature for this project</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold">Choose a template or create a custom one</h4>
                  <p className="text-sm text-gray-600">Select from 7 pre-built templates or generate a custom template with AI</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">5</div>
                <div>
                  <h4 className="font-semibold">Send invitation to client</h4>
                  <p className="text-sm text-gray-600">Client receives email with unique access link</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">6</div>
                <div>
                  <h4 className="font-semibold">Review responses when complete</h4>
                  <p className="text-sm text-gray-600">Access comprehensive AI analysis and insights</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">7</div>
                <div>
                  <h4 className="font-semibold">Approve AI-generated to-do lists</h4>
                  <p className="text-sm text-gray-600">Review, edit, and approve tasks for both your team and the client</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">8</div>
                <div>
                  <h4 className="font-semibold">Monitor client task completion</h4>
                  <p className="text-sm text-gray-600">Track progress and receive real-time notifications</p>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'templates',
      title: 'Template Library',
      icon: Library,
      color: 'purple',
      subsections: [
        {
          id: 'pre-built',
          title: 'Pre-Built Templates',
          content: (
            <div className="space-y-6">
              <p className="text-gray-700">The system includes 7 comprehensive, industry-specific templates:</p>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">1. Outbound Calling Campaign</CardTitle>
                  <CardDescription>For cold calling, lead generation, appointment setting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 10 steps</span>
                    <span>•</span>
                    <span>❓ 45+ questions</span>
                    <span>•</span>
                    <span>⏱️ ~30 min</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Covers:</strong> Campaign goals, target audience, call scripts, compliance, list details, CRM integration
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">2. Inbound Call Center Setup</CardTitle>
                  <CardDescription>For customer support lines, sales hotlines, help desks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 11 steps</span>
                    <span>•</span>
                    <span>❓ 50+ questions</span>
                    <span>•</span>
                    <span>⏱️ ~35 min</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Covers:</strong> Call flow, IVR, agent training, reporting requirements, integrations
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">3. Web Design/Development</CardTitle>
                  <CardDescription>For websites, web applications, landing pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 8 steps</span>
                    <span>•</span>
                    <span>❓ 35+ questions</span>
                    <span>•</span>
                    <span>⏱️ ~25 min</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Covers:</strong> Design preferences, functionality, integrations, content, hosting
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">4. AI Voice Agent</CardTitle>
                  <CardDescription>For AI receptionists, automated support, voice bots</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 9 steps</span>
                    <span>•</span>
                    <span>❓ 40+ questions</span>
                    <span>•</span>
                    <span>⏱️ ~28 min</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Covers:</strong> Use case, conversation flow, voice personality, integrations, testing
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">5. Software Development</CardTitle>
                  <CardDescription>For custom software, mobile apps, SaaS products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 10 steps</span>
                    <span>•</span>
                    <span>❓ 45+ questions</span>
                    <span>•</span>
                    <span>⏱️ ~32 min</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Covers:</strong> Requirements, tech stack, integrations, timeline, team structure
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">6. Marketing Campaign</CardTitle>
                  <CardDescription>For digital marketing, social media, email campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 8 steps</span>
                    <span>•</span>
                    <span>❓ 35+ questions</span>
                    <span>•</span>
                    <span>⏱️ ~24 min</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Covers:</strong> Campaign goals, target audience, channels, budget, content assets
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">7. CRM Implementation</CardTitle>
                  <CardDescription>For CRM setup, data migration, customization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 9 steps</span>
                    <span>•</span>
                    <span>❓ 40+ questions</span>
                    <span>•</span>
                    <span>⏱️ ~29 min</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Covers:</strong> Current system, migration needs, custom fields, workflows, training
                  </div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: 'template-actions',
          title: 'Managing Templates',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Access the template library at: <strong>Platform → Onboarding Templates</strong></p>
              
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Preview Template
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">View all questions, conditional logic, and estimated completion time</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Template
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">Modify questions, add/remove fields, adjust conditional logic</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Duplicate Template
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">Create a copy to customize for specific use cases</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    View Statistics
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">See usage count, average completion time, and completion rate</p>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'ai-templates',
      title: 'AI Template Generator',
      icon: Sparkles,
      color: 'yellow',
      subsections: [
        {
          id: 'when-create',
          title: 'When to Create Custom Templates',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Create a custom template when:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>Your service type isn't covered by pre-built templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>You need industry-specific questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>Client has unique requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>You want to experiment with new workflows</span>
                </li>
              </ul>
            </div>
          ),
        },
        {
          id: 'create-custom',
          title: 'Creating Custom Templates with AI',
          content: (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Pro Tip</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      The more detailed your description, the better the AI-generated questions will be. Include typical project scope, duration, and unique aspects.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold">Initiate Template Generator</h4>
                    <p className="text-sm text-gray-600 mt-1">Click "Create Custom Template" in the template library</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold">Provide Details</h4>
                    <p className="text-sm text-gray-600 mt-1">Enter project type name and detailed description</p>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      <strong>Example:</strong> "Video production services for corporate training videos. Includes scriptwriting, filming, editing, and final delivery. Typical projects range from 2-10 minute videos with professional voiceover and graphics."
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold">AI Generation (30-60 seconds)</h4>
                    <p className="text-sm text-gray-600 mt-1">AI analyzes your input and generates:</p>
                    <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                      <li>• Structured questions in logical groups (8-12 steps)</li>
                      <li>• Conditional logic rules</li>
                      <li>• Industry-specific compliance questions</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold">Review & Customize</h4>
                    <p className="text-sm text-gray-600 mt-1">Add, remove, or reorder questions as needed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold flex-shrink-0">5</div>
                  <div>
                    <h4 className="font-semibold">Save to Library</h4>
                    <p className="text-sm text-gray-600 mt-1">Template becomes available for all projects</p>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'todos',
      title: 'To-Do Management',
      icon: CheckCircle2,
      color: 'green',
      subsections: [
        {
          id: 'how-todos-work',
          title: 'How To-Do Generation Works',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">When a client completes onboarding, the AI automatically:</p>
              
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900 mb-2">1. Analyzes all responses</div>
                  <p className="text-sm text-green-800">Reviews requirements, missing info, and mentioned tools</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900 mb-2">2. Generates two separate task lists</div>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Admin Tasks:</strong> For your team (setup, configuration, development)</li>
                    <li>• <strong>Client Tasks:</strong> For the client (provide assets, access, approvals)</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900 mb-2">3. Categorizes and prioritizes</div>
                  <p className="text-sm text-green-800">Each task gets a category, priority level, and time estimate</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900 mb-2">4. Detects dependencies</div>
                  <p className="text-sm text-green-800">Identifies tasks that depend on other tasks being completed first</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: 'review-todos',
          title: 'Reviewing & Editing To-Dos',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Access the to-do review panel in the session detail page:</p>
              
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-base">Admin Tasks Tab</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><strong>✏️ Inline Edit:</strong> Click title or description to modify</div>
                  <div><strong>🎯 Change Priority:</strong> Select High/Medium/Low</div>
                  <div><strong>👤 Assign Tasks:</strong> Select team member from dropdown</div>
                  <div><strong>📝 Reorder:</strong> Drag and drop to change order</div>
                  <div><strong>❌ Delete:</strong> Remove irrelevant AI-generated tasks</div>
                  <div><strong>➕ Add Custom:</strong> Create manual tasks AI missed</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-base">Client Tasks Tab</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="text-red-600 font-semibold">⚠️ Important: Client cannot see these until you approve</div>
                  <div>Same editing capabilities as admin tasks</div>
                  <div>Review from client's perspective for clarity</div>
                  <div>Remove any sensitive internal tasks</div>
                </CardContent>
              </Card>
            </div>
          ),
        },
        {
          id: 'approve-todos',
          title: 'Approving Client Tasks',
          content: (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Why Admin Approval is Required</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Ensures tasks are accurate and relevant</li>
                  <li>✅ Prevents sensitive internal tasks from leaking to client</li>
                  <li>✅ Confirms tasks are clearly worded for non-technical users</li>
                  <li>✅ Allows you to set appropriate priorities</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold mb-1">Step 1: Review</div>
                  <p className="text-sm text-gray-600">Read each task from client's perspective</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold mb-1">Step 2: Edit</div>
                  <p className="text-sm text-gray-600">Clarify wording, remove internal tasks, add missing items</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold mb-1">Step 3: Approve</div>
                  <p className="text-sm text-gray-600">Click "Approve & Send to Client" - client receives email notification</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Tip:</strong> Get tasks right before initial approval to avoid confusion. You can edit after approval, but client will be notified of changes.
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'monitoring',
      title: 'Monitoring Progress',
      icon: Activity,
      color: 'indigo',
      subsections: [
        {
          id: 'notifications',
          title: 'Real-Time Notifications',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">You receive automatic notifications when:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                    <div className="font-semibold">Task Completed</div>
                    <p className="text-sm text-gray-600 mt-1">Client finishes a task</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <Activity className="h-8 w-8 text-purple-600 mb-2" />
                    <div className="font-semibold">All Complete</div>
                    <p className="text-sm text-gray-600 mt-1">Client finishes all tasks</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-6">
                    <AlertCircle className="h-8 w-8 text-orange-600 mb-2" />
                    <div className="font-semibold">Reminder</div>
                    <p className="text-sm text-gray-600 mt-1">Client hasn't started (48hrs)</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
        {
          id: 'tracking',
          title: 'Tracking Client Progress',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700">Monitor progress from <strong>Platform → Onboarding → Sessions</strong></p>
              
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Session List View</h4>
                  <p className="text-sm text-gray-600 mt-1">See completion status: Onboarding complete, X of Y to-dos done</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Session Detail View</h4>
                  <p className="text-sm text-gray-600 mt-1">View which tasks are complete, what client submitted, timestamps</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Task Completion</h4>
                  <p className="text-sm text-gray-600 mt-1">See uploaded files and client notes for each completed task</p>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: Rocket,
      color: 'pink',
      subsections: [
        {
          id: 'tips',
          title: 'Tips for Success',
          content: (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Template Selection</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Use pre-built templates when possible - they're optimized</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Test custom templates before sending to clients</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Archive unused templates to keep library clean</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Client Communication</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Send invites immediately after kickoff call</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Set expectations: onboarding takes ~30 minutes</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Be available for questions during onboarding</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Acknowledge completion within 24 hours</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">To-Do Management</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Review AI tasks thoroughly - AI is smart but not perfect</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Use clear, non-technical language for client tasks</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Break large tasks into 15-30 minute chunks</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Set realistic priorities (not everything can be High)</span>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertCircle,
      color: 'red',
      subsections: [
        {
          id: 'common-issues',
          title: 'Common Issues & Solutions',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Client Can't Access Onboarding Link</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>Possible Causes:</strong></div>
                  <ul className="ml-4 space-y-1 text-gray-600">
                    <li>• Link expired (after 30 days)</li>
                    <li>• Email went to spam folder</li>
                    <li>• Link was forwarded (some are user-specific)</li>
                  </ul>
                  <div className="mt-3"><strong>Solutions:</strong></div>
                  <ul className="ml-4 space-y-1 text-gray-600">
                    <li>• Click "Resend Invitation" in session detail page</li>
                    <li>• Ask client to check spam folder</li>
                    <li>• Click "Reset Session" to generate new link if still failing</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Generated Irrelevant Tasks</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>Why This Happens:</strong></div>
                  <p className="text-gray-600 ml-4">AI misinterpreted responses or template wasn't ideal for this project</p>
                  <div className="mt-3"><strong>Solutions:</strong></div>
                  <ul className="ml-4 space-y-1 text-gray-600">
                    <li>• Simply delete irrelevant tasks before approving</li>
                    <li>• Edit tasks to be more accurate</li>
                    <li>• Add custom tasks that AI missed</li>
                    <li>• Consider creating custom template for similar future projects</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">No To-Dos Generated After Onboarding</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>Possible Causes:</strong></div>
                  <p className="text-gray-600 ml-4">OpenAI API error, rate limiting, or timeout</p>
                  <div className="mt-3"><strong>Solutions:</strong></div>
                  <ul className="ml-4 space-y-1 text-gray-600">
                    <li>• Click "Generate To-Dos" button manually in session detail</li>
                    <li>• Wait 30 seconds for generation to complete</li>
                    <li>• If fails again, verify OpenAI API key in Platform → Settings</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Template Has Too Many Questions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>Why This Happens:</strong></div>
                  <p className="text-gray-600 ml-4">Template too comprehensive for project scope or too many optional fields shown</p>
                  <div className="mt-3"><strong>Short-term Solution:</strong></div>
                  <ul className="ml-4 space-y-1 text-gray-600">
                    <li>• Customize template for this specific client</li>
                    <li>• Remove optional questions</li>
                    <li>• Combine similar questions</li>
                    <li>• Resend invitation</li>
                  </ul>
                  <div className="mt-3"><strong>Long-term Solution:</strong></div>
                  <ul className="ml-4 space-y-1 text-gray-600">
                    <li>• Edit the template itself</li>
                    <li>• Mark more fields as optional</li>
                    <li>• Add conditional logic to hide fields</li>
                    <li>• Break into multiple shorter sessions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ),
        },
      ],
    },
  ];

  // Search filtering
  const filteredSections = searchQuery
    ? sections
        .map((section) => ({
          ...section,
          subsections: section.subsections.filter(
            (sub) =>
              sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              section.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section.subsections.length > 0)
    : sections;

  const activeSubsections = sections
    .find((s) => s.id === activeSection)
    ?.subsections || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Help Center</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            Complete guide to the Dynamic Onboarding System with AI Templates & To-Do Lists
          </p>
          
          {/* Search */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-2">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <section.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeSubsections[0]?.id}
              className="w-full"
            >
              <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
                {activeSubsections.map((subsection) => (
                  <TabsTrigger
                    key={subsection.id}
                    value={subsection.id}
                    className="data-[state=active]:bg-white data-[state=active]:shadow"
                  >
                    {subsection.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeSubsections.map((subsection) => (
                <TabsContent key={subsection.id} value={subsection.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{subsection.title}</CardTitle>
                    </CardHeader>
                    <CardContent>{subsection.content}</CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Additional Resources */}
            <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="mailto:usecodespring@gmail.com">
                    📧 Email Support: usecodespring@gmail.com
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Watch Video Tutorials (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
