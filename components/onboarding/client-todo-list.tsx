'use client';

/**
 * Client To-Do List Dashboard
 * Client-facing interface to view and complete their to-do tasks
 * Only visible after admin approval
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Circle,
  Clock,
  FileUp,
  MessageSquare,
  PartyPopper,
} from 'lucide-react';
import type { OnboardingTodo } from '@/db/schema/onboarding-schema';
import { toggleTodoCompleteAction } from '@/actions/onboarding-todos-actions';

interface ClientTodoListProps {
  sessionId: string;
  todos: OnboardingTodo[];
  isApproved: boolean;
  currentUserId: string;
  onUpdate?: () => void;
}

export function ClientTodoList({
  sessionId,
  todos: initialTodos,
  isApproved,
  currentUserId,
  onUpdate,
}: ClientTodoListProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null);
  const [todoNotes, setTodoNotes] = useState<Record<string, string>>({});

  // Calculate progress
  const completedCount = todos.filter(t => t.isCompleted).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = totalCount > 0 && completedCount === totalCount;

  const handleToggleComplete = async (todoId: string, currentStatus: boolean) => {
    try {
      const result = await toggleTodoCompleteAction(todoId, currentUserId, !currentStatus);
      
      if (result.isSuccess && result.data) {
        setTodos(todos.map(t => t.id === todoId ? result.data! : t));
        
        if (!currentStatus) {
          toast.success('Task marked as complete!');
        } else {
          toast.success('Task marked as incomplete');
        }
        
        onUpdate?.();

        // Check if all complete now
        const newCompletedCount = todos.filter(t => 
          t.id === todoId ? !currentStatus : t.isCompleted
        ).length;
        
        if (newCompletedCount === totalCount && totalCount > 0) {
          setTimeout(() => {
            toast.success('🎉 All tasks complete! Great work!', {
              duration: 5000,
            });
          }, 500);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    // Can customize icons per category
    return null;
  };

  const groupedTodos = {
    incomplete: todos.filter(t => !t.isCompleted),
    completed: todos.filter(t => t.isCompleted),
  };

  // Sort by priority within each group
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  groupedTodos.incomplete.sort((a, b) => 
    (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - 
    (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
  );

  if (!isApproved) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tasks Pending Review
          </h3>
          <p className="text-sm text-gray-500">
            Your project team is preparing your task list. You'll receive an email when it's ready!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All Set!
          </h3>
          <p className="text-sm text-gray-500">
            No additional tasks needed at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                Complete these items to help us get started on your project
              </CardDescription>
            </div>
            {allComplete && (
              <div className="flex items-center gap-2 text-green-600">
                <PartyPopper className="h-5 w-5" />
                <span className="font-medium text-sm">All Complete!</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {completedCount} of {totalCount} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {allComplete && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                🎉 Excellent work! You've completed all your tasks. Your project team has been notified
                and will be in touch soon with next steps.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incomplete Tasks */}
      {groupedTodos.incomplete.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            To Do ({groupedTodos.incomplete.length})
          </h3>
          <div className="space-y-3">
            {groupedTodos.incomplete.map((todo) => {
              const isExpanded = expandedTodo === todo.id;
              
              return (
                <Card
                  key={todo.id}
                  className={`border-l-4 ${getPriorityColor(todo.priority)} hover:shadow-md transition-shadow`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(todo.id, todo.isCompleted)}
                        className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        <Circle className="h-6 w-6 text-gray-400 hover:text-blue-500" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base mb-1">{todo.title}</h4>
                        
                        {todo.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {todo.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              High Priority
                            </Badge>
                          )}
                          {todo.category && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {todo.category}
                            </Badge>
                          )}
                          {todo.estimatedMinutes && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ~{todo.estimatedMinutes} min
                            </span>
                          )}
                        </div>

                        {/* Expandable section for notes/uploads */}
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedTodo(isExpanded ? null : todo.id)}
                            className="text-xs"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {isExpanded ? 'Hide' : 'Add'} Notes
                          </Button>

                          {isExpanded && (
                            <div className="mt-3 space-y-3">
                              <Textarea
                                placeholder="Add notes or comments about this task..."
                                value={todoNotes[todo.id] || ''}
                                onChange={(e) => setTodoNotes({
                                  ...todoNotes,
                                  [todo.id]: e.target.value
                                })}
                                rows={3}
                                className="text-sm"
                              />
                              
                              {/* File upload placeholder - can be implemented with actual upload logic */}
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs">
                                  <FileUp className="h-3 w-3 mr-1" />
                                  Upload Files
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    toast.success('Notes saved');
                                    setExpandedTodo(null);
                                  }}
                                  className="text-xs"
                                >
                                  Save Notes
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {groupedTodos.completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-500">
            Completed ({groupedTodos.completed.length})
          </h3>
          <div className="space-y-3">
            {groupedTodos.completed.map((todo) => (
              <Card key={todo.id} className="opacity-60">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(todo.id, todo.isCompleted)}
                      className="mt-1 flex-shrink-0"
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base line-through text-gray-500">
                        {todo.title}
                      </h4>
                      
                      {todo.completedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Completed {new Date(todo.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Need help?</strong> If you have questions about any of these tasks,
            please reach out to your project team. We're here to help!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
