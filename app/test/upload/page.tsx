"use client";

/**
 * File Upload Testing Page
 * Test file upload functionality
 */

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function UploadTestPage() {
  const [orgId, setOrgId] = useState<string>("");
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Fetch available organizations
    async function fetchOrganizations() {
      try {
        const response = await fetch('/api/organizations');
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations || []);
          if (data.organizations && data.organizations.length > 0) {
            setOrgId(data.organizations[0].id);
          }
        } else {
          setError("Failed to fetch organizations. You may need to create an organization first.");
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError("Error loading organizations");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">File Upload Test</h1>
        <p className="text-gray-600 mb-8">
          Test the Supabase Storage file upload integration
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {organizations.length === 0 && !error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No organizations found. Please create an organization first at <a href="/platform/organizations/new" className="underline font-semibold">Platform Organizations</a>.
            </AlertDescription>
          </Alert>
        )}

        {organizations.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Organization:
            </label>
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Test Files
            </CardTitle>
            <CardDescription>
              Upload files to test the Supabase Storage integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orgId ? (
              <FileUpload
                organizationId={orgId}
                category="test"
                multiple={true}
                maxSize={25}
                onUploadComplete={(files) => {
                  console.log("Uploaded files:", files);
                  toast.success(`${files.length} file(s) uploaded successfully!`);
                }}
                onError={(error) => {
                  console.error("Upload error:", error);
                  toast.error(`Upload error: ${error}`);
                }}
              />
            ) : (
              <div className="text-center py-10 text-gray-500">
                Please select or create an organization first
              </div>
            )}

            <div className="mt-6 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Setup Required:</strong>
                  <ol className="mt-2 space-y-1 list-decimal list-inside text-sm">
                    <li>Add Supabase keys to .env.local:
                      <ul className="ml-6 mt-1 list-disc">
                        <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                        <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                        <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
                      </ul>
                    </li>
                    <li>Create "onboarding-files" bucket in Supabase Storage</li>
                    <li>Add RLS policies (see PHASE_0_COMPLETE_SUMMARY.md)</li>
                    <li>Restart your dev server</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>After Upload:</strong><br />
                  Check your Supabase dashboard → Storage → onboarding-files to see uploaded files
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Diagnostic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Organizations Found:</span>
                <span className="font-semibold">{organizations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Org ID:</span>
                <span className="font-mono text-xs">{orgId || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supabase URL:</span>
                <span className="font-semibold">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}