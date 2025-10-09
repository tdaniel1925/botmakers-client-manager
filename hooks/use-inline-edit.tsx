import { useState, useRef, useEffect } from "react";

export function useInlineEdit(initialValue: string, onSave: (value: string) => Promise<void>) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      setValue(initialValue);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  const handleBlur = () => {
    if (!isSaving) {
      saveEdit();
    }
  };

  return {
    isEditing,
    value,
    setValue,
    isSaving,
    inputRef,
    startEditing,
    cancelEditing,
    saveEdit,
    handleKeyDown,
    handleBlur,
  };
}

