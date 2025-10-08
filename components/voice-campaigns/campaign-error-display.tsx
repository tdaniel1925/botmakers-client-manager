"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CampaignError {
  message: string;
  code?: string;
  details?: any;
  step?: string;
  timestamp?: Date;
  provider?: string;
}

interface CampaignErrorDisplayProps {
  error: CampaignError;
  onRetry?: () => void;
  onBack?: () => void;
  onContactSupport?: () => void;
  isRetrying?: boolean;
  canRetry?: boolean;
}

export function CampaignErrorDisplay({
  error,
  onRetry,
  onBack,
  onContactSupport,
  isRetrying = false,
  canRetry = true,
}: CampaignErrorDisplayProps) {
  const [copiedDetails, setCopiedDetails] = useState(false);

  const getErrorCategory = (message: string, code?: string) => {
    if (message.includes("API key") || message.includes("authentication")) {
      return "authentication";
    }
    if (message.includes("phone number") || message.includes("provision")) {
      return "phone_provisioning";
    }
    if (message.includes("webhook")) {
      return "webhook";
    }
    if (message.includes("agent") || message.includes("assistant")) {
      return "agent_creation";
    }
    if (message.includes("rate limit") || code === "RATE_LIMIT") {
      return "rate_limit";
    }
    if (message.includes("network") || message.includes("timeout")) {
      return "network";
    }
    return "unknown";
  };

  const getSuggestions = (category: string, provider?: string) => {
    const suggestions: Record<string, string[]> = {
      authentication: [
        `Check your ${provider?.toUpperCase() || "provider"} API key in environment variables`,
        "Verify the API key has the correct permissions",
        "Try regenerating your API key in the provider dashboard",
      ],
      phone_provisioning: [
        "Check if you have available phone numbers in your provider account",
        "Verify your account has sufficient credits/balance",
        "Try selecting a different area code or region",
        "Check provider status for any ongoing outages",
      ],
      webhook: [
        "Ensure your webhook URL is publicly accessible",
        "Check if your server is running and accepting connections",
        "Verify webhook URL doesn't have typos",
        "Try using ngrok for local development",
      ],
      agent_creation: [
        "Check provider dashboard for any service disruptions",
        "Verify your account tier supports agent creation",
        "Review your agent configuration for any invalid parameters",
        "Try simplifying your system prompt and retry",
      ],
      rate_limit: [
        "Wait a few minutes before retrying",
        "Consider upgrading your provider plan for higher limits",
        "Reduce the frequency of API calls",
      ],
      network: [
        "Check your internet connection",
        "Try again in a few moments",
        "Check if the provider service is operational",
      ],
      unknown: [
        "Try the operation again",
        "Check the error details below for more information",
        "Contact support if the issue persists",
      ],
    };

    return suggestions[category] || suggestions.unknown;
  };

  const handleCopyDetails = async () => {
    const detailsText = JSON.stringify(
      {
        message: error.message,
        code: error.code,
        step: error.step,
        provider: error.provider,
        timestamp: error.timestamp,
        details: error.details,
      },
      null,
      2
    );

    await navigator.clipboard.writeText(detailsText);
    setCopiedDetails(true);
    toast.success("Error details copied to clipboard");
    setTimeout(() => setCopiedDetails(false), 2000);
  };

  const category = getErrorCategory(error.message, error.code);
  const suggestions = getSuggestions(category, error.provider);

  return (
    <div className="space-y-6">
      {/* Main Error Alert */}
      <Alert variant="destructive" className="border-2">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">
          Campaign Creation Failed
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-base">{error.message}</p>
          {error.code && (
            <Badge variant="outline" className="mt-2">
              Error Code: {error.code}
            </Badge>
          )}
        </AlertDescription>
      </Alert>

      {/* Step Indicator */}
      {error.step && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Failed During: {error.step}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Previous steps completed successfully</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              The wizard will preserve your progress. Any resources created before this error were
              automatically cleaned up.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suggested Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm pt-0.5">{suggestion}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Provider-Specific Help */}
      {error.provider && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {error.provider.toUpperCase()} Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                const urls: Record<string, string> = {
                  vapi: "https://docs.vapi.ai",
                  autocalls: "https://docs.autocalls.ai",
                  synthflow: "https://docs.synthflow.ai",
                  retell: "https://docs.retellai.com",
                };
                window.open(urls[error.provider!] || "#", "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View {error.provider.toUpperCase()} Documentation
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                const urls: Record<string, string> = {
                  vapi: "https://status.vapi.ai",
                  autocalls: "https://status.autocalls.ai",
                  synthflow: "https://status.synthflow.ai",
                  retell: "https://status.retellai.com",
                };
                window.open(urls[error.provider!] || "#", "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Check {error.provider.toUpperCase()} Status Page
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Technical Details (Collapsible) */}
      {error.details && (
        <Accordion type="single" collapsible>
          <AccordionItem value="details" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">
              Technical Details
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Error Timestamp</span>
                  <span className="text-sm font-mono">
                    {error.timestamp?.toLocaleString() || "N/A"}
                  </span>
                </div>

                {error.details && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Full Details</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyDetails}
                      >
                        {copiedDetails ? (
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedDetails ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto border">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}

        {onRetry && canRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex-1"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Creation
              </>
            )}
          </Button>
        )}
      </div>

      {/* Contact Support */}
      {onContactSupport && (
        <div className="text-center">
          <Button
            variant="link"
            size="sm"
            onClick={onContactSupport}
            className="text-gray-500"
          >
            Still having issues? Contact Support
          </Button>
        </div>
      )}
    </div>
  );
}
