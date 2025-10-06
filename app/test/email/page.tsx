"use client";

/**
 * Email Testing Page
 * Test email sending functionality
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2, XCircle } from "lucide-react";

export default function EmailTestPage() {
  const [email, setEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const sendTestEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      setResult({ type: "error", message: "Please enter an email address" });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (response.ok && data.isSuccess) {
        const successMsg = "✅ Email sent successfully! Check your inbox (and spam folder)";
        toast.success(successMsg);
        setResult({ type: "success", message: successMsg });
      } else {
        const errorMsg = data.message || "Failed to send email";
        toast.error(errorMsg);
        setResult({ type: "error", message: errorMsg });
      }
    } catch (error) {
      const errorMsg = "Network error. Is your server running?";
      toast.error(errorMsg);
      setResult({ type: "error", message: errorMsg });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Email System Test</h1>
        <p className="text-gray-600 mb-8">
          Test the Resend email integration
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Test Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button onClick={sendTestEmail} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Test Email"
              )}
            </Button>

            {/* Result Message */}
            {result && (
              <Alert 
                variant={result.type === "success" ? "default" : "destructive"} 
                className={result.type === "success" ? "bg-green-50 border-green-300" : ""}
              >
                <div className="flex items-center gap-2">
                  {result.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <AlertDescription className="font-medium">
                    {result.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Setup Required:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Add RESEND_API_KEY to .env.local</li>
                <li>Get key from resend.com</li>
                <li>Restart your dev server</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

