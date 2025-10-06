/**
 * Test Page for Onboarding Responses Viewer
 * Allows testing the file display without completing full onboarding
 */

"use client";

import { OnboardingResponsesViewer } from "@/components/platform/onboarding-responses-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function ResponsesViewerTestPage() {
  // Mock session data with file uploads
  const mockSession = {
    id: "test-session-123",
    steps: [
      {
        type: "welcome",
        title: "Welcome to Your Project!",
        description: "Let's get started with your project onboarding.",
        required: true,
      },
      {
        type: "form",
        title: "Project Information",
        description: "Tell us about your project.",
        required: true,
        fields: [
          { name: "projectName", label: "Project Name", type: "text", required: true },
          { name: "projectGoals", label: "What are your main goals?", type: "textarea", required: true },
          { name: "timeline", label: "Expected Timeline", type: "text", required: false },
        ],
      },
      {
        type: "upload",
        title: "Brand Assets & Files",
        description: "Upload your brand assets and relevant files.",
        required: false,
        uploadCategories: [
          {
            name: "logos",
            label: "Company Logos",
            description: "Upload your primary and secondary logos.",
            maxFiles: 5,
            accept: "image/*",
          },
          {
            name: "documents",
            label: "Project Documents",
            description: "Upload any relevant project documentation.",
            maxFiles: 10,
            accept: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
          {
            name: "brandGuidelines",
            label: "Brand Guidelines",
            description: "Upload your brand style guide or guidelines.",
            maxFiles: 1,
            accept: "application/pdf",
          },
        ],
      },
      {
        type: "choice",
        title: "Design Style Preference",
        description: "What design style do you prefer?",
        required: true,
        choices: [
          { value: "minimalist", label: "Minimalist", description: "Clean and simple" },
          { value: "modern", label: "Modern", description: "Contemporary and sleek" },
          { value: "classic", label: "Classic", description: "Timeless and elegant" },
        ],
      },
      {
        type: "complete",
        title: "All Done!",
        description: "Thank you for completing the onboarding.",
        required: true,
      },
    ],
    responses: {
      // Step 0 - Welcome (no response needed)
      0: {},
      
      // Step 1 - Form responses
      1: {
        projectName: "Awesome Web App",
        projectGoals: "We want to build a modern SaaS platform that helps businesses manage their client relationships more effectively. Key features include contact management, deal tracking, and automated workflows.",
        timeline: "3-6 months",
      },
      
      // Step 2 - File uploads (THIS IS WHAT WE'RE TESTING)
      2: {
        logos: [
          {
            id: "file-logo-1",
            name: "company-logo-primary.png",
            url: "https://picsum.photos/seed/logo1/400/400",
            size: 245678,
            type: "image/png",
            status: "complete",
            progress: 100,
          },
          {
            id: "file-logo-2",
            name: "company-logo-secondary.svg",
            url: "https://picsum.photos/seed/logo2/400/400",
            size: 89234,
            type: "image/svg+xml",
            status: "complete",
            progress: 100,
          },
        ],
        documents: [
          {
            id: "file-doc-1",
            name: "project-brief.pdf",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            size: 567890,
            type: "application/pdf",
            status: "complete",
            progress: 100,
          },
          {
            id: "file-doc-2",
            name: "requirements.docx",
            url: "#",
            size: 123456,
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            status: "complete",
            progress: 100,
          },
          {
            id: "file-doc-3",
            name: "timeline.xlsx",
            url: "#",
            size: 98765,
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            status: "complete",
            progress: 100,
          },
        ],
        brandGuidelines: [
          {
            id: "file-brand-1",
            name: "brand-guidelines-2024.pdf",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            size: 2345678,
            type: "application/pdf",
            status: "complete",
            progress: 100,
          },
        ],
      },
      
      // Step 3 - Choice response
      3: {
        selectedChoices: ["modern", "minimalist"],
      },
      
      // Step 4 - Complete (no response needed)
      4: {},
    },
  };

  // Mock responses array (optional, used by some components)
  const mockResponses: any[] = [];

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Responses Viewer Test Page</h1>
            <p className="text-gray-600">
              Test the onboarding responses viewer with mock file upload data
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p>This page displays mock onboarding responses with file uploads.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Step 2</strong> contains multiple file uploads across 3 categories</li>
              <li>Files should display with icons, file sizes, and download buttons</li>
              <li>Check that "Download All" button appears for categories with multiple files</li>
              <li>Verify that different file types show appropriate icons</li>
            </ul>
          </CardContent>
        </Card>

        {/* Mock Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Mock Upload Data Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(mockSession.responses[2], null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Responses Viewer Component */}
        <Card>
          <CardContent className="pt-6">
            <OnboardingResponsesViewer
              session={mockSession}
              responses={mockResponses}
            />
          </CardContent>
        </Card>

        {/* Expected Behavior */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent className="text-green-800 space-y-2">
            <p><strong>For Step 2 (Brand Assets & Files):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Logos category:</strong> Should show 2 image files with image icons</li>
              <li><strong>Documents category:</strong> Should show 3 files (PDF, DOCX, XLSX) with appropriate icons and "Download All (3 files)" button</li>
              <li><strong>Brand Guidelines category:</strong> Should show 1 PDF file</li>
              <li>Each file should have an "Open" and "Download" button</li>
              <li>File sizes should be displayed (e.g., "245.7 KB")</li>
              <li>Categories should be color-coded with green background</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
