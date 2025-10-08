"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrganizationProfileAction } from "@/actions/organizations-actions";
import { toast } from "sonner";
import { SelectOrganization } from "@/db/schema";
import { Loader2, Mail, Phone, Globe } from "lucide-react";

interface OrganizationContactFormProps {
  organization: SelectOrganization;
  onUpdate?: () => void;
}

export function OrganizationContactForm({ organization, onUpdate }: OrganizationContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(organization.email || "");
  const [phone, setPhone] = useState(organization.phone || "");
  const [website, setWebsite] = useState(organization.website || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateOrganizationProfileAction(organization.id, {
        email,
        phone,
        website,
      });

      if (result.isSuccess) {
        toast.success("Contact information updated successfully");
        onUpdate?.();
      } else {
        toast.error(result.message || "Failed to update contact information");
      }
    } catch (error) {
      console.error("Error updating contact information:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Update your organization's contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500">
              Primary email address for your organization
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500">
              Main phone number for your organization
            </p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.company.com"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500">
              Your organization's website URL
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
