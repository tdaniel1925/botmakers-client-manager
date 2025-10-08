"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

export type ConfirmDialogVariant = "danger" | "destructive" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  requireTyping?: boolean;
  typingConfirmText?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  requireTyping = false,
  typingConfirmText,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [typedText, setTypedText] = useState("");

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setTypedText("");
    } catch (error) {
      console.error("Confirm action error:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const canConfirm = !requireTyping || typedText === typingConfirmText;
  const isProcessing = isConfirming || loading;

  const variantStyles = {
    danger: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-900",
      buttonVariant: "destructive" as const,
    },
    destructive: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-900",
      buttonVariant: "destructive" as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-900",
      buttonVariant: "default" as const,
    },
    info: {
      icon: Info,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-900",
      buttonVariant: "default" as const,
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.bgColor} ${style.borderColor} border`}>
              <Icon className={`h-5 w-5 ${style.iconColor}`} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>

        {requireTyping && typingConfirmText && (
          <div className="space-y-2 pt-4">
            <Label htmlFor="confirm-text">
              Type <span className="font-mono font-bold">{typingConfirmText}</span> to confirm
            </Label>
            <Input
              id="confirm-text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={typingConfirmText}
              disabled={isProcessing}
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setTypedText("");
            }}
            disabled={isProcessing}
          >
            {cancelText}
          </Button>
          <Button
            variant={style.buttonVariant}
            onClick={handleConfirm}
            disabled={!canConfirm || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for using confirm dialog with promise-based API
 */
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    props: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm"> | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    props: null,
    resolve: null,
  });

  const confirm = (props: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm">) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, props, resolve });
    });
  };

  const handleConfirm = async () => {
    state.resolve?.(true);
    setState({ open: false, props: null, resolve: null });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ open: false, props: null, resolve: null });
  };

  const dialog = state.props ? (
    <ConfirmDialog
      {...state.props}
      open={state.open}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      onConfirm={handleConfirm}
    />
  ) : null;

  return { confirm, dialog };
}
