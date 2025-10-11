/**
 * Draggable AI Modal Component
 * A movable and resizable modal window for the AI assistant
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableAIModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

export function DraggableAIModal({ children, onClose, title = 'AI Copilot' }: DraggableAIModalProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 100 });
  const [size, setSize] = useState({ width: 340, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle resizing
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(320, Math.min(800, resizeStart.width + deltaX));
        const newHeight = Math.max(400, Math.min(window.innerHeight - position.y - 20, resizeStart.height + deltaY));
        
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isResizing ? 'nwse-resize' : 'move';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, dragOffset, position, size, resizeStart]);

  return (
    <div
      ref={modalRef}
      className="fixed bg-background border-2 border-primary/20 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '320px' : `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
        transition: isMinimized ? 'all 0.2s ease' : 'none',
      }}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b cursor-move select-none"
        onMouseDown={handleMouseDownDrag}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        
        <div className="flex items-center gap-1 no-drag">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-7 w-7 p-0"
          >
            {isMinimized ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content - Only show when not minimized */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize hover:bg-primary/10 transition-colors"
            onMouseDown={handleMouseDownResize}
            style={{
              background: 'linear-gradient(135deg, transparent 50%, currentColor 50%)',
              opacity: 0.3,
            }}
          />
        </>
      )}
    </div>
  );
}

