/**
 * Email AI Copilot Panel
 * Right panel with conversational AI assistant
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, MessageSquare } from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EmailCopilotPanelProps {
  selectedEmail: SelectEmail | null;
  onClose: () => void;
}

const SUGGESTED_ACTIONS = [
  { id: 'summarize', label: 'Summarize this email', icon: Sparkles },
  { id: 'draft-reply', label: 'Draft a professional reply', icon: MessageSquare },
  { id: 'extract-actions', label: 'Extract action items', icon: MessageSquare },
  { id: 'find-similar', label: 'Find similar emails', icon: MessageSquare },
];

export function EmailCopilotPanel({ selectedEmail, onClose }: EmailCopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Update context when email changes
  useEffect(() => {
    if (selectedEmail && messages.length === 1) {
      const contextMessage: Message = {
        id: `context-${selectedEmail.id}`,
        role: 'assistant',
        content: `I can see you've selected an email from **${
          typeof selectedEmail.fromAddress === 'object'
            ? selectedEmail.fromAddress.email
            : selectedEmail.fromAddress
        }** with subject "${selectedEmail.subject}". How can I help you with this email?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, contextMessage]);
    }
  }, [selectedEmail]);

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: generateAIResponse(userMessage.content, selectedEmail),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1000);
  };

  const handleSuggestedAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      'summarize': 'Summarize this email',
      'draft-reply': 'Draft a professional reply to this email',
      'extract-actions': 'Extract all action items from this email',
      'find-similar': 'Find similar emails in my inbox',
    };

    setInput(actionMessages[actionId] || '');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-[420px] border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Copilot</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
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

      {/* Suggested Actions */}
      {selectedEmail && messages.length <= 2 && (
        <div className="border-t px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Suggested Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSuggestedAction(action.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <Icon className="h-3 w-3" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
        typeof email.fromAddress === 'object'
          ? email.fromAddress.email
          : email.fromAddress
      } discusses "${email.subject}".\n\n${
        email.snippet || 'Key points will be analyzed and displayed here.'
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

