"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PenTool, Plus, Trash2, Check } from 'lucide-react';
import { 
  getEmailSignaturesAction,
  createEmailSignatureAction,
  updateEmailSignatureAction,
  deleteEmailSignatureAction
} from '@/actions/email-signatures-actions';
import type { SelectEmailSignature } from '@/db/schema/email-signatures-schema';
import { RichTextEditor } from './rich-text-editor';

interface SignatureSelectorProps {
  accountId?: string;
  onSelect: (signature: SelectEmailSignature | null) => void;
  currentSignatureId?: string;
}

export function SignatureSelector({ accountId, onSelect, currentSignatureId }: SignatureSelectorProps) {
  const [open, setOpen] = useState(false);
  const [signatures, setSignatures] = useState<SelectEmailSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSignatureName, setNewSignatureName] = useState('');
  const [newSignatureContent, setNewSignatureContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (open) {
      loadSignatures();
    }
  }, [open, accountId]);

  async function loadSignatures() {
    setLoading(true);
    const result = await getEmailSignaturesAction(accountId);
    if (result.success) {
      setSignatures(result.data || []);
    }
    setLoading(false);
  }

  async function handleSelectSignature(signature: SelectEmailSignature) {
    onSelect(signature);
    setOpen(false);
  }

  async function handleRemoveSignature() {
    onSelect(null);
    setOpen(false);
  }

  async function handleCreateSignature() {
    if (!newSignatureName.trim() || !newSignatureContent.trim()) return;

    const result = await createEmailSignatureAction({
      name: newSignatureName,
      content: newSignatureContent,
      accountId,
      isDefault,
    });

    if (result.success) {
      setShowCreateDialog(false);
      setNewSignatureName('');
      setNewSignatureContent('');
      setIsDefault(false);
      loadSignatures();
    }
  }

  async function handleDeleteSignature(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this signature?')) return;
    
    const result = await deleteEmailSignatureAction(id);
    if (result.success) {
      loadSignatures();
      if (currentSignatureId === id) {
        onSelect(null);
      }
    }
  }

  async function handleSetDefault(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    const result = await updateEmailSignatureAction(id, {
      isDefault: true,
    });
    
    if (result.success) {
      loadSignatures();
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <PenTool className="h-4 w-4" />
            Signature
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Email Signatures</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Signature
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveSignature}
                disabled={!currentSignatureId}
              >
                Remove Signature
              </Button>
            </div>

            {/* Signatures List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading signatures...</div>
              </div>
            ) : signatures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PenTool className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No signatures yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first email signature
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {signatures.map(signature => (
                  <div
                    key={signature.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group ${
                      currentSignatureId === signature.id ? 'bg-muted border-primary' : ''
                    }`}
                  >
                    <PenTool className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleSelectSignature(signature)}
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">{signature.name}</h4>
                        {signature.isDefault && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                            Default
                          </span>
                        )}
                        {currentSignatureId === signature.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div 
                        className="text-xs text-muted-foreground mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: signature.content }}
                      />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!signature.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleSetDefault(signature.id, e)}
                          className="h-8 px-2 text-xs"
                          title="Set as default"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteSignature(signature.id, e)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Signature Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create Email Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto">
            <div>
              <Label htmlFor="signature-name">Signature Name</Label>
              <Input
                id="signature-name"
                placeholder="e.g., Work Signature, Personal"
                value={newSignatureName}
                onChange={(e) => setNewSignatureName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="signature-content">Signature Content</Label>
              <div className="mt-2">
                <RichTextEditor
                  content={newSignatureContent}
                  onChange={setNewSignatureContent}
                  placeholder="Enter your email signature..."
                  className="min-h-[250px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is-default" className="cursor-pointer">
                Set as default signature
              </Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSignature} 
                disabled={!newSignatureName.trim() || !newSignatureContent.trim()}
              >
                Create Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


