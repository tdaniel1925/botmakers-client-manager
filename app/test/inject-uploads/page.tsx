/**
 * Test Page - Inject Mock Upload Data
 * Quickly add mock file upload data to an existing onboarding session
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Copy, CheckCircle2 } from "lucide-react";

export default function InjectUploadsTestPage() {
  const [sessionId, setSessionId] = useState("");
  const [stepIndex, setStepIndex] = useState("2");
  const [injecting, setInjecting] = useState(false);

  const mockFileData = {
    logos: [
      {
        id: "test-file-1",
        name: "company-logo.png",
        url: "https://picsum.photos/seed/testlogo/400/400",
        size: 245678,
        type: "image/png",
        status: "complete",
        progress: 100,
      },
      {
        id: "test-file-2",
        name: "logo-variant.svg",
        url: "https://picsum.photos/seed/testlogo2/400/400",
        size: 89234,
        type: "image/svg+xml",
        status: "complete",
        progress: 100,
      },
    ],
    documents: [
      {
        id: "test-file-3",
        name: "project-brief.pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: 567890,
        type: "application/pdf",
        status: "complete",
        progress: 100,
      },
      {
        id: "test-file-4",
        name: "requirements.docx",
        url: "#",
        size: 123456,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        status: "complete",
        progress: 100,
      },
    ],
    brandGuidelines: [
      {
        id: "test-file-5",
        name: "brand-guidelines.pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: 2345678,
        type: "application/pdf",
        status: "complete",
        progress: 100,
      },
    ],
  };

  const handleInject = async () => {
    if (!sessionId) {
      toast.error("Please enter a session ID");
      return;
    }

    setInjecting(true);

    try {
      const response = await fetch("/api/test/inject-upload-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          stepIndex: parseInt(stepIndex),
          uploadData: mockFileData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Mock upload data injected successfully!");
        toast.success("Refresh the admin view to see the files", {
          duration: 5000,
        });
      } else {
        toast.error(result.error || "Failed to inject data");
      }
    } catch (error) {
      console.error("Injection error:", error);
      toast.error("Network error - is the server running?");
    } finally {
      setInjecting(false);
    }
  };

  const copyMockData = () => {
    navigator.clipboard.writeText(JSON.stringify(mockFileData, null, 2));
    toast.success("Mock data copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inject Mock Upload Data</h1>
          <p className="text-gray-600">
            Quickly add test file upload data to an onboarding session for testing
          </p>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your project's onboarding session in the admin panel</li>
              <li>Copy the session ID from the URL (the long UUID after /onboarding/)</li>
              <li>Paste it below and click "Inject Mock Data"</li>
              <li>Refresh the admin view to see the mock files in the Responses tab</li>
            </ol>
          </CardContent>
        </Card>

        {/* Injection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Inject Data</CardTitle>
            <CardDescription>
              Add mock file upload data to an existing onboarding session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Onboarding Session ID</Label>
              <Input
                id="sessionId"
                placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Found in the URL: /platform/onboarding/<strong>[SESSION_ID]</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepIndex">Step Index (Upload Step)</Label>
              <Input
                id="stepIndex"
                type="number"
                value={stepIndex}
                onChange={(e) => setStepIndex(e.target.value)}
                placeholder="2"
              />
              <p className="text-xs text-gray-500">
                Usually step 2 or 3 for upload steps (starts from 0)
              </p>
            </div>

            <Button
              onClick={handleInject}
              disabled={injecting || !sessionId}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {injecting ? "Injecting..." : "Inject Mock Upload Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Mock Data Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock Data Structure</CardTitle>
              <Button onClick={copyMockData} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(mockFileData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* What Gets Injected */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">What Gets Injected</CardTitle>
          </CardHeader>
          <CardContent className="text-green-800">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>2 logo files</strong> (PNG + SVG)</li>
              <li><strong>2 document files</strong> (PDF + DOCX)</li>
              <li><strong>1 brand guideline file</strong> (PDF)</li>
              <li>All files have mock URLs, sizes, and proper metadata</li>
              <li>Files are injected into the step's response data</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
