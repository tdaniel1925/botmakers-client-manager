"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone } from 'lucide-react';

interface EmailPreviewProps {
  subject: string;
  from: string;
  to: string;
  body: string;
}

export function EmailPreview({ subject, from, to, body }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="h-full flex flex-col">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'desktop' | 'mobile')} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="desktop" 
            className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
          <TabsTrigger 
            value="mobile"
            className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="flex-1 mt-0 p-4">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg border shadow-lg">
              {/* Email Header */}
              <div className="border-b p-6 space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {subject || '(No Subject)'}
                </h2>
                <div className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">From:</span>
                    <span className="text-gray-900 dark:text-gray-100">{from || 'you@example.com'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">To:</span>
                    <span className="text-gray-900 dark:text-gray-100">{to || 'recipient@example.com'}</span>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div 
                className="p-6 prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: body || '<p class="text-gray-400 italic">Email body will appear here...</p>' }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="flex-1 mt-0 p-4">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl border-8 border-gray-800 shadow-2xl overflow-hidden" style={{ height: '667px' }}>
              {/* Mobile Status Bar */}
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 flex items-center justify-between text-xs">
                <span className="font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 border border-gray-600 rounded-sm" />
                </div>
              </div>

              {/* Mobile Email Header */}
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {(from || 'Y')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                      {from || 'you@example.com'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      to {to || 'recipient@example.com'}
                    </div>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {subject || '(No Subject)'}
                </h3>
              </div>

              {/* Mobile Email Body */}
              <div className="overflow-y-auto" style={{ height: 'calc(667px - 120px)' }}>
                <div 
                  className="p-4 prose prose-sm max-w-none dark:prose-invert text-sm"
                  dangerouslySetInnerHTML={{ __html: body || '<p class="text-gray-400 italic">Email body will appear here...</p>' }}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


