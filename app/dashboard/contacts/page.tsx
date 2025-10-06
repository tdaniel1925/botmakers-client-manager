"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContactFormDialog } from "@/components/crm/contact-form-dialog";
import { getContactsAction, deleteContactAction } from "@/actions/contacts-actions";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { SelectContact } from "@/db/schema";
import { Search, Plus, Trash2, Edit, Mail, Phone, Building2, UserCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { TableSkeleton } from "@/components/crm/loading-skeleton";
import { ErrorState, EmptyState } from "@/components/crm/error-state";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<SelectContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<SelectContact | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, [searchTerm]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get user's organization
      const orgsResult = await getUserOrganizationsAction();
      if (!orgsResult.isSuccess || !orgsResult.data || orgsResult.data.length === 0) {
        setError("No organization found. Please contact your administrator.");
        setLoading(false);
        return;
      }
      
      const orgId = orgsResult.data[0].id;
      setOrganizationId(orgId);
      
      // Fetch contacts
      const result = await getContactsAction(orgId, {
        search: searchTerm,
        limit: 100,
      });
      
      if (result.isSuccess && result.data) {
        setContacts(result.data.contacts);
      } else {
        setError(result.message || "Failed to load contacts");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      toast({ title: "Error", description: "Failed to load contacts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    
    try {
      const result = await deleteContactAction(contactToDelete.id, organizationId);
      if (result.isSuccess) {
        toast({ title: "Success", description: "Contact deleted successfully" });
        loadContacts();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete contact", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error && !organizationId) {
    return (
      <main className="p-4 md:p-6 lg:p-10">
        <ErrorState
          title="No Organization Found"
          message="You need to be part of an organization to manage contacts."
          showHome={true}
        />
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-10">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Contacts</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your customer relationships</p>
          </div>
          {organizationId && (
            <ContactFormDialog organizationId={organizationId} onSuccess={loadContacts} />
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Contacts ({contacts.length})</CardTitle>
          <CardDescription className="text-sm">
            View and manage your contact database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <ErrorState
              title="Failed to Load Contacts"
              message={error}
              onRetry={loadContacts}
            />
          ) : loading ? (
            <TableSkeleton rows={5} />
          ) : contacts.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              message={searchTerm ? "No contacts match your search criteria." : "Get started by adding your first contact."}
              icon={<UserCircle className="h-16 w-16" />}
              action={!searchTerm ? {
                label: "Add Your First Contact",
                onClick: () => {}
              } : undefined}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Link href={`/dashboard/contacts/${contact.id}`} className="font-medium hover:underline">
                            {contact.firstName} {contact.lastName}
                          </Link>
                          {contact.jobTitle && (
                            <p className="text-xs text-gray-500">{contact.jobTitle}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.company && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              {contact.company}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="truncate max-w-[200px]">{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(contact.status)}>
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ContactFormDialog
                              organizationId={organizationId}
                              contact={contact}
                              onSuccess={loadContacts}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setContactToDelete(contact);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link href={`/dashboard/contacts/${contact.id}`} className="font-medium hover:underline text-base">
                          {contact.firstName} {contact.lastName}
                        </Link>
                        {contact.jobTitle && (
                          <p className="text-xs text-gray-500">{contact.jobTitle}</p>
                        )}
                      </div>
                      <Badge className={getStatusBadgeColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </div>
                    
                    {contact.company && (
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {contact.company}
                      </div>
                    )}
                    
                    <div className="space-y-1 mb-3">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <ContactFormDialog
                          organizationId={organizationId}
                          contact={contact}
                          onSuccess={loadContacts}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setContactToDelete(contact);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {contactToDelete?.firstName} {contactToDelete?.lastName} from your contacts.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

