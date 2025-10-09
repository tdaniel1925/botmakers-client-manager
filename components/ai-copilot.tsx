"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Sparkles, Zap, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useCopilot } from '@/lib/ai-copilot-context';
import { getAllSuggestions } from '@/lib/copilot-suggestions';

interface AICopilotProps {
  app: 'quickagent' | 'clientflow';
}

export function AICopilot({ app }: AICopilotProps) {
  const { isOpen, messages, isThinking, sendMessage, closeCopilot, clearHistory } = useCopilot();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Get context-aware suggestions based on current page
  const suggestedPrompts = getAllSuggestions(pathname, app).slice(0, 4);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    await sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 z-50 mt-2 mx-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
        style={{ maxHeight: '500px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-gradient-to-r from-cyan-50 to-teal-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900">AI Co-Pilot</h3>
              <p className="text-xs text-neutral-600 hidden sm:block">Your intelligent assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear conversation history?')) {
                    clearHistory();
                  }
                }}
                className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-white/50 rounded transition-colors"
                title="Clear history"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCopilot}
              className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">How can I help you?</h4>
              <p className="text-sm text-neutral-600 mb-4">
                Ask me anything or try one of these suggestions:
              </p>
              <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(prompt.text)}
                    className="text-left px-4 py-2 rounded-lg border border-neutral-200 hover:border-cyan-300 hover:bg-cyan-50 transition-colors text-sm text-neutral-700 hover:text-cyan-900"
                  >
                    <span className="mr-2">{prompt.icon}</span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Action Status */}
                    {message.action && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2 text-xs">
                        {message.action.status === 'executing' && (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Executing...</span>
                          </>
                        )}
                        {message.action.status === 'completed' && (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span>Completed</span>
                          </>
                        )}
                        {message.action.status === 'failed' && (
                          <>
                            <XCircle className="w-3 h-3 text-red-500" />
                            <span>Failed</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-3 bg-neutral-50">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Co-Pilot anything..."
              className="flex-1 px-4 py-2 rounded-full border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none text-sm bg-white"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="p-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

