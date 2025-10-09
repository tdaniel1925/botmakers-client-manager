"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getOrganizationByIdAction } from "@/actions/platform-actions";
import { suspendOrganizationAction, activateOrganizationAction } from "@/actions/organizations-admin-actions";
import { getOrganizationContactsAction, deleteOrganizationContactAction } from "@/actions/organization-contacts-actions";
import { resendCredentialsAction } from "@/actions/resend-credentials-action";
import { updateOrganizationAction } from "@/actions/organizations-admin-actions";
import { Building2, Users, Calendar, Shield, Loader2, Phone, Key, Copy, AlertCircle, CheckCircle, Send, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrganizationContactCard } from "@/components/dashboard/organization-contact-card";
import { AddOrganizationContactDialog } from "@/components/dashboard/add-organization-contact-dialog";
import { EditOrganizationContactDialog } from "@/components/dashboard/edit-organization-contact-dialog";
import { ResendCredentialsDialog } from "@/components/platform/resend-credentials-dialog";
import { EditOrganizationDialog } from "@/components/platform/edit-organization-dialog";
import type { SelectOrganizationContact } from "@/db/schema";
import { useConfirm } from "@/hooks/use-confirm";

export default function OrganizationDetailPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [contacts, setContacts] = useState<SelectOrganizationContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [editContact, setEditContact] = useState<SelectOrganizationContact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [editOrgDialogOpen, setEditOrgDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      setIsLoading(true);
      const orgResult = await getOrganizationByIdAction(params.id as string);

      if (orgResult.isSuccess && orgResult.data) {
        setOrg(orgResult.data);
        // Load contacts after organization is loaded
        loadContacts();
      } else {
        toast.error("Organization not found");
        router.push("/platform/organizations");
      }
      setIsLoading(false);
    };

    fetchOrg();
  }, [params.id, router]);

  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const result = await getOrganizationContactsAction(params.id as string, {
        isActive: true,
        limit: 100,
      });

      if (result.isSuccess && result.data) {
        setContacts(result.data.contacts);
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleEditContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setEditContact(contact);
      setEditDialogOpen(true);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    const confirmed = await confirm({
      title: "Delete Contact?",
      description: "Are you sure you want to delete this contact? This action cannot be undone.",
      confirmText: "Delete Contact",
      variant: "danger",
    });
    
    if (!confirmed) return;

    try {
      const result = await deleteOrganizationContactAction(contactId, params.id as string);

      if (result.isSuccess) {
        toast.success("Contact deleted successfully");
        loadContacts();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  const handleSuspend = async () => {
    const confirmed = await confirm({
      title: "Suspend Organization?",
      description: "This will suspend the organization and prevent all users from accessing the system. You can reactivate it later.",
      confirmText: "Suspend Organization",
      variant: "warning",
    });
    
    if (!confirmed) return;
    
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

  const handleResendCredentials = async (email: string) => {
    const result = await resendCredentialsAction(params.id as string, email);
    
    if (result.isSuccess) {
      toast.success(result.message, {
        duration: 5000,
        icon: '✅',
      });
      
      // Update the org state with new sent timestamp
      setOrg({ ...org, credentialsSentAt: new Date() });
    } else {
      toast.error(result.message, {
        duration: 5000,
      });
      throw new Error(result.message); // Propagate error to dialog
    }
  };

  const handleUpdateOrganization = async (data: any) => {
    const result = await updateOrganizationAction(params.id as string, data);
    
    if (result.isSuccess) {
      toast.success("Organization updated successfully", {
        duration: 3000,
        icon: '✅',
      });
      
      // Update the org state with new data
      setOrg({ ...org, ...data });
    } else {
      toast.error(result.message);
      throw new Error(result.message); // Propagate error to dialog
    }
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
            <Button 
              variant="outline"
              onClick={() => setEditOrgDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
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
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Phone className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Organization contacts</p>
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
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      {/* Temporary Credentials Section */}
      {org.tempUsername && org.tempPassword && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-yellow-600" />
                <div>
                  <CardTitle>Temporary Login Credentials</CardTitle>
                  <CardDescription>One-time credentials for organization setup</CardDescription>
                </div>
              </div>
              {org.credentialsExpiresAt && new Date(org.credentialsExpiresAt) < new Date() && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Expired
                </Badge>
              )}
              {org.credentialsUsedAt && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Used
                </Badge>
              )}
              {org.credentialsExpiresAt && new Date(org.credentialsExpiresAt) > new Date() && !org.credentialsUsedAt && (
                <Badge variant="default" className="bg-yellow-600">Active</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(org.tempUsername);
                      toast.success("Username copied!");
                    }}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-base font-mono bg-gray-50 p-2 rounded border">{org.tempUsername}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(org.tempPassword);
                      toast.success("Password copied!");
                    }}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-base font-mono bg-gray-50 p-2 rounded border">{org.tempPassword}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {org.credentialsSentAt && (
                <div>
                  <label className="font-medium text-gray-600">Sent</label>
                  <p className="text-gray-800 mt-1">
                    {new Date(org.credentialsSentAt).toLocaleDateString()} at{' '}
                    {new Date(org.credentialsSentAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
              {org.credentialsExpiresAt && (
                <div>
                  <label className="font-medium text-gray-600">Expires</label>
                  <p className={`mt-1 ${new Date(org.credentialsExpiresAt) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-800'}`}>
                    {new Date(org.credentialsExpiresAt).toLocaleDateString()} at{' '}
                    {new Date(org.credentialsExpiresAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
              {org.credentialsUsedAt && (
                <div>
                  <label className="font-medium text-gray-600">Used</label>
                  <p className="text-green-600 font-semibold mt-1">
                    {new Date(org.credentialsUsedAt).toLocaleDateString()} at{' '}
                    {new Date(org.credentialsUsedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-100 rounded border border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-700 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">Important Security Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>These credentials are for one-time setup only</li>
                  <li>They will expire {org.credentialsExpiresAt ? `on ${new Date(org.credentialsExpiresAt).toLocaleDateString()}` : 'in 7 days'}</li>
                  <li>The organization should change their password after first login</li>
                  <li>Once used, these credentials cannot be reused</li>
                </ul>
              </div>
            </div>

            {/* Resend Credentials Button */}
            {!org.credentialsUsedAt && org.credentialsExpiresAt && new Date(org.credentialsExpiresAt) > new Date() && (
              <div className="pt-4 border-t border-yellow-200">
                <Button
                  onClick={() => setResendDialogOpen(true)}
                  variant="outline"
                  className="w-full border-yellow-300 hover:bg-yellow-100"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Resend Credentials Email
                </Button>
                <p className="text-xs text-gray-600 text-center mt-2">
                  Click to manually send credentials to a different email address
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organization Contacts Section - NEW */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Organization Contacts
              </CardTitle>
              <CardDescription>
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''} for this organization
              </CardDescription>
            </div>
            <AddOrganizationContactDialog
              organizationId={params.id as string}
              onSuccess={loadContacts}
            />
          </div>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading contacts...</span>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No contacts yet</p>
              <p className="text-sm text-gray-500">
                Add a contact to keep track of people in this organization
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <OrganizationContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Edit Contact Dialog */}
      <EditOrganizationContactDialog
        contact={editContact}
        organizationId={params.id as string}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadContacts}
      />

      {/* Resend Credentials Dialog */}
      <ResendCredentialsDialog
        open={resendDialogOpen}
        onOpenChange={setResendDialogOpen}
        defaultEmail={org?.email || ""}
        onConfirm={handleResendCredentials}
      />

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        organization={org}
        open={editOrgDialogOpen}
        onOpenChange={setEditOrgDialogOpen}
        onSave={handleUpdateOrganization}
      />
      
      <ConfirmDialog />
    </main>
  );
}