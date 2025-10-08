"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrganizationProfileAction } from "@/actions/organizations-actions";
import { toast } from "sonner";
import { SelectOrganization } from "@/db/schema";
import { FileUpload } from "@/components/file-upload";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface OrganizationProfileFormProps {
  organization: SelectOrganization;
  onUpdate?: () => void;
}

export function OrganizationProfileForm({ organization, onUpdate }: OrganizationProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(organization.name || "");
  const [description, setDescription] = useState(organization.description || "");
  const [logoUrl, setLogoUrl] = useState(organization.logoUrl || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateOrganizationProfileAction(organization.id, {
        name,
        description,
        logoUrl,
      });

      if (result.isSuccess) {
        toast.success("Organization profile updated successfully");
        onUpdate?.();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Profile</CardTitle>
        <CardDescription>
          Update your organization's basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Organization Logo</Label>
            {logoUrl ? (
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                  <Image
                    src={logoUrl}
                    alt="Organization logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-gray-600">Current logo</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLogoUrl("")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <FileUpload
                  organizationId={organization.id}
                  category="logo"
                  multiple={false}
                  accept="image/*"
                  maxSize={5}
                  onUploadComplete={(files) => {
                    if (files && files.length > 0) {
                      setLogoUrl(files[0].url);
                      toast.success("Logo uploaded successfully");
                    }
                  }}
                  onError={(error) => {
                    toast.error(`Upload failed: ${error}`);
                  }}
                />
                <p className="text-sm text-gray-500">
                  Upload your organization logo (PNG, JPG, or SVG recommended, max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corporation"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your organization..."
              rows={4}
            />
            <p className="text-sm text-gray-500">
              A brief description of your organization and what you do
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
