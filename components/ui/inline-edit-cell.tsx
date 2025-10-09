"use client";

import { useRef, useEffect } from "react";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditCellProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineEditCell({
  value,
  onSave,
  className,
  placeholder,
  disabled = false,
}: InlineEditCellProps) {
  const {
    isEditing,
    value: editValue,
    setValue,
    isSaving,
    inputRef,
    startEditing,
    handleKeyDown,
    handleBlur,
  } = useInlineEdit(value, onSave);

  if (disabled) {
    return (
      <div className={cn("text-sm", className)}>
        {value || <span className="text-gray-400">{placeholder || "—"}</span>}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isSaving}
          className={cn("h-8 text-sm", className)}
          placeholder={placeholder}
        />
        {isSaving && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={startEditing}
      className={cn(
        "group relative cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-50 transition-colors",
        className
      )}
      title="Double-click to edit"
    >
      {value || <span className="text-gray-400">{placeholder || "—"}</span>}
      <Pencil className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

interface InlineEditTextareaProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineEditTextarea({
  value,
  onSave,
  className,
  placeholder,
  disabled = false,
}: InlineEditTextareaProps) {
  const {
    isEditing,
    value: editValue,
    setValue,
    isSaving,
    startEditing,
    handleBlur,
  } = useInlineEdit(value, onSave);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  if (disabled) {
    return (
      <div className={cn("text-sm", className)}>
        {value || <span className="text-gray-400">{placeholder || "—"}</span>}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          disabled={isSaving}
          className={cn(
            "w-full min-h-[80px] text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            className
          )}
          placeholder={placeholder}
        />
        {isSaving && (
          <div className="absolute right-2 top-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={startEditing}
      className={cn(
        "group relative cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-50 transition-colors min-h-[40px]",
        className
      )}
      title="Double-click to edit"
    >
      {value || <span className="text-gray-400">{placeholder || "—"}</span>}
      <Pencil className="absolute right-1 top-1 h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

