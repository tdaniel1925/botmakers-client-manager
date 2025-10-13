"use client";

import { useState, useCallback } from "react";
import { ConfirmDialog, type ConfirmDialogVariant } from "@/components/ui/confirm-dialog";

interface ConfirmOptions {
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  requireTyping?: boolean;
  typingConfirmText?: string;
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    description: "",
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
      setIsOpen(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
      setIsOpen(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const ConfirmDialogComponent = useCallback(() => (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={options.title}
      description={options.description as string}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      requireTyping={options.requireTyping}
      typingConfirmText={options.typingConfirmText}
      onConfirm={handleConfirm}
    />
  ), [isOpen, options, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}

