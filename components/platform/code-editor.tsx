'use client';

/**
 * Code Editor Component
 * Monaco editor wrapper for HTML and text editing
 */

import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'html' | 'plaintext';
  height?: string;
  availableVariables?: Array<{ key: string; label: string; example: string }>;
}

export function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  height = '400px',
  availableVariables = [],
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [showVariables, setShowVariables] = useState(false);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const insertVariable = (variableKey: string) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const text = `{{${variableKey}}}`;
    
    editor.executeEdits('', [
      {
        range: selection,
        text: text,
      },
    ]);
    
    // Focus back on editor
    editor.focus();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {availableVariables.length > 0 && (
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
          <div className="text-sm text-gray-600">
            Click to insert variables: {{variableName}}
          </div>
          <DropdownMenu open={showVariables} onOpenChange={setShowVariables}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Insert Variable
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {availableVariables.map((variable) => (
                <DropdownMenuItem
                  key={variable.key}
                  onClick={() => insertVariable(variable.key)}
                >
                  <div className="flex flex-col">
                    <div className="font-medium">
                      {`{{${variable.key}}}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {variable.label} - e.g., "{variable.example}"
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Editor */}
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        theme="vs"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
