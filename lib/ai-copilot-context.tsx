"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    data?: any;
  };
}

interface CopilotContextType {
  isOpen: boolean;
  messages: Message[];
  isThinking: boolean;
  currentPage: string;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  setCurrentPage: (page: string) => void;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export function useCopilot() {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within CopilotProvider');
  }
  return context;
}

interface CopilotProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

export function CopilotProvider({ children, apiUrl = '/api/ai-copilot/chat' }: CopilotProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentPage, setCurrentPage] = useState('/');

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('copilot-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    }
  }, []);

  // Save conversation history to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('copilot-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const openCopilot = useCallback(() => setIsOpen(true), []);
  const closeCopilot = useCallback(() => setIsOpen(false), []);
  const toggleCopilot = useCallback(() => setIsOpen((prev) => !prev), []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      // Call AI API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            currentPage,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        action: data.action ? {
          type: data.action.type,
          status: 'pending',
          data: data.action.data,
        } : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Execute action if provided
      if (data.action) {
        executeAction(aiMessage.id, data.action);
      }
    } catch (error) {
      console.error('AI Co-Pilot error:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, currentPage, apiUrl]);

  const executeAction = async (messageId: string, action: any) => {
    // Update action status to executing
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.action
          ? { ...msg, action: { ...msg.action, status: 'executing' } }
          : msg
      )
    );

    try {
      // Execute the action based on type
      switch (action.type) {
        case 'navigate':
          // Delay slightly for visual feedback
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = action.data.url;
          break;
        case 'openWizard':
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = action.data.url;
          break;
        case 'export':
          // Handle CSV export
          const { exportToCSV } = await import('./copilot-actions');
          const result = await exportToCSV(action.data.dataType);
          if (!result.success) {
            throw new Error(result.error);
          }
          break;
        case 'search':
          // Navigate to search results
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = action.data.url;
          break;
        case 'executeFunction':
          // Reserved for future custom functions
          console.log('Custom function execution:', action.data);
          break;
        default:
          console.log('Unknown action type:', action.type);
      }

      // Update action status to completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.action
            ? { ...msg, action: { ...msg.action, status: 'completed' } }
            : msg
        )
      );
    } catch (error) {
      console.error('Action execution error:', error);
      
      // Update action status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.action
            ? { ...msg, action: { ...msg.action, status: 'failed' } }
            : msg
        )
      );
    }
  };

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('copilot-messages');
  }, []);

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        messages,
        isThinking,
        currentPage,
        openCopilot,
        closeCopilot,
        toggleCopilot,
        sendMessage,
        clearHistory,
        setCurrentPage,
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
}

