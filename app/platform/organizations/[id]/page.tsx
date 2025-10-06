"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationByIdAction } from "@/actions/platform-actions";
import { suspendOrganizationAction, activateOrganizationAction } from "@/actions/organizations-admin-actions";
import { Building2, Users, Calendar, Shield, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  useEffect(() => {
    const fetchOrg = async () => {
      setIsLoading(true);
      const orgResult = await getOrganizationByIdAction(params.id as string);

      if (orgResult.isSuccess && orgResult.data) {
        setOrg(orgResult.data);
      } else {
        toast.error("Organization not found");
        router.push("/platform/organizations");
      }
      setIsLoading(false);
    };

    fetchOrg();
  }, [params.id, router]);

  const handleSuspend = async () => {
    if (!confirm("Are you sure you want to suspend this organization?")) return;
    
    setIsUpdating(true);
    const result = await suspendOrganizationAction(params.id as string);
    
    if (result.isSuccess) {
      toast.success(result.message);
      setOrg({ ...org, status: "suspended" });
    } else {
      toast.error(result.message);
    }
    setIsUpdating(false);
  };

  const handleActivate = async () => {
    setIsUpdating(true);
    const result = await activateOrganizationAction(params.id as string);
    
    if (result.isSuccess) {
      toast.success(result.message);
      setOrg({ ...org, status: "active" });
    } else {
      toast.error(result.message);
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <main className="p-6 lg:p-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  if (!org) return null;

  return (
    <main className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/platform/organizations"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Organizations
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{org.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                  {org.status}
                </Badge>
                <Badge variant="outline">{org.plan} plan</Badge>
                {org.slug && (
                  <span className="text-sm text-gray-500 font-mono">/{org.slug}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>Edit (Coming Soon)</Button>
            {org.status === "suspended" ? (
              <Button
                variant="default"
                onClick={handleActivate}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suspend"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org.userCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Max: {org.maxUsers || 'Unlimited'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Shield className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org.maxStorageGb || 0} GB</div>
            <p className="text-xs text-gray-500 mt-1">Allocated storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(org.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.floor((Date.now() - new Date(org.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(org.updatedAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Organization ID</label>
              <p className="text-sm font-mono mt-1">{org.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Slug</label>
              <p className="text-sm font-mono mt-1">{org.slug || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Plan</label>
              <p className="text-sm mt-1 capitalize">{org.plan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-sm mt-1 capitalize">{org.status}</p>
            </div>
            {org.trialEndsAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Trial Ends</label>
                <p className="text-sm mt-1">
                  {new Date(org.trialEndsAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Stripe Customer ID</label>
              <p className="text-sm font-mono mt-1">{org.stripeCustomerId || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Stripe Subscription ID</label>
              <p className="text-sm font-mono mt-1">{org.stripeSubscriptionId || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Max Users</label>
              <p className="text-sm mt-1">{org.maxUsers || 'Unlimited'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Max Storage</label>
              <p className="text-sm mt-1">{org.maxStorageGb || 0} GB</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      {(org.suspendedAt || org.cancelledAt) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-red-600">Status Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {org.suspendedAt && (
              <p className="text-sm">
                <span className="font-medium">Suspended:</span>{' '}
                {new Date(org.suspendedAt).toLocaleString()}
              </p>
            )}
            {org.cancelledAt && (
              <p className="text-sm">
                <span className="font-medium">Cancelled:</span>{' '}
                {new Date(org.cancelledAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}

