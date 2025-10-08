"use client";

/**
 * Impersonation Banner
 * Shows a prominent banner when admin is impersonating an organization
 */

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, X, Eye } from "lucide-react";
import { endImpersonationAction, getImpersonationStatusAction } from "@/actions/impersonation-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ImpersonationStatus } from "@/actions/impersonation-actions";

export function ImpersonationBanner() {
  const [status, setStatus] = useState<ImpersonationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const impStatus = await getImpersonationStatusAction();
    setStatus(impStatus);
  };

  const handleExitImpersonation = async () => {
    setIsLoading(true);
    
    try {
      const result = await endImpersonationAction();
      
      if (result.success) {
        toast.success("Exited impersonation mode", {
          description: "Returning to platform admin view",
          icon: "✅",
        });
        
        // Redirect to platform dashboard
        router.push("/platform/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to exit impersonation");
      }
    } catch (error) {
      toast.error("Failed to exit impersonation");
      console.error("[Impersonation] Exit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!status || !status.isImpersonating) {
    return null;
  }

  return (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-none border-x-0 border-t-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            🎭 <strong>IMPERSONATION MODE:</strong> You are viewing as{" "}
            <span className="font-bold">{status.organizationName}</span>
          </AlertDescription>
        </div>
        
        <Button
          onClick={handleExitImpersonation}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-100 border-yellow-600 text-yellow-900"
        >
          {isLoading ? (
            <>
              <X className="h-4 w-4 mr-2 animate-spin" />
              Exiting...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Exit Impersonation
            </>
          )}
        </Button>
      </div>
    </Alert>
  );
}
