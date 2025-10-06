"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createActivityAction, updateActivityAction } from "@/actions/activities-actions";
import { getContactsAction } from "@/actions/contacts-actions";
import { getDealsAction } from "@/actions/deals-actions";
import { SelectActivity, SelectContact, SelectDeal } from "@/db/schema";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ActivityFormDialogProps {
  organizationId: string;
  activity?: SelectActivity;
  prefilledContactId?: string;
  prefilledDealId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ActivityFormDialog({ 
  organizationId, 
  activity, 
  prefilledContactId,
  prefilledDealId,
  trigger, 
  onSuccess 
}: ActivityFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<SelectContact[]>([]);
  const [deals, setDeals] = useState<SelectDeal[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    type: activity?.type || "task",
    subject: activity?.subject || "",
    description: activity?.description || "",
    dueDate: activity?.dueDate ? new Date(activity.dueDate).toISOString().slice(0, 16) : "",
    contactId: activity?.contactId || prefilledContactId || "",
    dealId: activity?.dealId || prefilledDealId || "",
  });

  useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);

  const loadFormData = async () => {
    // Load contacts
    const contactsResult = await getContactsAction(organizationId, { limit: 100 });
    if (contactsResult.isSuccess && contactsResult.data) {
      setContacts(contactsResult.data.contacts);
    }
    
    // Load deals
    const dealsResult = await getDealsAction(organizationId, { limit: 100 });
    if (dealsResult.isSuccess && dealsResult.data) {
      setDeals(dealsResult.data.deals);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activityData = {
        ...formData,
        contactId: formData.contactId || undefined,
        dealId: formData.dealId || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      if (activity) {
        // Update existing activity
        const result = await updateActivityAction(activity.id, organizationId, activityData);
        if (result.isSuccess) {
          toast({ title: "Success", description: "Activity updated successfully" });
          setOpen(false);
          onSuccess?.();
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      } else {
        // Create new activity
        const result = await createActivityAction({
          ...activityData,
          type: activityData.type as any,
          organizationId,
          userId: "",
          createdBy: "",
        });
        if (result.isSuccess) {
          toast({ title: "Success", description: "Activity created successfully" });
          setOpen(false);
          setFormData({
            type: "task",
            subject: "",
            description: "",
            dueDate: "",
            contactId: prefilledContactId || "",
            dealId: prefilledDealId || "",
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
        {trigger || <Button>Add Activity</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
          <DialogDescription>
            {activity ? "Update activity information" : "Create a new activity or task"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date & Time</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Follow-up call with client"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Add details about this activity..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactId">Related Contact</Label>
              <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No contact</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealId">Related Deal</Label>
              <Select value={formData.dealId} onValueChange={(value) => setFormData({ ...formData, dealId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deal (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No deal</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {activity ? "Update" : "Create"} Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



