/**
 * Settings page for organization dashboard
 * Allows users to configure their organization profile and settings
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SMSNotificationSettings } from "@/components/settings/sms-notification-settings";
import { MessagingCredentialsSettings } from "@/components/settings/messaging-credentials-settings";
import { OrganizationProfileForm } from "@/components/settings/organization-profile-form";
import { OrganizationContactForm } from "@/components/settings/organization-contact-form";
import { OrganizationAddressForm } from "@/components/settings/organization-address-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getServerOrganizationId } from "@/lib/server-organization-context";
import { getOrganizationById } from "@/db/queries/organizations-queries";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const orgId = await getServerOrganizationId();

  if (!orgId) {
    redirect("/dashboard");
  }

  const organization = await getOrganizationById(orgId);

  if (!organization) {
    redirect("/dashboard");
  }

  return (
    <main className="p-6 md:p-10">
      <Breadcrumbs
        items={[
          { label: "Settings", icon: <Settings className="h-3.5 w-3.5" /> }
        ]}
        className="mb-6"
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your organization profile and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <OrganizationProfileForm organization={organization} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <OrganizationContactForm organization={organization} />
        </TabsContent>

        <TabsContent value="address" className="space-y-6">
          <OrganizationAddressForm organization={organization} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SMSNotificationSettings orgId={orgId} />
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <MessagingCredentialsSettings organizationId={orgId} />
        </TabsContent>
      </Tabs>
    </main>
  );
}