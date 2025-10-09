"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Trash2, CheckCircle, AlertTriangle, Building2, Users, FolderKanban, UserCircle, Activity } from "lucide-react";
import { seedMockOrganizationsAction, clearMockOrganizationsAction } from "@/actions/seed-actions";
import { useConfirm } from "@/hooks/use-confirm";

export default function SeedDataPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedMockOrganizationsAction();
      
      setSeedResult({
        success: result.isSuccess,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      setSeedResult({
        success: false,
        message: error.message || "Failed to seed mock organizations",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    const confirmed = await confirm({
      title: "Clear All Mock Organizations?",
      description: "This will permanently delete all mock organizations and associated data (projects, contacts, activities, etc.). This action cannot be undone.",
      confirmText: "Clear All Data",
      variant: "danger",
      requireTyping: true,
      typingConfirmText: "CLEAR",
    });
    
    if (!confirmed) return;

    setIsClearing(true);
    setSeedResult(null);

    try {
      const result = await clearMockOrganizationsAction();
      
      setSeedResult({
        success: result.isSuccess,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      setSeedResult({
        success: false,
        message: error.message || "Failed to clear mock organizations",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mock Data Management</h1>
        <p className="text-gray-500 mt-2">
          Seed or clear mock organizations for development and testing purposes.
        </p>
        <Badge variant="destructive" className="mt-2">
          ⚠️ Development Only
        </Badge>
      </div>

      {/* Seed Mock Data Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <CardTitle>Seed Mock Organizations</CardTitle>
          </div>
          <CardDescription>
            Create 3 fully-populated test organizations with realistic data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">What will be created:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span>3 Organizations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>15-20 Team Members</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FolderKanban className="h-4 w-4 text-gray-600" />
                  <span>15-24 Projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="h-4 w-4 text-gray-600" />
                  <span>12 Contacts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <span>45-72 Activities</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Organizations:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li><strong>Test Corp</strong> - Pro plan with full features</li>
                <li><strong>Demo Inc</strong> - Free plan with basic features</li>
                <li><strong>Sample LLC</strong> - Enterprise plan with advanced features</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSeed}
            disabled={isSeeding || isClearing}
            className="w-full"
          >
            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeeding ? "Seeding..." : "Seed Mock Data"}
          </Button>
        </CardFooter>
      </Card>

      {/* Clear Mock Data Card */}
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Clear Mock Organizations</CardTitle>
          </div>
          <CardDescription>
            Remove all mock organizations and their associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This will permanently delete all mock organizations, projects, team members, 
              contacts, and activities. This action cannot be undone.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleClear}
            disabled={isSeeding || isClearing}
            variant="destructive"
            className="w-full"
          >
            {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isClearing ? "Clearing..." : "Clear All Mock Data"}
          </Button>
        </CardFooter>
      </Card>

      {/* Result Display */}
      {seedResult && (
        <Alert variant={seedResult.success ? "default" : "destructive"}>
          {seedResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {seedResult.success ? "Success!" : "Error"}
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">{seedResult.message}</p>
            {seedResult.success && seedResult.data && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg text-sm">
                <strong>Summary:</strong>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {seedResult.data.organizations && (
                    <div>
                      <strong>Organizations:</strong> {seedResult.data.organizations.length}
                    </div>
                  )}
                  {seedResult.data.teamMembers !== undefined && (
                    <div>
                      <strong>Team Members:</strong> {seedResult.data.teamMembers}
                    </div>
                  )}
                  {seedResult.data.projects !== undefined && (
                    <div>
                      <strong>Projects:</strong> {seedResult.data.projects}
                    </div>
                  )}
                  {seedResult.data.contacts !== undefined && (
                    <div>
                      <strong>Contacts:</strong> {seedResult.data.contacts}
                    </div>
                  )}
                  {seedResult.data.activities !== undefined && (
                    <div>
                      <strong>Activities:</strong> {seedResult.data.activities}
                    </div>
                  )}
                  {seedResult.data.cleared !== undefined && (
                    <div className="col-span-2">
                      <strong>Cleared:</strong> {seedResult.data.cleared} organizations
                    </div>
                  )}
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">1. Seed Mock Data</h4>
            <p className="text-gray-600">
              Click "Seed Mock Data" to create 3 test organizations with full data. You can run this multiple 
              times - it will skip existing organizations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Use View Switcher</h4>
            <p className="text-gray-600">
              After seeding, use the View Switcher in the sidebar to toggle between Platform Admin view 
              and Organization views (Test Corp, Demo Inc, Sample LLC).
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Test Features</h4>
            <p className="text-gray-600">
              Explore different features in each organization to see how different plans and data volumes 
              affect the UI and functionality.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Clear When Done</h4>
            <p className="text-gray-600">
              When finished testing, click "Clear All Mock Data" to remove all test organizations and 
              return to a clean state.
            </p>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog />
    </div>
  );
}
