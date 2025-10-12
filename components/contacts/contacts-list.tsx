/**
 * Contacts List Component
 * Comprehensive contact management interface
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Star,
  Trash2,
  Edit,
  X,
  Loader2,
} from 'lucide-react';
import { getContactsAction, createContactAction, updateContactAction, deleteContactAction, toggleContactFavoriteAction } from '@/actions/contacts-actions';
import type { SelectContact } from '@/db/schema';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ContactsList() {
  const [contacts, setContacts] = useState<SelectContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<SelectContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    notes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const result = await getContactsAction({ searchQuery });
    if (result.success) {
      setContacts(result.data || []);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const result = await getContactsAction({ searchQuery });
    if (result.success) {
      setContacts(result.data || []);
    }
    setLoading(false);
  };

  const handleAddContact = async () => {
    if (!formData.email) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    const result = await createContactAction({
      ...formData,
      source: 'manual',
    });

    if (result.success) {
      toast({
        title: 'Contact added',
        description: 'New contact has been created',
      });
      setShowAddDialog(false);
      resetForm();
      loadContacts();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleEditContact = async () => {
    if (!editingContact) return;

    const result = await updateContactAction(editingContact.id, formData);

    if (result.success) {
      toast({
        title: 'Contact updated',
        description: 'Contact has been updated',
      });
      setEditingContact(null);
      resetForm();
      loadContacts();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    const result = await deleteContactAction(contactId);

    if (result.success) {
      toast({
        title: 'Contact deleted',
        description: 'Contact has been removed',
      });
      loadContacts();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async (contactId: string) => {
    const result = await toggleContactFavoriteAction(contactId);

    if (result.success) {
      loadContacts();
    }
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (contact: SelectContact) => {
    setFormData({
      name: contact.name || '',
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      jobTitle: contact.jobTitle || '',
      notes: contact.notes || '',
    });
    setEditingContact(contact);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      notes: '',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredContacts = contacts.filter(contact =>
    searchQuery
      ? contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const favoriteContacts = filteredContacts.filter(c => c.isFavorite);
  const regularContacts = filteredContacts.filter(c => !c.isFavorite);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Contacts</h1>
              <p className="text-sm text-muted-foreground">
                {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
              </p>
            </div>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search term' : 'Add your first contact to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Favorites */}
            {favoriteContacts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  Favorites ({favoriteContacts.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {favoriteContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteContact}
                      onToggleFavorite={handleToggleFavorite}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Contacts */}
            {regularContacts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                  All Contacts ({regularContacts.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {regularContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteContact}
                      onToggleFavorite={handleToggleFavorite}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingContact} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingContact(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update contact information' : 'Enter contact details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="CEO"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingContact(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingContact ? handleEditContact : handleAddContact}>
              {editingContact ? 'Update' : 'Add'} Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Contact Card Component
function ContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  getInitials,
}: {
  contact: SelectContact;
  onEdit: (contact: SelectContact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  getInitials: (name: string) => string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={contact.avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                {getInitials(contact.name || contact.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{contact.name || contact.email}</CardTitle>
              {contact.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Building className="h-3 w-3" />
                  {contact.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleFavorite(contact.id)}
            >
              <Star
                className={`h-4 w-4 ${
                  contact.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                }`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.jobTitle && (
          <p className="text-sm text-muted-foreground">{contact.jobTitle}</p>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <a href={`mailto:${contact.email}`} className="hover:underline truncate">
            {contact.email}
          </a>
        </div>
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <a href={`tel:${contact.phone}`} className="hover:underline">
              {contact.phone}
            </a>
          </div>
        )}
        {contact.emailCount && contact.emailCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {contact.emailCount} {contact.emailCount === 1 ? 'email' : 'emails'}
          </Badge>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onEdit(contact)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(contact.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

