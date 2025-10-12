'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Mail,
  Send,
  Filter,
  Zap,
  Shield,
  Key,
  BookOpen,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Clock,
  Sparkles,
  CheckSquare,
  FolderOpen,
  Paperclip,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Inbox,
  Newspaper,
  Receipt,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

interface HelpTopic {
  id: string;
  title: string;
  category: string;
  icon: any;
  content: React.ReactNode;
  tags: string[];
}

export default function EmailHelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, color: 'blue' },
    { id: 'reading', name: 'Reading Emails', icon: Mail, color: 'green' },
    { id: 'composing', name: 'Composing', icon: Send, color: 'purple' },
    { id: 'search', name: 'Search & Filters', icon: Search, color: 'yellow' },
    { id: 'hey-features', name: 'Hey Features', icon: Sparkles, color: 'pink' },
    { id: 'ai-features', name: 'AI Features', icon: Zap, color: 'orange' },
    { id: 'organization', name: 'Organization', icon: FolderOpen, color: 'indigo' },
    { id: 'shortcuts', name: 'Shortcuts', icon: Key, color: 'red' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: HelpCircle, color: 'gray' },
  ];

  const helpTopics: HelpTopic[] = [
    // Getting Started
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      category: 'getting-started',
      icon: Sparkles,
      tags: ['setup', 'beginner', 'first time'],
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Quick Start Guide</h2>
          <p className="text-muted-foreground">Get started with your email client in just a few steps.</p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">Step 1: Connect Your Email Account</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click the <strong>"Add Account"</strong> button in the sidebar</li>
                <li>Choose your email provider (Gmail, Outlook, etc.)</li>
                <li>Follow the authentication flow</li>
                <li>Grant permissions for the app to access your emails</li>
              </ol>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-2">Step 2: Choose Your Email Mode</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Traditional</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Classic folders (Inbox, Sent, Drafts). Familiar experience.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Hey Mode</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Screening system, auto-categorization. Clean inbox.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Hybrid</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Both modes together. Maximum flexibility.
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">Step 3: Learn Key Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">c</Badge>
                  <span>Compose email</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">/</Badge>
                  <span>Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">j/k</Badge>
                  <span>Next/Previous</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">r</Badge>
                  <span>Reply</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Reading Emails
    {
      id: 'reading-basics',
      title: 'Reading & Navigating Emails',
      category: 'reading',
      icon: Mail,
      tags: ['reading', 'viewing', 'navigation'],
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Reading & Navigating Emails</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                Navigation Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Next email</span>
                  <Badge variant="secondary">j</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Previous email</span>
                  <Badge variant="secondary">k</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reply</span>
                  <Badge variant="secondary">r</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Star/Unstar</span>
                  <Badge variant="secondary">s</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Close viewer</span>
                  <Badge variant="secondary">Esc</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Click the <Badge variant="outline" className="mx-1">AI</Badge> badge on any email card to see:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Quick Summary</strong> - Key points at a glance</li>
                <li><strong>Smart Replies</strong> - AI-suggested responses</li>
                <li><strong>Smart Actions</strong> - Context-aware buttons</li>
                <li><strong>Related Emails</strong> - Similar conversations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Composing
    {
      id: 'composing-basics',
      title: 'Composing & Sending Emails',
      category: 'composing',
      icon: Send,
      tags: ['compose', 'send', 'write'],
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Composing & Sending Emails</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  AI Remix
                </CardTitle>
                <CardDescription>Fix grammar, improve clarity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-mono">"hey can we reschedule the meting for tmorrow thx"</p>
                </div>
                <div className="flex justify-center">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded">
                  <p className="text-sm font-mono">"Hi! Could we reschedule the meeting for tomorrow? Thank you!"</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  AI Write
                </CardTitle>
                <CardDescription>Write full email from idea</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm">"ask about project deadline extension"</p>
                </div>
                <div className="flex justify-center">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-xs">
                  <p>"Hi [Name],</p>
                  <p className="mt-2">I hope this email finds you well. I wanted to reach out regarding the current project timeline...</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-lg">Auto-Save & Draft Recovery</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>✅ Drafts auto-save every <strong>5 seconds</strong></p>
              <p>✅ Saved to database and localStorage</p>
              <p>✅ If app crashes, you'll be asked to restore</p>
              <p>✅ Never lose your work!</p>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Search & Filters
    {
      id: 'search-advanced',
      title: 'Advanced Search & Filters',
      category: 'search',
      icon: Search,
      tags: ['search', 'filter', 'find'],
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Advanced Search & Filters</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Operators</CardTitle>
              <CardDescription>Combine operators for precise results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="font-mono">from:john@example.com</Badge>
                  <span className="text-muted-foreground">Emails from specific sender</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="font-mono">to:support@company.com</Badge>
                  <span className="text-muted-foreground">Emails to specific recipient</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="font-mono">has:attachments</Badge>
                  <span className="text-muted-foreground">Emails with attachments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="font-mono">is:starred</Badge>
                  <span className="text-muted-foreground">Starred emails only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="font-mono">is:unread</Badge>
                  <span className="text-muted-foreground">Unread emails only</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                <p className="text-sm font-semibold mb-2">Example Query:</p>
                <Badge variant="secondary" className="font-mono text-xs">
                  from:john has:attachments is:unread
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Finds all unread emails from John that have attachments
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm mb-3">Click filter buttons for instant results:</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1">
                  <Paperclip className="h-3 w-3" />
                  Has Attachments
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Star className="h-3 w-3" />
                  Starred
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  Unread
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Hey Features
    {
      id: 'hey-screener',
      title: 'The Screener - Hey Features',
      category: 'hey-features',
      icon: UserCheck,
      tags: ['screener', 'hey', 'sorting'],
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">The Screener</h2>
          <p className="text-muted-foreground">Control who gets into your inbox</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-yellow-600" />
                  Imbox
                </CardTitle>
                <CardDescription>Important mail from people you care about</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Choose this for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Colleagues and clients</li>
                  <li>Friends and family</li>
                  <li>Important contacts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-blue-600" />
                  The Feed
                </CardTitle>
                <CardDescription>Newsletters, updates, bulk mail</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Choose this for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Newsletters</li>
                  <li>Marketing emails</li>
                  <li>Social media updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-gray-600" />
                  Paper Trail
                </CardTitle>
                <CardDescription>Receipts, confirmations, transactional</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Choose this for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Purchase receipts</li>
                  <li>Shipping confirmations</li>
                  <li>Bank statements</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Block
                </CardTitle>
                <CardDescription>Never see emails from this sender</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Choose this for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Spam senders</li>
                  <li>Unwanted marketing</li>
                  <li>Irrelevant contacts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },

    // Bulk Operations
    {
      id: 'bulk-operations',
      title: 'Bulk Operations',
      category: 'organization',
      icon: CheckSquare,
      tags: ['bulk', 'select', 'multiple'],
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Bulk Operations</h2>
          <p className="text-muted-foreground">Manage multiple emails at once</p>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use Bulk Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click <strong>"Select"</strong> button in header</li>
                <li>Check emails you want to select</li>
                <li>Use <strong>"Select all"</strong> to select all visible</li>
                <li>Choose bulk action from the action bar</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Mail className="h-4 w-4" />
                  <span>Mark Read</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Mail className="h-4 w-4" />
                  <span>Mark Unread</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Star className="h-4 w-4" />
                  <span>Star</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Trash2 className="h-4 w-4" />
                  <span>Trash</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded text-red-600">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Forever</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Keyboard Shortcuts
    {
      id: 'keyboard-shortcuts',
      title: 'Complete Keyboard Shortcuts',
      category: 'shortcuts',
      icon: Key,
      tags: ['shortcuts', 'keyboard', 'hotkeys'],
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Complete Keyboard Shortcuts</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Next email</span>
                  <Badge variant="secondary">j</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Previous email</span>
                  <Badge variant="secondary">k</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Close viewer</span>
                  <Badge variant="secondary">Escape</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Compose email</span>
                  <Badge variant="secondary">c</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reply</span>
                  <Badge variant="secondary">r</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Star/Unstar</span>
                  <Badge variant="secondary">s</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Views (Hey Mode)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Go to Imbox</span>
                  <Badge variant="secondary">1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Go to The Feed</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Go to Paper Trail</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Go to Screener</span>
                  <Badge variant="secondary">4</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Search</span>
                  <Badge variant="secondary">/</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Command palette</span>
                  <Badge variant="secondary">Cmd+K</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Refresh</span>
                  <Badge variant="secondary">g</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  const filteredTopics = helpTopics.filter((topic) => {
    const matchesSearch = searchQuery === '' || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || topic.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const selectedTopicData = helpTopics.find((t) => t.id === selectedTopic);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link 
            href="/platform/emails"
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Email Client
          </Link>
          <h1 className="text-4xl font-bold mb-4">Email Client Help Center</h1>
          <p className="text-xl text-blue-100">
            Find answers, learn features, and master your email workflow
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search help topics..."
            className="pl-12 h-14 text-lg bg-white dark:bg-gray-900 shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={selectedCategory === null ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedTopic(null);
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  All Topics
                </Button>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedTopic(null);
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {cat.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Need More Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Contact our support team:</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="mailto:support@yourapp.com">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {selectedTopicData ? (
              <Card>
                <CardHeader>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTopic(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to topics
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedTopicData.content}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTopics.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No topics found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or browse by category
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTopics.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <Card
                        key={topic.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedTopic(topic.id)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            {topic.title}
                          </CardTitle>
                          <CardDescription className="flex gap-2 mt-2">
                            {topic.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

