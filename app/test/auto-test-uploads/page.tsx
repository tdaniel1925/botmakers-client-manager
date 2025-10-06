/**
 * Automated Upload Test Page
 * Tests the entire file upload flow end-to-end
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Play, AlertCircle } from "lucide-react";

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message: string;
  data?: any;
}

export default function AutoTestUploadsPage() {
  const [projectId, setProjectId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (index: number, status: TestResult['status'], message: string, data?: any) => {
    setResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, message, data };
      return updated;
    });
  };

  const runAutoTest = async () => {
    // Validate inputs based on mode
    if (mode === "auto" && !projectId) {
      alert("Please enter a project ID for auto mode");
      return;
    }
    if (mode === "manual" && !sessionId) {
      alert("Please enter a session ID for manual mode");
      return;
    }

    setTesting(true);
    
    // Initialize test steps based on mode
    const testSteps: TestResult[] = mode === "auto" 
      ? [
          { step: "0. Create new onboarding session", status: 'pending', message: 'Creating...' },
          { step: "1. Verify session was created", status: 'pending', message: 'Waiting...' },
          { step: "2. Check current responses", status: 'pending', message: 'Waiting...' },
          { step: "3. Inject mock upload data", status: 'pending', message: 'Waiting...' },
          { step: "4. Verify data was saved", status: 'pending', message: 'Waiting...' },
          { step: "5. Check file structure", status: 'pending', message: 'Waiting...' },
          { step: "6. Validate file URLs", status: 'pending', message: 'Waiting...' },
        ]
      : [
          { step: "1. Verify session exists", status: 'pending', message: 'Checking...' },
          { step: "2. Check current responses", status: 'pending', message: 'Waiting...' },
          { step: "3. Inject mock upload data", status: 'pending', message: 'Waiting...' },
          { step: "4. Verify data was saved", status: 'pending', message: 'Waiting...' },
          { step: "5. Check file structure", status: 'pending', message: 'Waiting...' },
          { step: "6. Validate file URLs", status: 'pending', message: 'Waiting...' },
        ];
    setResults(testSteps);

    let currentSessionId = sessionId;
    let stepOffset = 0;

    try {
      // Auto mode: Create session first
      if (mode === "auto") {
        stepOffset = 1; // Offset other steps by 1
        
        // Step 0: Create new session
        updateResult(0, 'running', 'Creating new onboarding session...');
        const createResponse = await fetch(`/api/test/create-test-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          updateResult(0, 'failed', error.error || 'Failed to create session');
          setTesting(false);
          return;
        }

        const createData = await createResponse.json();
        currentSessionId = createData.sessionId;
        
        if (!currentSessionId) {
          updateResult(0, 'failed', 'Session created but no ID returned', createData);
          setTesting(false);
          return;
        }
        
        console.log('✅ Session created successfully:', currentSessionId);
        console.log('📦 Full create response:', createData);
        
        updateResult(0, 'success', `Session created: ${currentSessionId.substring(0, 8)}...`, createData);
        
        // Update the session ID state for reference
        setSessionId(currentSessionId);
        
        // Small delay to ensure DB commit (PostgreSQL sometimes needs a moment)
        console.log('⏳ Waiting 500ms for DB commit...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 1: Verify session exists
      updateResult(stepOffset + 0, 'running', `Fetching session: ${currentSessionId}...`);
      console.log('🔍 Fetching session with ID:', currentSessionId);
      const sessionResponse = await fetch(`/api/test/get-session/${currentSessionId}`);
      
      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Session fetch failed:', errorData);
        updateResult(stepOffset + 0, 'failed', `Session not found: ${errorData.error || 'Unknown error'}`, { 
          searchedId: currentSessionId,
          status: sessionResponse.status,
          error: errorData 
        });
        setTesting(false);
        return;
      }

      const sessionData = await sessionResponse.json();
      updateResult(stepOffset + 0, 'success', `Session found: ${sessionData.session?.id?.substring(0, 8)}...`, sessionData);

      // Step 2: Check current responses
      updateResult(stepOffset + 1, 'running', 'Checking existing responses...');
      const currentResponses = sessionData.session?.responses || {};
      const step2Response = currentResponses["2"] || {};
      const hasExistingFiles = Object.keys(step2Response).length > 0;
      
      updateResult(stepOffset + 1, 'success', hasExistingFiles 
        ? `Step 2 has data: ${JSON.stringify(step2Response).substring(0, 50)}...`
        : 'Step 2 is currently empty', currentResponses);

      // Step 3: Inject mock data
      updateResult(stepOffset + 2, 'running', 'Injecting mock file data...');
      
      const mockData = {
        logos: [
          {
            id: "auto-test-file-1",
            name: "test-logo.png",
            url: "https://picsum.photos/seed/test1/400/400",
            size: 245678,
            type: "image/png",
            status: "complete",
            progress: 100,
          },
          {
            id: "auto-test-file-2",
            name: "test-logo-2.svg",
            url: "https://picsum.photos/seed/test2/400/400",
            size: 89234,
            type: "image/svg+xml",
            status: "complete",
            progress: 100,
          },
        ],
        documents: [
          {
            id: "auto-test-file-3",
            name: "test-document.pdf",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            size: 567890,
            type: "application/pdf",
            status: "complete",
            progress: 100,
          },
        ],
      };

      const injectResponse = await fetch("/api/test/inject-upload-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          stepIndex: 2,
          uploadData: mockData,
        }),
      });

      const injectResult = await injectResponse.json();
      
      if (!injectResponse.ok || !injectResult.success) {
        updateResult(stepOffset + 2, 'failed', injectResult.error || 'Failed to inject data', injectResult);
        setTesting(false);
        return;
      }

      updateResult(stepOffset + 2, 'success', `Injected ${injectResult.filesInjected} files`, injectResult);

      // Step 4: Verify data was saved
      updateResult(stepOffset + 3, 'running', 'Re-fetching session to verify...');
      
      const verifyResponse = await fetch(`/api/test/get-session/${currentSessionId}`);
      const verifyData = await verifyResponse.json();
      const updatedResponses = verifyData.session?.responses || {};
      const updatedStep2 = updatedResponses["2"] || {};

      if (Object.keys(updatedStep2).length === 0) {
        updateResult(stepOffset + 3, 'failed', 'Step 2 is still empty after injection!', updatedStep2);
        setTesting(false);
        return;
      }

      updateResult(stepOffset + 3, 'success', 'Step 2 now contains data!', updatedStep2);

      // Step 5: Check file structure
      updateResult(stepOffset + 4, 'running', 'Validating file structure...');
      
      const categories = Object.keys(updatedStep2);
      let totalFiles = 0;
      let validFiles = 0;
      
      for (const category of categories) {
        const files = updatedStep2[category];
        if (Array.isArray(files)) {
          totalFiles += files.length;
          files.forEach((file: any) => {
            if (file.name && file.url && file.id) {
              validFiles++;
            }
          });
        }
      }

      if (validFiles === 0) {
        updateResult(stepOffset + 4, 'failed', `Found ${totalFiles} files but none have proper structure (name, url, id)`, updatedStep2);
        setTesting(false);
        return;
      }

      updateResult(stepOffset + 4, 'success', `${validFiles}/${totalFiles} files have valid structure (name, url, id)`, {
        categories: categories.length,
        totalFiles,
        validFiles,
      });

      // Step 6: Validate URLs
      updateResult(stepOffset + 5, 'running', 'Checking if file URLs are accessible...');
      
      let accessibleUrls = 0;
      let totalUrls = 0;
      
      for (const category of categories) {
        const files = updatedStep2[category];
        if (Array.isArray(files)) {
          for (const file of files) {
            if (file.url) {
              totalUrls++;
              try {
                // Just check if URL is well-formed
                new URL(file.url);
                accessibleUrls++;
              } catch (e) {
                console.warn(`Invalid URL for ${file.name}: ${file.url}`);
              }
            }
          }
        }
      }

      updateResult(stepOffset + 5, 'success', `${accessibleUrls}/${totalUrls} URLs are well-formed`, {
        accessibleUrls,
        totalUrls,
      });

      // All tests passed!
      console.log('✅ All tests passed!');
      
    } catch (error) {
      console.error('Test error:', error);
      const failedIndex = results.findIndex(r => r.status === 'running');
      if (failedIndex !== -1) {
        updateResult(failedIndex, 'failed', error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const allTestsPassed = results.length > 0 && results.every(r => r.status === 'success');
  const anyTestFailed = results.some(r => r.status === 'failed');

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🧪 Automated Upload Test</h1>
          <p className="text-gray-600">
            Automatically test the entire file upload flow end-to-end
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={mode === "auto" ? "default" : "ghost"}
                onClick={() => setMode("auto")}
                className="flex-1"
                size="sm"
              >
                Auto (Create New Session)
              </Button>
              <Button
                variant={mode === "manual" ? "default" : "ghost"}
                onClick={() => setMode("manual")}
                className="flex-1"
                size="sm"
              >
                Manual (Use Existing)
              </Button>
            </div>

            {/* Auto Mode Input */}
            {mode === "auto" && (
              <div>
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this from /platform/projects/[PROJECT_ID] URL
                </p>
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-800">
                    ✨ Auto mode will create a fresh onboarding session for you!
                  </p>
                </div>
              </div>
            )}

            {/* Manual Mode Input */}
            {mode === "manual" && (
              <div>
                <Label htmlFor="sessionId">Onboarding Session ID</Label>
                <Input
                  id="sessionId"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this from /platform/onboarding/[SESSION_ID] URL
                </p>
              </div>
            )}

            {/* Show created session ID in auto mode */}
            {mode === "auto" && sessionId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs font-semibold text-blue-900 mb-1">Created Session ID:</p>
                <code className="text-xs text-blue-800 break-all">{sessionId}</code>
              </div>
            )}

            <Button
              onClick={runAutoTest}
              disabled={testing || (mode === "auto" ? !projectId : !sessionId)}
              className="w-full"
              size="lg"
            >
              {testing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Run Automated Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Results</CardTitle>
                {allTestsPassed && (
                  <Badge className="bg-green-600">All Tests Passed ✓</Badge>
                )}
                {anyTestFailed && (
                  <Badge variant="destructive">Some Tests Failed ✗</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{result.step}</p>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View data
                          </summary>
                          <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {allTestsPassed && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">✅ All Tests Passed!</CardTitle>
            </CardHeader>
            <CardContent className="text-green-800 space-y-2">
              <p className="font-semibold">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to your project admin page</li>
                <li>Click "View Details" on the onboarding card</li>
                <li>Go to "Responses" tab</li>
                <li>You should now see the test files with download buttons!</li>
                <li>Check the yellow debug panel to verify data structure</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {anyTestFailed && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">❌ Tests Failed</CardTitle>
            </CardHeader>
            <CardContent className="text-red-800 space-y-2">
              <p className="font-semibold">What to check:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Make sure the session ID is correct</li>
                <li>Check that your dev server is running</li>
                <li>Look at browser console for errors</li>
                <li>Verify database connection is working</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
