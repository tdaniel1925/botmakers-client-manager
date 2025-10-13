/**
 * Email AI Copilot Panel
 * Right panel with conversational AI assistant
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, MessageSquare, Calendar, ListTodo, Search, FileText, Clock } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmailInsightsCard } from './email-insights-card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EmailCopilotPanelProps {
  selectedEmail: SelectEmail | null;
  accountId: string | null;
  onClose: () => void;
}

// Dynamic suggested actions based on email content
const getSmartActions = (email: SelectEmail | null) => {
  if (!email) {
    return [
      { id: 'help', label: 'How can I help you?', icon: Sparkles },
      { id: 'shortcuts', label: 'Show keyboard shortcuts', icon: MessageSquare },
    ];
  }

  const actions = [];
  const subject = (email.subject as any)?.toLowerCase() || '';
  const body = (email.bodyText as any)?.toLowerCase() || '';

  // Always show these for any email
  actions.push(
    { id: 'draft-reply', label: 'Draft professional reply', icon: MessageSquare },
    { id: 'extract-actions', label: 'Extract action items', icon: ListTodo }
  );

  // Meeting-related
  if (subject.includes('meeting') || body.includes('meeting') || subject.includes('call')) {
    actions.push(
      { id: 'schedule', label: 'Schedule follow-up', icon: Calendar }
    );
  }

  // Thread-specific
  if (email.threadId) {
    actions.push(
      { id: 'summarize-thread', label: 'Summarize thread history', icon: FileText }
    );
  }

  // Find similar
  actions.push(
    { id: 'find-similar', label: 'Find related conversations', icon: Search }
  );

  return actions;
};

export function EmailCopilotPanel({ selectedEmail, accountId, onClose }: EmailCopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [smartActions, setSmartActions] = useState<any[]>([]);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "👋 Hi! I'm your AI email assistant. I can help you summarize emails, draft replies, extract action items, and more. What would you like me to do?",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Update context and smart actions when email changes
  useEffect(() => {
    // Update smart actions
    setSmartActions(getSmartActions(selectedEmail));

    // Add context message for new email
    if (selectedEmail && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isAlreadyContext = lastMessage.id.startsWith('context-');
      
      if (!isAlreadyContext) {
        const sender = typeof selectedEmail.fromAddress === 'object' && selectedEmail.fromAddress
          ? (selectedEmail.fromAddress as any).email
          : selectedEmail.fromAddress;
        
        const contextMessage: Message = {
          id: `context-${selectedEmail.id}`,
          role: 'assistant',
          content: `I can see you've selected an email from ${sender} with subject "${selectedEmail.subject}". I'm ready to help you with this email!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, contextMessage]);
      }
    }
  }, [selectedEmail]);

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking || !accountId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setError(null);

    try {
      // Call real AI API
      const response = await fetch('/api/email/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          accountId,
          selectedEmailId: selectedEmail?.id,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          includeAllEmails: userMessage.content.toLowerCase().includes('all') || 
                           userMessage.content.toLowerCase().includes('search'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI Error:', error);
      setError(error.message || 'Failed to get AI response');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message}\n\nPlease try again or rephrase your question.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSuggestedAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      'summarize': 'Summarize this email',
      'draft-reply': 'Draft a professional reply to this email',
      'extract-actions': 'Extract all action items from this email',
      'find-similar': 'Find similar emails from this sender',
      'schedule': 'Help me schedule a follow-up meeting',
      'summarize-thread': 'Summarize the entire conversation thread',
      'help': 'What can you help me with?',
      'shortcuts': 'Show me the keyboard shortcuts',
    };

    const message = actionMessages[actionId] || actionId;
    setInput(message);
    // Auto-submit for better UX
    setTimeout(async () => {
      await handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header removed - now in DraggableAIModal */}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Email Insights Card - show when email is selected */}
        {selectedEmail && (
          <div className="sticky top-0 z-10 mb-4">
            <EmailInsightsCard email={selectedEmail} />
          </div>
        )}

        {/* Smart Action Chips - show when email is selected */}
        {selectedEmail && smartActions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground px-1">
              Quick Actions
            </div>
            <div className="flex flex-wrap gap-2">
              {smartActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSuggestedAction(action.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                  >
                    <Icon className="h-3 w-3" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 border ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-foreground border-border shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
              <span className="text-xs opacity-70 mt-1.5 block">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about your emails..."
            className="flex-1 min-h-[80px] resize-none"
            disabled={isThinking}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isThinking}
            size="icon"
            className="h-[80px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// Temporary AI response generator (replace with actual API call)
function generateAIResponse(input: string, email: SelectEmail | null): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('summarize')) {
    if (email) {
      return `📋 **Email Summary:**\n\nThis email from ${
        typeof email.fromAddress === 'object' && email.fromAddress
          ? (email.fromAddress as any).email
          : email.fromAddress
      } discusses "${(email.subject as any)}".\n\n${
        (email.snippet as any) || 'Key points will be analyzed and displayed here.'
      }\n\n**Sentiment:** Neutral\n**Priority:** Medium\n\nWould you like me to draft a reply?`;
    }
    return 'Please select an email first, and I\'ll summarize it for you.';
  }

  if (lowerInput.includes('draft') || lowerInput.includes('reply')) {
    return '✍️ **Draft Reply:**\n\nDear [Sender],\n\nThank you for your email. I\'ve reviewed your message and wanted to respond to your inquiry.\n\n[Your response here]\n\nBest regards,\n[Your name]\n\n---\n\nWould you like me to adjust the tone (more formal/casual) or add any specific details?';
  }

  if (lowerInput.includes('action') || lowerInput.includes('todo')) {
    return '✅ **Action Items Extracted:**\n\n1. Review the attached document by Friday\n2. Schedule follow-up meeting\n3. Send confirmation email\n\nWould you like me to create tasks from these items?';
  }

  return `I understand you're asking about: "${input}"\n\nI can help you with:\n• Summarizing emails\n• Drafting replies\n• Extracting action items\n• Finding similar emails\n• Managing your inbox\n\nWhat would you like me to do?`;
}




