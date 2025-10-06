import { SMSNotificationSettings } from "@/components/settings/sms-notification-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Palette, ArrowRight } from "lucide-react";

export default function PlatformSettingsPage() {
  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
        <p className="text-gray-600">Configure platform-wide settings</p>
      </div>

      <div className="space-y-6">
        {/* Branding Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding & Design
                </CardTitle>
                <CardDescription className="mt-2">
                  Customize your logo, colors, and brand appearance across emails, onboarding pages, and the platform
                </CardDescription>
              </div>
              <Link href="/platform/settings/branding">
                <Button>
                  Configure
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Logo Upload</div>
                <div className="text-gray-500">Upload your company logo for consistent branding</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Color Scheme</div>
                <div className="text-gray-500">Set primary, secondary, and accent colors</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Company Info</div>
                <div className="text-gray-500">Update company details and social links</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notification Settings */}
        <SMSNotificationSettings />
        
        {/* Future settings sections can be added here */}
      </div>
    </main>
  );
}

