/**
 * Snippets Manager Component
 * UI for managing email text snippets
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Command, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  getSnippetsAction,
  createSnippetAction,
  updateSnippetAction,
  deleteSnippetAction,
  getDefaultSnippets,
} from '@/actions/email-snippets-actions';
import type { SelectEmailSnippet, InsertEmailSnippet } from '@/db/schema/email-schema';

interface SnippetsManagerProps {
  onClose: () => void;
}

export function SnippetsManager({ onClose }: SnippetsManagerProps) {
  const [snippets, setSnippets] = useState<SelectEmailSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertEmailSnippet>>({
    shortcut: '',
    content: '',
    description: '',
    category: '',
    variables: [],
  });

  useEffect(() => {
    loadSnippets();
  }, []);

  async function loadSnippets() {
    try {
      setLoading(true);
      const result = await getSnippetsAction();
      if (result.success && result.snippets) {
        setSnippets(result.snippets);
      }
    } catch (error) {
      console.error('Error loading snippets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!formData.shortcut || !formData.content) {
      alert('Shortcut and content are required');
      return;
    }

    const result = await createSnippetAction(formData as Omit<InsertEmailSnippet, 'userId'>);
    if (result.success) {
      setCreating(false);
      setFormData({ shortcut: '', content: '', description: '', category: '', variables: [] });
      loadSnippets();
    } else {
      alert(result.error || 'Failed to create snippet');
    }
  }

  async function handleUpdate(id: string) {
    const result = await updateSnippetAction(id, formData);
    if (result.success) {
      setEditingId(null);
      setFormData({ shortcut: '', content: '', description: '', category: '', variables: [] });
      loadSnippets();
    } else {
      alert(result.error || 'Failed to update snippet');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    const result = await deleteSnippetAction(id);
    if (result.success) {
      loadSnippets();
    } else {
      alert(result.error || 'Failed to delete snippet');
    }
  }

  function startEditing(snippet: SelectEmailSnippet) {
    setEditingId(snippet.id);
    setFormData({
      shortcut: snippet.shortcut,
      content: snippet.content,
      description: snippet.description || '',
      category: snippet.category || '',
      variables: snippet.variables || [],
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setCreating(false);
    setFormData({ shortcut: '', content: '', description: '', category: '', variables: [] });
  }

  async function handleInstallDefaults() {
    const defaults = getDefaultSnippets();
    for (const snippet of defaults) {
      await createSnippetAction(snippet);
    }
    loadSnippets();
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border shadow-lg rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Command className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Email Snippets</h2>
              <p className="text-sm text-muted-foreground">
                Create text shortcuts for faster email composition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading snippets...</div>
          ) : (
            <div className="space-y-4">
              {/* Install Defaults Button */}
              {snippets.length === 0 && !creating && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 text-center">
                  <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No snippets yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started with our pre-built templates
                  </p>
                  <Button onClick={handleInstallDefaults} variant="default">
                    Install Default Snippets
                  </Button>
                </div>
              )}

              {/* Create New Button */}
              {!creating && !editingId && snippets.length > 0 && (
                <Button onClick={() => setCreating(true)} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Snippet
                </Button>
              )}

              {/* Create Form */}
              {creating && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Snippet
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="shortcut">Shortcut (e.g., ;meeting)*</Label>
                      <Input
                        id="shortcut"
                        value={formData.shortcut}
                        onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                        placeholder=";mysnippet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content*</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Your email template..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Brief description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="meetings, responses, etc."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreate} size="sm">
                        <Save className="h-3 w-3 mr-1" />
                        Create
                      </Button>
                      <Button onClick={cancelEditing} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Snippet List */}
              {snippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="border rounded-lg p-4 space-y-2 hover:shadow-sm transition-shadow"
                >
                  {editingId === snippet.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Snippet
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <Label>Shortcut*</Label>
                          <Input
                            value={formData.shortcut}
                            onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Content*</Label>
                          <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Input
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(snippet.id)} size="sm">
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button onClick={cancelEditing} size="sm" variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {snippet.shortcut}
                            </span>
                            {snippet.category && (
                              <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                                {snippet.category}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {snippet.usageCount} uses
                            </span>
                          </div>
                          {snippet.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {snippet.description}
                            </p>
                          )}
                          <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-2 rounded">
                            {snippet.content}
                          </p>
                          {snippet.variables && snippet.variables.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {snippet.variables.map((variable, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono"
                                >
                                  {variable}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            onClick={() => startEditing(snippet)}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(snippet.id)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              <p className="font-semibold mb-1">How to use:</p>
              <p>Type <code className="bg-muted px-1 rounded">;</code> or <code className="bg-muted px-1 rounded">/</code> in the email composer to trigger snippets</p>
            </div>
            <Button onClick={onClose} variant="default">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


