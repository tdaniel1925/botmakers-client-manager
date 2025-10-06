"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrganizationContactCard } from "@/components/dashboard/organization-contact-card";
import { AddOrganizationContactDialog } from "@/components/dashboard/add-organization-contact-dialog";
import { EditOrganizationContactDialog } from "@/components/dashboard/edit-organization-contact-dialog";
import { getOrganizationContactsAction, deleteOrganizationContactAction } from "@/actions/organization-contacts-actions";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { toast } from "sonner";
import { Search, Loader2, Users, AlertCircle } from "lucide-react";
import type { SelectOrganizationContact } from "@/db/schema";

export default function OrganizationContactsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [contacts, setContacts] = useState<SelectOrganizationContact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editContact, setEditContact] = useState<SelectOrganizationContact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load organizations on mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Load contacts when organization changes
  useEffect(() => {
    if (selectedOrgId) {
      loadContacts();
    }
  }, [selectedOrgId, searchQuery]);

  const loadOrganizations = async () => {
    try {
      const result = await getUserOrganizationsAction();
      if (result.isSuccess && result.data) {
        setOrganizations(result.data);
        // Auto-select first organization
        if (result.data.length > 0 && !selectedOrgId) {
          setSelectedOrgId(result.data[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to load organizations");
    }
  };

  const loadContacts = async () => {
    if (!selectedOrgId) return;
    
    setLoading(true);
    try {
      const result = await getOrganizationContactsAction(selectedOrgId, {
        search: searchQuery || undefined,
        isActive: true,
        limit: 100,
        offset: 0,
      });

      if (result.isSuccess && result.data) {
        setContacts(result.data.contacts);
        setTotal(result.data.total);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setEditContact(contact);
      setEditDialogOpen(true);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    try {
      const result = await deleteOrganizationContactAction(contactId, selectedOrgId);
      
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

  const selectedOrg = organizations.find(o => o.id === selectedOrgId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Contacts</h1>
        <p className="text-gray-600">
          Manage contact information for people in your organizations
        </p>
      </div>

      {/* Organization Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Organization</CardTitle>
          <CardDescription>Choose an organization to view and manage its contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="organization">Organization</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedOrgId && (
        <>
          {/* Search and Actions */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search Contacts</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <AddOrganizationContactDialog
                  organizationId={selectedOrgId}
                  onSuccess={loadContacts}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacts List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contacts for {selectedOrg?.name}
                  </CardTitle>
                  <CardDescription>
                    {total} contact{total !== 1 ? 's' : ''} total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading contacts...</span>
                </div>
              ) : contacts.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {searchQuery
                      ? "No contacts found matching your search."
                      : "No contacts yet. Click 'Add Contact' to create your first contact."}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact) => (
                    <OrganizationContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Dialog */}
      <EditOrganizationContactDialog
        contact={editContact}
        organizationId={selectedOrgId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadContacts}
      />
    </div>
  );
}
