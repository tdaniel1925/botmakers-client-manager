/**
 * Snippet Picker Component
 * Shows snippet suggestions when user types ; or /
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Command } from 'lucide-react';
import { searchSnippetsAction, incrementSnippetUsageAction } from '@/actions/email-snippets-actions';
import type { SelectEmailSnippet } from '@/db/schema/email-schema';

interface SnippetPickerProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (snippet: SelectEmailSnippet) => void;
  onClose: () => void;
}

export function SnippetPicker({ query, position, onSelect, onClose }: SnippetPickerProps) {
  const [snippets, setSnippets] = useState<SelectEmailSnippet[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    searchSnippets();
  }, [query]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Reset selection when snippets change
    setSelectedIndex(0);
  }, [snippets]);

  const handleClickOutside = (event: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  async function searchSnippets() {
    try {
      setLoading(true);
      const result = await searchSnippetsAction(query);
      if (result.success && result.snippets) {
        setSnippets(result.snippets);
      }
    } catch (error) {
      console.error('Error searching snippets:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelect = async (snippet: SelectEmailSnippet) => {
    // Increment usage count
    await incrementSnippetUsageAction(snippet.id);
    onSelect(snippet);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, snippets.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && snippets[selectedIndex]) {
      e.preventDefault();
      handleSelect(snippets[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (loading) {
    return (
      <div
        ref={pickerRef}
        className="fixed z-50 bg-background border shadow-lg rounded-lg p-3 w-80"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="text-sm text-muted-foreground">Loading snippets...</div>
      </div>
    );
  }

  if (snippets.length === 0) {
    return (
      <div
        ref={pickerRef}
        className="fixed z-50 bg-background border shadow-lg rounded-lg p-3 w-80"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="text-sm text-muted-foreground">
          No snippets found for "{query}"
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Create one in Settings → Snippets
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 bg-background border shadow-lg rounded-lg overflow-hidden w-96"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '300px',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b bg-muted/50 flex items-center gap-2">
        <Command className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          Snippets ({snippets.length})
        </span>
      </div>

      {/* Snippet List */}
      <div className="max-h-64 overflow-y-auto">
        {snippets.map((snippet, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={snippet.id}
              onClick={() => handleSelect(snippet)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-3 py-2 transition-colors ${
                isSelected
                  ? 'bg-primary/10 text-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{snippet.shortcut}</span>
                {snippet.category && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {snippet.category}
                  </span>
                )}
              </div>
              {snippet.description && (
                <div className="text-xs text-muted-foreground mb-1">
                  {snippet.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground line-clamp-2">
                {snippet.content}
              </div>
              {snippet.variables && snippet.variables.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {snippet.variables.map((variable, i) => (
                    <span
                      key={i}
                      className="text-xs px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
          <span>{snippets[selectedIndex]?.usageCount || 0} uses</span>
        </div>
      </div>
    </div>
  );
}


