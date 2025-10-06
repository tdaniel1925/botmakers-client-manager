"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createContactAction, updateContactAction } from "@/actions/contacts-actions";
import { SelectContact } from "@/db/schema";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ContactFormDialogProps {
  organizationId: string;
  contact?: SelectContact;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ContactFormDialog({ organizationId, contact, trigger, onSuccess }: ContactFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || "",
    lastName: contact?.lastName || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    jobTitle: contact?.jobTitle || "",
    status: contact?.status || "lead",
    notes: contact?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (contact) {
        // Update existing contact
        const result = await updateContactAction(contact.id, organizationId, formData);
        if (result.isSuccess) {
          toast({ title: "Success", description: "Contact updated successfully" });
          setOpen(false);
          onSuccess?.();
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      } else {
        // Create new contact
        const result = await createContactAction({
          ...formData,
          organizationId,
          ownerId: "", // Will be set by the action
          createdBy: "", // Will be set by the action
        });
        if (result.isSuccess) {
          toast({ title: "Success", description: "Contact created successfully" });
          setOpen(false);
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            company: "",
            jobTitle: "",
            status: "lead",
            notes: "",
          });
          onSuccess?.();
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Contact</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
          <DialogDescription>
            {contact ? "Update contact information" : "Create a new contact in your CRM"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contact ? "Update" : "Create"} Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}




