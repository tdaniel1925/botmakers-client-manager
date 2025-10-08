"use client";

import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { toast as sonnerToast, ExternalToast } from "sonner";
import { Button } from "./button";

interface ToastContentProps {
  title: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  onClose?: () => void;
  icon: React.ReactNode;
  variant: "success" | "error" | "warning" | "info";
}

function ToastContent({
  title,
  description,
  onAction,
  actionLabel,
  onClose,
  icon,
  variant,
}: ToastContentProps) {
  const variantStyles = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const iconStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <div
      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 shadow-lg ${variantStyles[variant]}`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${iconStyles[variant]}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base mb-1">{title}</div>
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>

      {/* Action Button */}
      {onAction && actionLabel && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          size="sm"
          variant="outline"
          className="flex-shrink-0 bg-white hover:bg-gray-50 border-2"
        >
          {actionLabel}
        </Button>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export const toast = {
  success: (
    title: string,
    options?: {
      description?: string;
      duration?: number;
    }
  ) => {
    return sonnerToast.custom(
      (t) => (
        <ToastContent
          title={title}
          description={options?.description}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
          onClose={() => sonnerToast.dismiss(t)}
        />
      ),
      {
        duration: options?.duration || 4000,
      }
    );
  },

  error: (
    title: string,
    options?: {
      description?: string;
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    return sonnerToast.custom(
      (t) => (
        <ToastContent
          title={title}
          description={options?.description}
          icon={<X className="h-5 w-5" />}
          variant="error"
          onAction={options?.action?.onClick}
          actionLabel={options?.action?.label}
          onClose={() => sonnerToast.dismiss(t)}
        />
      ),
      {
        duration: options?.duration || 6000,
      }
    );
  },

  warning: (
    title: string,
    options?: {
      description?: string;
      duration?: number;
    }
  ) => {
    return sonnerToast.custom(
      (t) => (
        <ToastContent
          title={title}
          description={options?.description}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
          onClose={() => sonnerToast.dismiss(t)}
        />
      ),
      {
        duration: options?.duration || 5000,
      }
    );
  },

  info: (
    title: string,
    options?: {
      description?: string;
      duration?: number;
    }
  ) => {
    return sonnerToast.custom(
      (t) => (
        <ToastContent
          title={title}
          description={options?.description}
          icon={<Info className="h-5 w-5" />}
          variant="info"
          onClose={() => sonnerToast.dismiss(t)}
        />
      ),
      {
        duration: options?.duration || 5000,
      }
    );
  },

  // For special cases like subscription expiry
  alert: (
    title: string,
    options?: {
      description?: string;
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    return sonnerToast.custom(
      (t) => (
        <ToastContent
          title={title}
          description={options?.description}
          icon={<AlertCircle className="h-5 w-5" />}
          variant="warning"
          onAction={options?.action?.onClick}
          actionLabel={options?.action?.label}
          onClose={() => sonnerToast.dismiss(t)}
        />
      ),
      {
        duration: options?.duration || 8000,
      }
    );
  },

  // Keep original methods for backwards compatibility
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
  dismiss: sonnerToast.dismiss,
  message: sonnerToast.message,
  custom: sonnerToast.custom,
};

