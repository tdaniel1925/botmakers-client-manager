"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard, GradientCardContent, GradientCardHeader } from "@/components/ui/gradient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactFormDialog } from "@/components/crm/contact-form-dialog";
import { Pagination } from "@/components/ui/pagination";
import { 
  getContactsAction, 
  deleteContactAction,
  getContactCountByStatusAction,
  bulkDeleteContactsAction,
  quickUpdateContactFieldAction
} from "@/actions/contacts-actions";
import { SelectContact } from "@/db/schema";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  MoreVertical,
  Loader2,
  X,
  Download,
  Tag,
  ChevronDown,
  Trash2,
  CheckSquare
} from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@/lib/organization-context";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonStats, SkeletonTable } from "@/components/ui/skeleton-card";
import { EmptyState, FilteredEmptyState } from "@/components/ui/empty-state";
import { InlineEditCell } from "@/components/ui/inline-edit-cell";

const ITEMS_PER_PAGE = 25;

const STATUS_COLORS = {
  lead: "bg-blue-100 text-blue-800 border-blue-200",
  prospect: "bg-purple-100 text-purple-800 border-purple-200",
  customer: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
};

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest First" },
  { value: "createdAt-asc", label: "Oldest First" },
  { value: "firstName-asc", label: "Name (A-Z)" },
  { value: "firstName-desc", label: "Name (Z-A)" },
  { value: "company-asc", label: "Company (A-Z)" },
  { value: "company-desc", label: "Company (Z-A)" },
];

export default function ContactsPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const { organizationId } = useOrganization();
  const router = useRouter();
  
  const [contacts, setContacts] = useState<SelectContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<SelectContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  
  // Bulk selection
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt-desc");
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState<SelectContact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadContacts();
      loadStatusCounts();
    }
  }, [organizationId, currentPage, statusFilter, sortBy]);

  useEffect(() => {
    // Reset to page 1 when search or filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadContacts();
    }
  }, [searchQuery]);

  const loadContacts = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    try {
      const [sortField, sortOrder] = sortBy.split("-") as [any, "asc" | "desc"];
      
      const options: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        sortBy: sortField,
        sortOrder: sortOrder,
      };
      
      if (searchQuery) {
        options.search = searchQuery;
      }
      
      if (statusFilter !== "all") {
        options.status = statusFilter;
      }
      
      const result = await getContactsAction(organizationId, options);
      
      if (result.isSuccess && result.data) {
        setContacts(result.data.contacts);
        setFilteredContacts(result.data.contacts);
        setTotalContacts(result.data.total);
      } else {
        toast.error(result.message || "Failed to load contacts");
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatusCounts = async () => {
    if (!organizationId) return;
    
    try {
      const result = await getContactCountByStatusAction(organizationId);
      if (result.isSuccess && result.data) {
        setStatusCounts(result.data);
      }
    } catch (error) {
      console.error("Error loading status counts:", error);
    }
  };

  const handleEdit = (contact: SelectContact) => {
    setEditContact(contact);
    setEditDialogOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!organizationId) return;
    
    const confirmed = await confirm({
      title: "Delete Contact",
      description: "Are you sure you want to delete this contact? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive"
    });

    if (!confirmed) return;

    const result = await deleteContactAction(contactId, organizationId);
    
    if (result.isSuccess) {
      toast.success("Contact deleted successfully");
      loadContacts();
      loadStatusCounts();
    } else {
      toast.error(result.message || "Failed to delete contact");
    }
  };

  const handleSuccess = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditContact(null);
    loadContacts();
    loadStatusCounts();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("createdAt-desc");
    setCurrentPage(1);
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const toggleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const clearSelection = () => {
    setSelectedContacts(new Set());
  };

  // Inline edit handler
  const handleQuickUpdate = async (contactId: string, field: string, value: string) => {
    if (!organizationId) throw new Error("No organization");
    
    const result = await quickUpdateContactFieldAction(contactId, organizationId, field, value);
    
    if (result.isSuccess) {
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
      loadContacts();
    } else {
      toast.error(result.message || "Failed to update");
      throw new Error(result.message);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!organizationId || selectedContacts.size === 0) return;

    const confirmed = await confirm({
      title: "Delete Contacts",
      description: `Are you sure you want to delete ${selectedContacts.size} contact${selectedContacts.size !== 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive"
    });

    if (!confirmed) return;

    setIsBulkActionLoading(true);
    try {
      const result = await bulkDeleteContactsAction(Array.from(selectedContacts), organizationId);
      
      if (result.isSuccess) {
        toast.success(`Successfully deleted ${selectedContacts.size} contact${selectedContacts.size !== 1 ? 's' : ''}`);
        clearSelection();
        loadContacts();
        loadStatusCounts();
      } else {
        toast.error(result.message || "Failed to delete contacts");
      }
    } catch (error) {
      console.error("Error bulk deleting contacts:", error);
      toast.error("Failed to delete contacts");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedContacts.size === 0) return;

    const contactsToExport = filteredContacts.filter(c => selectedContacts.has(c.id));
    
    // Create CSV content
    const headers = ["First Name", "Last Name", "Email", "Phone", "Company", "Title", "Status"];
    const csvRows = [
      headers.join(","),
      ...contactsToExport.map(contact => [
        contact.firstName || "",
        contact.lastName || "",
        contact.email || "",
        contact.phone || "",
        contact.company || "",
        contact.title || "",
        contact.status || ""
      ].map(field => `"${field}"`).join(","))
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${selectedContacts.size} contact${selectedContacts.size !== 1 ? 's' : ''} to CSV`);
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || sortBy !== "createdAt-desc";

  const totalPages = Math.ceil(totalContacts / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalContacts);

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
          <p className="text-gray-600">Please select an organization to view contacts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Contacts</h1>
          <p className="text-neutral-600">
            Manage your contacts and leads
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <SkeletonStats />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <GradientCard variant="none" className="cursor-pointer p-8" onClick={() => setStatusFilter("all")}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-neutral-600" />
            <span className="text-3xl font-semibold">
              {Object.values(statusCounts).reduce((a, b) => a + b, 0) || 0}
            </span>
          </div>
          <span className="text-sm text-neutral-600">Total Contacts</span>
        </GradientCard>
        
        <GradientCard variant="indigo" className="cursor-pointer p-8" onClick={() => setStatusFilter("lead")}>
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            <span className="text-3xl font-semibold text-indigo-600">{statusCounts.lead || 0}</span>
          </div>
          <span className="text-sm text-neutral-600">Leads</span>
        </GradientCard>
        
        <GradientCard variant="violet" className="cursor-pointer p-8" onClick={() => setStatusFilter("prospect")}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-violet-600" />
            <span className="text-3xl font-semibold text-violet-600">{statusCounts.prospect || 0}</span>
          </div>
          <span className="text-sm text-neutral-600">Prospects</span>
        </GradientCard>
        
        <GradientCard variant="teal" className="cursor-pointer p-8" onClick={() => setStatusFilter("customer")}>
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="w-5 h-5 text-teal-600" />
            <span className="text-3xl font-semibold text-teal-600">{statusCounts.customer || 0}</span>
          </div>
          <span className="text-sm text-neutral-600">Customers</span>
        </GradientCard>
      </div>
      )}

      {/* Search and Filters */}
      <GradientCard variant="none" className="mb-6">
        <GradientCardHeader>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, company, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-neutral-100 rounded-full" : "rounded-full"}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-full">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </GradientCardHeader>

        {/* Results Header / Bulk Actions Toolbar */}
        <GradientCardContent className="pt-0">
          {selectedContacts.size > 0 ? (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection} className="rounded-full">
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={isBulkActionLoading}
                  className="rounded-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                  className="rounded-full"
                >
                  {isBulkActionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <div>
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span>
                    Showing {totalContacts > 0 ? startIndex : 0}-{endIndex} of {totalContacts} contact{totalContacts !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          {isLoading ? (
            <SkeletonTable />
          ) : filteredContacts.length === 0 ? (
            hasActiveFilters ? (
              <FilteredEmptyState 
                onClearFilters={clearFilters}
                resourceName="contacts"
              />
            ) : (
              <EmptyState
                icon={Users}
                title="No contacts yet"
                description="Get started by adding your first contact to your CRM. Contacts help you manage your relationships and track interactions."
                action={{
                  label: "Add Contact",
                  onClick: () => setCreateDialogOpen(true),
                  icon: Plus
                }}
              />
            )
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all contacts"
                        />
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => {
                      const initials = `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();
                      const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Unnamed Contact";
                      const isSelected = selectedContacts.has(contact.id);
                      
                      return (
                        <TableRow
                          key={contact.id}
                          className={`cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectContact(contact.id)}
                              aria-label={`Select ${fullName}`}
                            />
                          </TableCell>
                          <TableCell onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{initials || "?"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{fullName}</div>
                                {contact.title && (
                                  <div className="text-sm text-gray-600">{contact.title}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <InlineEditCell
                                value={contact.company || ""}
                                onSave={(value) => handleQuickUpdate(contact.id, "company", value)}
                                placeholder="Add company"
                              />
                            </div>
                          </TableCell>
                          <TableCell onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}>
                            <Badge variant="outline" className={STATUS_COLORS[contact.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800"}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <InlineEditCell
                                value={contact.email || ""}
                                onSave={(value) => handleQuickUpdate(contact.id, "email", value)}
                                placeholder="Add email"
                              />
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <InlineEditCell
                                value={contact.phone || ""}
                                onSave={(value) => handleQuickUpdate(contact.id, "phone", value)}
                                placeholder="Add phone"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(contact)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(contact.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </GradientCardContent>
      </GradientCard>

      {/* Dialogs */}
      <ContactFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
        organizationId={organizationId}
      />

      {editContact && (
        <ContactFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleSuccess}
          organizationId={organizationId}
          contact={editContact}
          mode="edit"
        />
      )}

      <ConfirmDialog />
    </div>
  );
}

