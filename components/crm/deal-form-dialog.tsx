"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDealAction, updateDealAction, getDealStagesAction } from "@/actions/deals-actions";
import { getContactsAction } from "@/actions/contacts-actions";
import { SelectDeal, SelectDealStage, SelectContact } from "@/db/schema";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface DealFormDialogProps {
  organizationId: string;
  deal?: SelectDeal;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DealFormDialog({ organizationId, deal, trigger, onSuccess }: DealFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<SelectDealStage[]>([]);
  const [contacts, setContacts] = useState<SelectContact[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    value: deal?.value || "0",
    stage: deal?.stage || "",
    probability: deal?.probability || 0,
    contactId: deal?.contactId || "",
    expectedCloseDate: deal?.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : "",
    notes: deal?.notes || "",
  });

  useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);

  const loadFormData = async () => {
    // Load deal stages
    const stagesResult = await getDealStagesAction(organizationId);
    if (stagesResult.isSuccess && stagesResult.data) {
      const stages = stagesResult.data;
      setStages(stages);
      if (!formData.stage && stages.length > 0) {
        setFormData(prev => ({ ...prev, stage: stages[0].name }));
      }
    }
    
    // Load contacts
    const contactsResult = await getContactsAction({ limit: 100 });
    if (contactsResult.success && contactsResult.data) {
      setContacts(contactsResult.data.contacts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dealData = {
        ...formData,
        value: formData.value.toString(),
        contactId: formData.contactId || undefined,
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
      };

      if (deal) {
        // Update existing deal
        const result = await updateDealAction(deal.id, organizationId, dealData);
        if (result.isSuccess) {
          toast({ title: "Success", description: "Deal updated successfully" });
          setOpen(false);
          onSuccess?.();
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      } else {
        // Create new deal
        const result = await createDealAction({
          ...dealData,
          organizationId,
          ownerId: "",
          createdBy: "",
        });
        if (result.isSuccess) {
          toast({ title: "Success", description: "Deal created successfully" });
          setOpen(false);
          setFormData({
            title: "",
            value: "0",
            stage: stages[0]?.name || "",
            probability: 0,
            contactId: "",
            expectedCloseDate: "",
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
        {trigger || <Button>Add Deal</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit Deal" : "Add New Deal"}</DialogTitle>
          <DialogDescription>
            {deal ? "Update deal information" : "Create a new deal opportunity"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Enterprise Software License"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Deal Value ($) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%) *</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.name}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactId">Associated Contact</Label>
            <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select contact (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No contact</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} {contact.company && `- ${contact.company}`}
                  </SelectItem>
                ))}
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
              placeholder="Add any additional notes about this deal..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deal ? "Update" : "Create"} Deal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}




