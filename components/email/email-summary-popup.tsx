/**
 * Premium AI Summary Popup Component
 * Beautiful, interactive, and performant email summary with AI insights
 */

'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { 
  Mail, Zap, Calendar, ListTodo, ChevronDown, ChevronRight,
  Sparkles, MessageSquare, ArrowRight, Clock, X
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { 
  getRelatedEmailsAction,
  generateQuickRepliesAction,
  getThreadMessagesAction
} from '@/actions/email-insights-actions';
import type { SmartAction } from '@/actions/email-smart-actions';

interface EmailSummaryPopupProps {
  email: SelectEmail;
  position: { x: number; y: number };
  onClose: () => void;
  onEmailSelect?: (emailId: string) => void;
  onComposeWithDraft?: (draft: {
    to?: string;
    subject?: string;
    body?: string;
    replyTo?: any;
  }) => void;
}

export const EmailSummaryPopup = memo(function EmailSummaryPopup({ 
  email, 
  position, 
  onClose,
  onEmailSelect,
  onComposeWithDraft
}: EmailSummaryPopupProps) {
  const [relatedEmails, setRelatedEmails] = useState<any[]>([]);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    // Show instant default replies (0ms delay)
    'Thanks for your email. I\'ll review and get back to you shortly.',
    'Received. I\'ll take a look at this and follow up.'
  ]);
  const [smartActions, setSmartActions] = useState<SmartAction[]>([]);
  const [showRelated, setShowRelated] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [aiLoading, setAiLoading] = useState(true); // Start as true, set false when done

  useEffect(() => {
    // Load AI data immediately in parallel (no setTimeout, no artificial delay)
    console.log('🎯 AI Popup opened for email:', email.id.substring(0, 8) + '...');
    const loadStart = Date.now();
    loadAllData().then(() => {
      const loadEnd = Date.now();
      console.log(`⏱️ AI Popup data loaded in ${loadEnd - loadStart}ms`);
    });
    
    // Keyboard support
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [email.id]);

  async function loadAllData() {
    try {
      const t1 = Date.now();
      console.log('📡 Fetching data...');
      
      // Check if email has pre-generated AI (instant!)
      const hasPreGeneratedAI = email.aiQuickReplies && email.aiSmartActions && email.aiGeneratedAt;
      
      if (hasPreGeneratedAI) {
        console.log('⚡ Using pre-generated AI (INSTANT!)');
        // Use cached AI data
        setQuickReplies(email.aiQuickReplies as string[]);
        setSmartActions(email.aiSmartActions as SmartAction[]);
      } else {
        console.log('🎨 Using rule-based actions (fast fallback)');
        // Use instant rule-based fallback
        const instantSmartActions = generateInstantSmartActions(email);
        setSmartActions(instantSmartActions);
        setQuickReplies([
          'Thanks for your email. I\'ll review and get back to you shortly.',
          'Received. I\'ll take a look at this and follow up.'
        ]);
      }
      
      // Fetch thread & related emails (database queries only)
      const [relatedResult, threadResult] = await Promise.all([
        (async () => {
          const start = Date.now();
          const result = await getRelatedEmailsAction(email.id);
          console.log(`  ✓ Related emails: ${Date.now() - start}ms`);
          return result;
        })(),
        (async () => {
          const start = Date.now();
          const result = await getThreadMessagesAction(email.id);
          console.log(`  ✓ Thread messages: ${Date.now() - start}ms`);
          return result;
        })(),
      ]);
      
      const t2 = Date.now();
      console.log(`📊 Total load time: ${t2 - t1}ms ${hasPreGeneratedAI ? '(INSTANT with AI!)' : '(fast fallback)'}`);
      
      // Set related emails
      if (relatedResult.success) {
        setRelatedEmails(relatedResult.data || []);
      }
      
      // Set thread messages
      if (threadResult.success && threadResult.data) {
        setThreadMessages(threadResult.data);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setQuickReplies([
        'Thanks for your email.',
        'I\'ll get back to you soon.'
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  // Generate instant smart actions based on email content (no API call needed)
  function generateInstantSmartActions(email: SelectEmail): SmartAction[] {
    const actions: SmartAction[] = [];
    const bodyText = (email.bodyText || '').toLowerCase();
    const subject = (email.subject || '').toLowerCase();
    
    // Check for attachments
    if (email.hasAttachments) {
      actions.push({
        icon: 'Download',
        label: 'Download All',
        description: 'Save all attachments',
        action: 'download_attachments',
        color: 'blue',
      });
    }
    
    // Check for meeting/event keywords
    if (bodyText.includes('meeting') || bodyText.includes('event') || bodyText.includes('schedule') || subject.includes('meeting')) {
      actions.push({
        icon: 'Calendar',
        label: 'Add to Calendar',
        description: 'Create calendar event',
        action: 'add_to_calendar',
        color: 'green',
      });
    }
    
    // Check for task keywords
    if (bodyText.includes('todo') || bodyText.includes('task') || bodyText.includes('action item') || subject.includes('task')) {
      actions.push({
        icon: 'ListTodo',
        label: 'Create Task',
        description: 'Add to task list',
        action: 'create_task',
        color: 'purple',
      });
    }
    
    // Check for receipt/invoice
    if (bodyText.includes('receipt') || bodyText.includes('invoice') || bodyText.includes('payment') || subject.includes('receipt')) {
      actions.push({
        icon: 'Receipt',
        label: 'Save Receipt',
        description: 'File in receipts',
        action: 'save_receipt',
        color: 'orange',
      });
    }
    
    // Always show reply
    actions.push({
      icon: 'Reply',
      label: 'Quick Reply',
      description: 'Send a response',
      action: 'reply',
      color: 'blue',
    });
    
    return actions;
  }

  // Handle quick reply click
  const handleQuickReplyClick = (replyText: string) => {
    // Get sender's email address
    const senderEmail = typeof email.fromAddress === 'object' 
      ? email.fromAddress.email 
      : email.fromAddress;
    
    // Open composer with quick reply draft
    onComposeWithDraft?.({
      to: senderEmail,
      subject: email.subject?.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`,
      body: replyText,
      replyTo: {
        messageId: email.messageId,
        threadId: email.threadId,
        subject: email.subject,
        from: senderEmail,
      },
    });
    
    // Close the popup
    onClose();
  };

  // Handle smart action click
  const handleSmartAction = (action: SmartAction) => {
    console.log('Smart action clicked:', action);
    
    // TODO: Implement actual action handlers
    // For now, show a notification or alert
    switch (action.action) {
      case 'reply':
        handleQuickReplyClick('');
        break;
      case 'create_folder':
        alert(`Creating folder: ${action.params?.folderName || 'New Folder'}`);
        break;
      case 'add_to_calendar':
        alert(`Adding to calendar: ${action.params?.eventName || 'Event'}`);
        break;
      case 'create_task':
        alert(`Creating task: ${action.params?.taskName || 'Task'}`);
        break;
      case 'save_attachments':
        alert('Saving attachments...');
        break;
      default:
        alert(`Executing: ${action.label}`);
    }
  };

  // Responsive width
  const popupWidth = typeof window !== 'undefined' && window.innerWidth < 768 
    ? 'w-[90vw] max-w-[360px]' 
    : 'w-[450px]';

  return (
    <>
      {/* Popup Container */}
      <div
        className={`fixed z-[70] ${popupWidth} animate-in fade-in-0 zoom-in-95 duration-200`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          maxHeight: 'calc(100vh - 80px)',
          boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3), 0 0 1px rgba(0,0,0,0.2)'
        }}
      >
        {/* Glass morphism background with gradient */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 overflow-hidden h-full flex flex-col">
          
          {/* Animated gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 animate-pulse" />
          
          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 100px)' }}>
            
            {/* Header - Simple */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/70 dark:border-gray-700/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">AI Assistant</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Smart Actions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {aiLoading && (
                  <div className="flex items-center gap-1 text-xs text-purple-500">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>Loading...</span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Close"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Thread View - Collapsible */}
            {threadMessages.length > 1 && (
              <div className="mb-4 animate-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: '100ms' }}>
                <button
                  onClick={() => setShowThread(!showThread)}
                  className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3.5 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                        Conversation ({threadMessages.length} messages)
                      </span>
                    </div>
                    {showThread ? (
                      <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>
                
                {showThread && (
                  <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {threadMessages.map((message, index) => {
                      const from = typeof message.fromAddress === 'object' 
                        ? message.fromAddress.name || message.fromAddress.email 
                        : message.fromAddress;
                      
                      const isCurrentEmail = message.id === email.id;
                      
                      return (
                        <div
                          key={message.id}
                          onClick={() => !isCurrentEmail && onEmailSelect?.(message.id)}
                          className={`relative pl-6 pb-3 ${
                            index !== threadMessages.length - 1 ? 'border-l-2 border-blue-200 dark:border-blue-800' : ''
                          }`}
                          style={{ animationDelay: `${index * 75}ms` }}
                        >
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-1 w-3 h-3 rounded-full ${
                            isCurrentEmail 
                              ? 'bg-gradient-to-br from-purple-500 to-blue-600 ring-2 ring-purple-200 dark:ring-purple-800' 
                              : message.isRead
                              ? 'bg-gray-300 dark:bg-gray-600'
                              : 'bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                          }`} />
                          
                          {/* Message card */}
                          <div className={`
                            rounded-lg p-3 border transition-all
                            ${isCurrentEmail 
                              ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-200 dark:border-purple-800' 
                              : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                            }
                          `}>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`text-xs font-semibold truncate ${
                                  isCurrentEmail 
                                    ? 'text-purple-700 dark:text-purple-300' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {from}
                                </span>
                                {isCurrentEmail && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-600 text-white rounded">
                                    Current
                                  </span>
                                )}
                                {!message.isRead && !isCurrentEmail && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {message.receivedAt ? new Date(message.receivedAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                }) : ''}
                              </span>
                            </div>
                            
                            <p className={`text-xs mb-1 line-clamp-1 ${
                              isCurrentEmail 
                                ? 'text-purple-800 dark:text-purple-200 font-medium' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {message.subject}
                            </p>
                            
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {message.snippet || message.bodyText?.substring(0, 100) || 'No preview available'}
                            </p>
                            
                            {message.hasAttachments && (
                              <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                <Mail className="h-3 w-3" />
                                <span>Has attachments</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Related Emails - Collapsible */}
            {relatedEmails.length > 0 && (
              <div className="mb-4 animate-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: '200ms' }}>
                <button
                  onClick={() => setShowRelated(!showRelated)}
                  className="w-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3.5 border border-green-200/50 dark:border-green-800/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">
                        Related Emails ({relatedEmails.length} this week)
                      </span>
                    </div>
                    {showRelated ? (
                      <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                </button>
                {showRelated && (
                  <div className="mt-2 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    {relatedEmails.slice(0, 3).map((related, index) => (
                      <div
                        key={related.id}
                        onClick={() => onEmailSelect?.(related.id)}
                        className="pl-3 pr-2 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-green-100 dark:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {related.subject}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {related.receivedAt ? new Date(related.receivedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              }) : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Reply Suggestions - Always show */}
            <div className="mb-4 animate-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Quick Replies</span>
              </div>
              <div className="space-y-2">
                {(quickReplies.length > 0 ? quickReplies : ['Thanks for your email!', 'I\'ll review and get back to you.']).map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReplyClick(reply)}
                    className="w-full text-left px-3.5 py-2.5 text-xs bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group border border-gray-200/50 dark:border-gray-700/50"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    <span className="truncate">{reply}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI-Powered Smart Action Buttons */}
            {smartActions.length > 0 && (
              <div className="pt-3 border-t border-gray-200/70 dark:border-gray-700/70 animate-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: '300ms' }}>
                <div className="flex flex-wrap gap-2">
                  {smartActions.map((action, index) => {
                    const Icon = (LucideIcons as any)[action.icon] || Sparkles;
                    const colorClasses = {
                      blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
                      green: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
                      purple: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
                      orange: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
                      red: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
                    };
                    const colorClass = colorClasses[action.color as keyof typeof colorClasses] || colorClasses.blue;

                    return (
                      <button
                        key={index}
                        onClick={() => handleSmartAction(action)}
                        title={action.description}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold ${
                          index === 0 ? colorClass : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                        } text-white rounded-lg transition-all hover:shadow-lg hover:scale-105 active:scale-95`}
                        style={{ animationDelay: `${350 + index * 50}ms` }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Confidence Indicator */}
            {!aiLoading && (
              <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>AI Analysis Complete</span>
                </div>
                <span>Press ESC to close</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
