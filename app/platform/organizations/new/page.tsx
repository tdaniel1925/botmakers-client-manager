"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganizationAction, checkSlugAvailabilityAction } from "@/actions/organizations-admin-actions";
import { toast } from "sonner";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    plan: "free" as "free" | "pro" | "enterprise",
    adminName: "",
    adminEmail: "",
  });

  const handleSlugChange = (value: string) => {
    // Auto-generate slug from name if slug is empty
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setFormData({ ...formData, slug });
    setSlugAvailable(null);
  };

  const checkSlug = async () => {
    if (!formData.slug) return;
    
    setSlugChecking(true);
    const result = await checkSlugAvailabilityAction(formData.slug);
    setSlugAvailable(result.data || false);
    setSlugChecking(false);
    
    if (!result.data) {
      toast.error("Slug is already taken");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createOrganizationAction(formData);

      if (result.isSuccess) {
        toast.success(result.message);
        router.push("/platform/organizations");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <Link
          href="/platform/organizations"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Organizations
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create New Organization</h1>
        <p className="text-gray-600">Add a new client organization to the platform</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                placeholder="Acme Corporation"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (!formData.slug) {
                    handleSlugChange(e.target.value);
                  }
                }}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL identifier) *</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  placeholder="acme-corp"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onBlur={checkSlug}
                  required
                  className={
                    slugAvailable === true
                      ? "border-green-500"
                      : slugAvailable === false
                      ? "border-red-500"
                      : ""
                  }
                />
                {slugChecking && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
              </div>
              <p className="text-xs text-gray-500">
                Used in URLs: /org/{formData.slug || "your-slug"}
              </p>
              {slugAvailable === true && (
                <p className="text-xs text-green-600">✓ Slug is available</p>
              )}
              {slugAvailable === false && (
                <p className="text-xs text-red-600">✗ Slug is already taken</p>
              )}
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: "free" | "pro" | "enterprise") =>
                  setFormData({ ...formData, plan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (5 users, 10GB)</SelectItem>
                  <SelectItem value="pro">Pro (25 users, 100GB)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Admin User Details</h3>

              {/* Admin Name */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="adminName">Admin Name *</Label>
                <Input
                  id="adminName"
                  placeholder="John Doe"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  required
                />
              </div>

              {/* Admin Email */}
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@acmecorp.com"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">
                  An invitation will be sent to this email address
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || slugAvailable === false}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/platform/organizations")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

