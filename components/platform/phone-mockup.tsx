'use client';

/**
 * Phone Mockup Component
 * Shows SMS message in an iPhone-style frame
 */

import { getSMSInfo } from '@/lib/template-utils';

interface PhoneMockupProps {
  message: string;
  from?: string;
}

export function PhoneMockup({ message, from = 'ClientFlow' }: PhoneMockupProps) {
  const smsInfo = getSMSInfo(message);
  
  return (
    <div className="flex flex-col items-center">
      {/* Phone Frame */}
      <div className="relative w-[320px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
        
        {/* Screen */}
        <div className="relative bg-white rounded-[32px] h-[600px] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-gray-50 px-6 py-2 flex justify-between items-center text-xs">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-gray-800 rounded"></div>
                <div className="w-1 h-3 bg-gray-800 rounded"></div>
                <div className="w-1 h-3 bg-gray-800 rounded"></div>
                <div className="w-1 h-3 bg-gray-400 rounded"></div>
              </div>
              <span className="ml-1">📶</span>
              <span className="ml-1">🔋</span>
            </div>
          </div>
          
          {/* Messages Header */}
          <div className="bg-gray-50 border-b px-4 py-3 flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
              {from.charAt(0)}
            </div>
            <span className="font-semibold">{from}</span>
          </div>
          
          {/* Message Bubbles Area */}
          <div className="p-4 space-y-2 bg-white" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.02\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}>
            {/* Incoming Message Bubble */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-2">
                <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                  {message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  now
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
      </div>
      
      {/* SMS Info */}
      <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
        <div className="flex items-center justify-center gap-4">
          <span>
            <strong>{smsInfo.characterCount}</strong> characters
          </span>
          <span>•</span>
          <span>
            <strong>{smsInfo.messageCount}</strong> SMS {smsInfo.messageCount === 1 ? 'message' : 'messages'}
          </span>
        </div>
        {smsInfo.messageCount > 1 && (
          <p className="text-xs text-orange-600">
            ⚠️ Long message will be split into {smsInfo.messageCount} parts
          </p>
        )}
        {smsInfo.characterCount > 160 && (
          <p className="text-xs text-gray-500">
            Recommended: Keep under 160 characters for single SMS
          </p>
        )}
      </div>
    </div>
  );
}
