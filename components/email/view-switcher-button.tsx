'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Inbox,
  Newspaper,
  Receipt,
  UserCheck,
  Clock,
  Archive,
  Settings,
  ChevronUp,
} from 'lucide-react';

interface ViewSwitcherButtonProps {
  selectedView: string;
  onViewChange: (view: string) => void;
  unscreenedCount?: number;
  replyLaterCount?: number;
  setAsideCount?: number;
}

export function ViewSwitcherButton({
  selectedView,
  onViewChange,
  unscreenedCount = 0,
  replyLaterCount = 0,
  setAsideCount = 0,
}: ViewSwitcherButtonProps) {
  const [open, setOpen] = useState(false);

  const views = [
    {
      id: 'screener',
      name: 'Screener',
      icon: UserCheck,
      description: 'Screen new senders',
      badge: unscreenedCount,
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50',
    },
    {
      id: 'imbox',
      name: 'Imbox',
      icon: Inbox,
      description: 'Important mail',
      color: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50',
    },
    {
      id: 'feed',
      name: 'The Feed',
      icon: Newspaper,
      description: 'Newsletters',
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
    },
    {
      id: 'paper_trail',
      name: 'Paper Trail',
      icon: Receipt,
      description: 'Receipts',
      color: 'text-gray-600',
      bgColor: 'hover:bg-gray-50',
    },
  ];

  const tools = [
    {
      id: 'reply_later',
      name: 'Reply Later',
      icon: Clock,
      description: 'Emails to reply',
      badge: replyLaterCount,
      color: 'text-indigo-600',
      bgColor: 'hover:bg-indigo-50',
    },
    {
      id: 'set_aside',
      name: 'Set Aside',
      icon: Archive,
      description: 'Temporary hold',
      badge: setAsideCount,
      color: 'text-teal-600',
      bgColor: 'hover:bg-teal-50',
    },
  ];

  const handleViewClick = (viewId: string) => {
    onViewChange(viewId);
    setOpen(false);
  };

  const getCurrentViewName = () => {
    const allViews = [...views, ...tools];
    const current = allViews.find(v => v.id === selectedView);
    return current?.name || 'Select View';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 px-4 shadow-lg border-2"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium">{getCurrentViewName()}</span>
          </div>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch View</DialogTitle>
          <DialogDescription>
            Choose where you want to go
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hey Views */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
              Hey Views
            </h3>
            <div className="space-y-1">
              {views.map((view) => {
                const Icon = view.icon;
                const isActive = selectedView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => handleViewClick(view.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : view.bgColor
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : view.color}`} />
                      <div className="text-left">
                        <div className={`font-medium ${isActive ? 'text-white' : ''}`}>
                          {view.name}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {view.description}
                        </div>
                      </div>
                    </div>
                    {view.badge !== undefined && view.badge > 0 && (
                      <Badge variant={isActive ? 'secondary' : 'default'}>
                        {view.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
              Tools
            </h3>
            <div className="space-y-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = selectedView === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleViewClick(tool.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : tool.bgColor
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : tool.color}`} />
                      <div className="text-left">
                        <div className={`font-medium ${isActive ? 'text-white' : ''}`}>
                          {tool.name}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {tool.description}
                        </div>
                      </div>
                    </div>
                    {tool.badge !== undefined && tool.badge > 0 && (
                      <Badge variant={isActive ? 'secondary' : 'default'}>
                        {tool.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

