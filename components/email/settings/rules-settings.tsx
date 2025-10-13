/**
 * Rules & Filters Settings Tab
 * Create and manage email automation rules
 */

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import {
  getRulesAction,
  createRuleAction,
  updateRuleAction,
  deleteRuleAction,
  toggleRuleAction,
} from '@/actions/email-rules-actions';
import type { SelectEmailAccount, SelectEmailRule } from '@/db/schema/email-schema';

interface RulesSettingsProps {
  account: SelectEmailAccount;
  folders: any[];
  onUpdate?: () => void;
}

export function RulesSettings({ account, folders, onUpdate }: RulesSettingsProps) {
  const [rules, setRules] = useState<SelectEmailRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<SelectEmailRule | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadRules();
  }, [account.id]);

  async function loadRules() {
    setLoading(true);
    try {
      const result = await getRulesAction(account.id);
      if (result.success && result.rules) {
        setRules(result.rules);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRule(ruleId: string, enabled: boolean) {
    try {
      const result = await toggleRuleAction(ruleId, enabled);
      if (result.success) {
        setRules(rules.map(r => r.id === ruleId ? { ...r, enabled } : r));
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      const result = await deleteRuleAction(ruleId);
      if (result.success) {
        setRules(rules.filter(r => r.id !== ruleId));
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  }

  function handleEdit(rule: SelectEmailRule) {
    setEditingRule(rule);
    setShowForm(true);
  }

  function handleCancelEdit() {
    setEditingRule(null);
    setShowForm(false);
  }

  async function handleSaveRule(ruleData: any) {
    try {
      if (editingRule) {
        const result = await updateRuleAction(editingRule.id, ruleData);
        if (result.success) {
          await loadRules();
          handleCancelEdit();
          onUpdate?.();
        }
      } else {
        const result = await createRuleAction({ ...ruleData, accountId: account.id });
        if (result.success) {
          await loadRules();
          handleCancelEdit();
          onUpdate?.();
        }
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Failed to save rule');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Email Rules & Filters</h3>
          <p className="text-sm text-muted-foreground">
            Automatically organize and manage incoming emails
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        )}
      </div>

      {/* Rule Form */}
      {showForm && (
        <RuleForm
          rule={editingRule}
          folders={folders}
          onSave={handleSaveRule}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Rules List */}
      {!showForm && rules.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No rules created yet</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Rule
          </Button>
        </div>
      )}

      {!showForm && rules.length > 0 && (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={rule.enabled ?? true}
                      onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <h4 className="font-medium">{rule.name}</h4>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground ml-7 mb-2">
                      {rule.description}
                    </p>
                  )}
                  <div className="ml-7 text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Conditions:</span>{' '}
                      {formatConditions(rule.conditions)}
                    </p>
                    <p>
                      <span className="font-medium">Actions:</span>{' '}
                      {formatActions(rule.actions)}
                    </p>
                    {rule.matchCount ? (
                      <p>
                        <span className="font-medium">Matched:</span> {rule.matchCount} times
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RuleForm({
  rule,
  folders,
  onSave,
  onCancel,
}: {
  rule: SelectEmailRule | null;
  folders: any[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [saving, setSaving] = useState(false);

  // Conditions
  const [fromContains, setFromContains] = useState('');
  const [toContains, setToContains] = useState('');
  const [subjectContains, setSubjectContains] = useState('');
  const [bodyContains, setBodyContains] = useState('');
  const [hasAttachments, setHasAttachments] = useState(false);

  // Actions
  const [actionType, setActionType] = useState<string>('move_to_folder');
  const [targetFolder, setTargetFolder] = useState('');
  const [markAs, setMarkAs] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [autoReplyMessage, setAutoReplyMessage] = useState('');

  useEffect(() => {
    if (rule) {
      // Load existing rule data
      const conditions = rule.conditions as any;
      const actions = rule.actions as any;

      if (conditions.rules) {
        conditions.rules.forEach((cond: any) => {
          if (cond.field === 'from') setFromContains(cond.value);
          if (cond.field === 'to') setToContains(cond.value);
          if (cond.field === 'subject') setSubjectContains(cond.value);
          if (cond.field === 'body') setBodyContains(cond.value);
          if (cond.field === 'has_attachments') setHasAttachments(cond.value);
        });
      }

      if (actions.length > 0) {
        const action = actions[0];
        setActionType(action.type);
        if (action.type === 'move_to_folder') setTargetFolder(action.folder);
        if (action.type === 'mark_as') setMarkAs(action.status);
        if (action.type === 'forward') setForwardTo(action.email);
        if (action.type === 'auto_reply') setAutoReplyMessage(action.message);
      }
    }
  }, [rule]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Build conditions
    const conditionRules: any[] = [];
    if (fromContains) conditionRules.push({ field: 'from', operator: 'contains', value: fromContains });
    if (toContains) conditionRules.push({ field: 'to', operator: 'contains', value: toContains });
    if (subjectContains) conditionRules.push({ field: 'subject', operator: 'contains', value: subjectContains });
    if (bodyContains) conditionRules.push({ field: 'body', operator: 'contains', value: bodyContains });
    if (hasAttachments) conditionRules.push({ field: 'has_attachments', operator: 'equals', value: true });

    // Build actions
    const actionsList: any[] = [];
    if (actionType === 'move_to_folder' && targetFolder) {
      actionsList.push({ type: 'move_to_folder', folder: targetFolder });
    } else if (actionType === 'mark_as' && markAs) {
      actionsList.push({ type: 'mark_as', status: markAs });
    } else if (actionType === 'forward' && forwardTo) {
      actionsList.push({ type: 'forward', email: forwardTo });
    } else if (actionType === 'auto_reply' && autoReplyMessage) {
      actionsList.push({ type: 'auto_reply', message: autoReplyMessage });
    } else if (actionType === 'delete') {
      actionsList.push({ type: 'delete' });
    }

    try {
      await onSave({
        name,
        description,
        enabled: true,
        priority: 0,
        conditions: {
          logic: 'AND',
          rules: conditionRules,
        },
        actions: actionsList,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4 bg-muted/20">
      <div className="space-y-2">
        <Label htmlFor="rule-name">Rule Name*</Label>
        <Input
          id="rule-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Move newsletters to folder"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rule-description">Description</Label>
        <Textarea
          id="rule-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="min-h-[60px]"
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">When email matches:</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="from-contains">From contains</Label>
            <Input
              id="from-contains"
              value={fromContains}
              onChange={(e) => setFromContains(e.target.value)}
              placeholder="e.g., newsletter@"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-contains">To contains</Label>
            <Input
              id="to-contains"
              value={toContains}
              onChange={(e) => setToContains(e.target.value)}
              placeholder="e.g., support@"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-contains">Subject contains</Label>
            <Input
              id="subject-contains"
              value={subjectContains}
              onChange={(e) => setSubjectContains(e.target.value)}
              placeholder="e.g., Invoice"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body-contains">Body contains</Label>
            <Input
              id="body-contains"
              value={bodyContains}
              onChange={(e) => setBodyContains(e.target.value)}
              placeholder="e.g., unsubscribe"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasAttachments}
              onChange={(e) => setHasAttachments(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">Has attachments</span>
          </label>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Perform action:</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="action-type">Action Type*</Label>
            <select
              id="action-type"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="move_to_folder">Move to folder</option>
              <option value="mark_as">Mark as...</option>
              <option value="forward">Forward to...</option>
              <option value="auto_reply">Send auto-reply</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {actionType === 'move_to_folder' && (
            <div className="space-y-2">
              <Label htmlFor="target-folder">Target Folder*</Label>
              <select
                id="target-folder"
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select folder...</option>
                {folders.map((folder) => (
                  <option key={folder.id || folder.name} value={folder.name}>
                    {folder.displayName || folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {actionType === 'mark_as' && (
            <div className="space-y-2">
              <Label htmlFor="mark-as">Mark as*</Label>
              <select
                id="mark-as"
                value={markAs}
                onChange={(e) => setMarkAs(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select status...</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
                <option value="starred">Starred</option>
                <option value="important">Important</option>
              </select>
            </div>
          )}

          {actionType === 'forward' && (
            <div className="space-y-2">
              <Label htmlFor="forward-to">Forward to email*</Label>
              <Input
                id="forward-to"
                type="email"
                value={forwardTo}
                onChange={(e) => setForwardTo(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          )}

          {actionType === 'auto_reply' && (
            <div className="space-y-2">
              <Label htmlFor="auto-reply">Auto-reply message*</Label>
              <Textarea
                id="auto-reply"
                value={autoReplyMessage}
                onChange={(e) => setAutoReplyMessage(e.target.value)}
                placeholder="Thank you for your email..."
                className="min-h-[80px]"
                required
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {rule ? 'Update Rule' : 'Create Rule'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function formatConditions(conditions: any): string {
  if (!conditions || !conditions.rules || conditions.rules.length === 0) {
    return 'Any email';
  }

  const parts = conditions.rules.map((rule: any) => {
    if (rule.field === 'has_attachments') {
      return 'has attachments';
    }
    return `${rule.field} ${rule.operator} "${rule.value}"`;
  });

  return parts.join(' AND ');
}

function formatActions(actions: any): string {
  if (!actions || actions.length === 0) {
    return 'No action';
  }

  const parts = actions.map((action: any) => {
    if (action.type === 'move_to_folder') {
      return `move to ${action.folder}`;
    }
    if (action.type === 'mark_as') {
      return `mark as ${action.status}`;
    }
    if (action.type === 'forward') {
      return `forward to ${action.email}`;
    }
    if (action.type === 'auto_reply') {
      return 'send auto-reply';
    }
    if (action.type === 'delete') {
      return 'delete';
    }
    return action.type;
  });

  return parts.join(', ');
}



