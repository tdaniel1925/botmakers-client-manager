'use client';

/**
 * Admin To-Do Review Panel
 * Interface for admins to review, edit, and approve AI-generated to-dos
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Plus,
  AlertCircle,
  Clock,
  User,
  Send,
  Save,
} from 'lucide-react';
import type { OnboardingTodo } from '@/db/schema/onboarding-schema';
import {
  updateTodoAction,
  deleteTodoAction,
  addCustomTodoAction,
  assignTodoAction,
  approveTodosAction,
} from '@/actions/onboarding-todos-actions';
import { useConfirm } from '@/hooks/use-confirm';

interface AdminTodoReviewPanelProps {
  sessionId: string;
  adminTodos: OnboardingTodo[];
  clientTodos: OnboardingTodo[];
  isApproved: boolean;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  currentUserId: string;
  teamMembers?: Array<{ id: string; name: string }>;
  onUpdate?: () => void;
}

export function AdminTodoReviewPanel({
  sessionId,
  adminTodos: initialAdminTodos,
  clientTodos: initialClientTodos,
  isApproved,
  approvedAt,
  approvedBy,
  currentUserId,
  teamMembers = [],
  onUpdate,
}: AdminTodoReviewPanelProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [adminTodos, setAdminTodos] = useState(initialAdminTodos);
  const [clientTodos, setClientTodos] = useState(initialClientTodos);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState<'admin' | 'client' | null>(null);

  // New todo form state
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    category: 'setup',
    priority: 'medium',
    estimatedMinutes: 30,
  });

  const handleEditTodo = async (todoId: string, changes: Partial<OnboardingTodo>) => {
    try {
      const result = await updateTodoAction(todoId, changes);
      
      if (result.isSuccess && result.data) {
        // Update local state
        const updateTodoInList = (todos: OnboardingTodo[]) =>
          todos.map(t => t.id === todoId ? result.data! : t);
        
        if (result.data.type === 'admin') {
          setAdminTodos(updateTodoInList(adminTodos));
        } else {
          setClientTodos(updateTodoInList(clientTodos));
        }
        
        setEditingTodo(null);
        toast.success('To-do updated');
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update to-do');
    }
  };

  const handleDeleteTodo = async (todoId: string, type: 'admin' | 'client') => {
    const confirmed = await confirm({
      title: "Delete To-Do?",
      description: "Are you sure you want to delete this to-do? This action cannot be undone.",
      confirmText: "Delete To-Do",
      variant: "danger",
    });
    
    if (!confirmed) return;

    try {
      const result = await deleteTodoAction(todoId);
      
      if (result.isSuccess) {
        if (type === 'admin') {
          setAdminTodos(adminTodos.filter(t => t.id !== todoId));
        } else {
          setClientTodos(clientTodos.filter(t => t.id !== todoId));
        }
        
        toast.success('To-do deleted');
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete to-do');
    }
  };

  const handleAddCustomTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const result = await addCustomTodoAction(sessionId, {
        ...newTodo,
        type: showAddForm!,
        orderIndex: showAddForm === 'admin' ? adminTodos.length : clientTodos.length,
      });
      
      if (result.isSuccess && result.data) {
        if (showAddForm === 'admin') {
          setAdminTodos([...adminTodos, result.data]);
        } else {
          setClientTodos([...clientTodos, result.data]);
        }
        
        // Reset form
        setNewTodo({
          title: '',
          description: '',
          category: 'setup',
          priority: 'medium',
          estimatedMinutes: 30,
        });
        setShowAddForm(null);
        
        toast.success('To-do added');
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add to-do');
    }
  };

  const handleAssignTodo = async (todoId: string, userId: string) => {
    try {
      const result = await assignTodoAction(todoId, userId);
      
      if (result.isSuccess && result.data) {
        setAdminTodos(adminTodos.map(t => t.id === todoId ? result.data! : t));
        toast.success('To-do assigned');
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to assign to-do');
    }
  };

  const handleApproveTodos = async () => {
    const confirmed = await confirm({
      title: "Approve To-Dos?",
      description: "Are you sure you want to approve these to-dos? They will be sent to the client and become visible in their onboarding workflow.",
      confirmText: "Approve & Send",
    });
    
    if (!confirmed) return;

    setIsApproving(true);
    try {
      const result = await approveTodosAction(sessionId, currentUserId);
      
      if (result.isSuccess) {
        toast.success('To-dos approved and sent to client!');
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to approve to-dos');
    } finally {
      setIsApproving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'setup':
        return 'bg-purple-100 text-purple-800';
      case 'compliance':
        return 'bg-orange-100 text-orange-800';
      case 'content':
        return 'bg-green-100 text-green-800';
      case 'integration':
        return 'bg-indigo-100 text-indigo-800';
      case 'review':
        return 'bg-cyan-100 text-cyan-800';
      case 'technical':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const TodoCard = ({ todo, type }: { todo: OnboardingTodo; type: 'admin' | 'client' }) => {
    const isEditing = editingTodo === todo.id;

    return (
      <Card className="mb-3">
        <CardContent className="pt-4">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={todo.title}
                onChange={(e) => handleEditTodo(todo.id, { title: e.target.value })}
                placeholder="To-do title"
                className="font-medium"
              />
              <Textarea
                value={todo.description || ''}
                onChange={(e) => handleEditTodo(todo.id, { description: e.target.value })}
                placeholder="Description"
                rows={3}
              />
              <div className="flex gap-2">
                <Select
                  value={todo.priority}
                  onValueChange={(value) => handleEditTodo(todo.id, { priority: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={todo.category || 'setup'}
                  onValueChange={(value) => handleEditTodo(todo.id, { category: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={todo.estimatedMinutes || 0}
                  onChange={(e) => handleEditTodo(todo.id, { estimatedMinutes: parseInt(e.target.value) })}
                  className="w-24"
                  placeholder="Minutes"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {todo.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <h4 className="font-medium text-sm">{todo.title}</h4>
                  </div>
                  {todo.description && (
                    <p className="text-sm text-gray-600 ml-7">{todo.description}</p>
                  )}
                </div>

                {!isApproved && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTodo(todo.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id, type)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 ml-7 mt-2">
                <Badge className={getPriorityColor(todo.priority)} variant="outline">
                  {todo.priority}
                </Badge>
                <Badge className={getCategoryColor(todo.category || 'setup')}>
                  {todo.category}
                </Badge>
                {todo.estimatedMinutes && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {todo.estimatedMinutes} min
                  </span>
                )}
                {todo.aiGenerated && (
                  <Badge variant="secondary" className="text-xs">
                    AI Generated
                  </Badge>
                )}
                {type === 'admin' && todo.assignedTo && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Assigned
                  </span>
                )}
              </div>

              {type === 'admin' && !isApproved && teamMembers.length > 0 && (
                <div className="ml-7 mt-3">
                  <Select
                    value={todo.assignedTo || ''}
                    onValueChange={(value) => handleAssignTodo(todo.id, value)}
                  >
                    <SelectTrigger className="w-48 h-8 text-xs">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const AddTodoForm = ({ type }: { type: 'admin' | 'client' }) => (
    <Card className="mb-4 border-dashed">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <Input
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            placeholder="To-do title"
          />
          <Textarea
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            placeholder="Description"
            rows={3}
          />
          <div className="flex gap-2">
            <Select
              value={newTodo.priority}
              onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newTodo.category}
              onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="setup">Setup</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={newTodo.estimatedMinutes}
              onChange={(e) => setNewTodo({ ...newTodo, estimatedMinutes: parseInt(e.target.value) })}
              className="w-24"
              placeholder="Minutes"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCustomTodo} size="sm">
              Add To-Do
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(null)} size="sm">
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">To-Do Lists</h2>
          <p className="text-sm text-gray-600">
            Review and manage tasks for both your team and the client
          </p>
        </div>

        {!isApproved ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={handleApproveTodos}
              disabled={isApproving || (adminTodos.length === 0 && clientTodos.length === 0)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isApproving ? 'Approving...' : 'Approve & Send to Client'}
            </Button>
          </div>
        ) : (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <div className="font-medium">Approved</div>
              {approvedAt && (
                <div className="text-xs text-gray-500">
                  {new Date(approvedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warning if not approved */}
      {!isApproved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  To-dos not yet visible to client
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Review and edit the tasks below, then click "Approve & Send to Client" to make
                  them visible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admin">
            Admin Tasks ({adminTodos.length})
          </TabsTrigger>
          <TabsTrigger value="client">
            Client Tasks ({clientTodos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admin Tasks</CardTitle>
                  <CardDescription>
                    Tasks for your team to complete
                  </CardDescription>
                </div>
                {!isApproved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm('admin')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showAddForm === 'admin' && <AddTodoForm type="admin" />}
              
              {adminTodos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No admin tasks yet
                </p>
              ) : (
                <div>
                  {adminTodos.map((todo) => (
                    <TodoCard key={todo.id} todo={todo} type="admin" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Tasks</CardTitle>
                  <CardDescription>
                    Tasks for the client to complete
                  </CardDescription>
                </div>
                {!isApproved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm('client')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showAddForm === 'client' && <AddTodoForm type="client" />}
              
              {clientTodos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No client tasks yet
                </p>
              ) : (
                <div>
                  {clientTodos.map((todo) => (
                    <TodoCard key={todo.id} todo={todo} type="client" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ConfirmDialog />
    </div>
  );
}
