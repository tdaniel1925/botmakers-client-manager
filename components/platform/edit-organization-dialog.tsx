"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";

interface EditOrganizationDialogProps {
  organization: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
}

export function EditOrganizationDialog({
  organization,
  open,
  onOpenChange,
  onSave,
}: EditOrganizationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    slug: organization?.slug || "",
    plan: organization?.plan || "free",
    maxUsers: organization?.maxUsers || 5,
    maxStorageGb: organization?.maxStorageGb || 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required";
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.maxUsers < 1) {
      newErrors.maxUsers = "Max users must be at least 1";
    }

    if (formData.maxStorageGb < 1) {
      newErrors.maxStorageGb = "Max storage must be at least 1 GB";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err) {
      setErrors({ submit: "Failed to update organization. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      plan: plan as "free" | "pro" | "enterprise",
      maxUsers: plan === "pro" ? 25 : plan === "enterprise" ? 999 : 5,
      maxStorageGb: plan === "pro" ? 100 : plan === "enterprise" ? 500 : 10,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Edit Organization
          </DialogTitle>
          <DialogDescription>
            Update organization details. Slug changes will affect URLs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setErrors(prev => ({ ...prev, name: "" }));
                }}
                placeholder="Acme Corporation"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }));
                  setErrors(prev => ({ ...prev, slug: "" }));
                }}
                placeholder="acme-corp"
                className={errors.slug ? "border-red-500" : ""}
              />
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug}</p>
              )}
              <p className="text-xs text-gray-500">
                Used in URLs. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Select value={formData.plan} onValueChange={handlePlanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (5 users, 10 GB)</SelectItem>
                  <SelectItem value="pro">Pro (25 users, 100 GB)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (999 users, 500 GB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Users (editable for custom plans) */}
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }));
                  setErrors(prev => ({ ...prev, maxUsers: "" }));
                }}
                min="1"
                className={errors.maxUsers ? "border-red-500" : ""}
              />
              {errors.maxUsers && (
                <p className="text-sm text-red-600">{errors.maxUsers}</p>
              )}
            </div>

            {/* Max Storage (editable for custom plans) */}
            <div className="space-y-2">
              <Label htmlFor="maxStorageGb">Max Storage (GB)</Label>
              <Input
                id="maxStorageGb"
                type="number"
                value={formData.maxStorageGb}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, maxStorageGb: parseInt(e.target.value) || 0 }));
                  setErrors(prev => ({ ...prev, maxStorageGb: "" }));
                }}
                min="1"
                className={errors.maxStorageGb ? "border-red-500" : ""}
              />
              {errors.maxStorageGb && (
                <p className="text-sm text-red-600">{errors.maxStorageGb}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
