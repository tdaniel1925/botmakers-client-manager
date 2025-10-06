'use client';

/**
 * Email Preview Component
 * Safely renders HTML email in an iframe
 */

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailPreviewProps {
  html: string;
  subject?: string;
}

export function EmailPreview({ html, subject }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          {subject && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Subject:</span> {subject}
            </div>
          )}
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            Mobile
          </Button>
        </div>
      </div>
      
      {/* Preview Container */}
      <div className="flex-1 p-6 bg-gray-50 overflow-auto flex items-start justify-center">
        <div 
          className="bg-white shadow-lg transition-all duration-300"
          style={{
            width: viewMode === 'desktop' ? '100%' : '375px',
            maxWidth: viewMode === 'desktop' ? '800px' : '375px',
          }}
        >
          {/* Sandboxed iframe for email rendering */}
          <iframe
            srcDoc={html}
            title="Email Preview"
            className="w-full border-0"
            style={{ minHeight: '500px' }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3 border-t bg-gray-50 text-xs text-gray-600 text-center">
        Preview shows how the email will appear to recipients
      </div>
    </div>
  );
}
