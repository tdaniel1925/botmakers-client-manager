/**
 * Clip & Reply Button - Floating button for selected text
 */

// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClipReplyButtonProps {
  selectedText: string;
  onClip: (text: string) => void;
  position: { x: number; y: number };
}

export function ClipReplyButton({ selectedText, onClip, position }: ClipReplyButtonProps) {
  if (!selectedText) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
        }}
        className="pointer-events-auto"
      >
        <Button
          size="sm"
          onClick={() => onClip(selectedText)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg font-semibold"
        >
          <Quote className="mr-2 h-4 w-4" />
          Clip & Reply
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook for text selection detection
 */
export function useTextSelection(containerRef: React.RefObject<HTMLElement>) {
  const [selection, setSelection] = useState({
    text: '',
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setSelection({ text: '', position: { x: 0, y: 0 } });
        return;
      }

      const text = sel.toString().trim();
      if (!text || text.length < 5) {
        setSelection({ text: '', position: { x: 0, y: 0 } });
        return;
      }

      // Check if selection is within our container
      const range = sel.getRangeAt(0);
      const container = containerRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        return;
      }

      // Get selection position
      const rect = range.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8, // 8px below selection
      };

      setSelection({ text, position });
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };

    const handleMouseDown = () => {
      setSelection({ text: '', position: { x: 0, y: 0 } });
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containerRef]);

  return selection;
}


