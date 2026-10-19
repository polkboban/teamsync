import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, WorkspaceMember, List, Comment, TaskActivity, ChecklistItem } from '../types';
import { taskApi } from '../api/tasks';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  MessageSquare,
  History,
  Send,
  CheckSquare,
  Square,
  Plus
} from 'lucide-react';

interface TaskDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  lists: List[];
  members: WorkspaceMember[];
  boardId?: string | null;
  onUpdateTask: (taskId: string, data: { title?: string; description?: string }) => Promise<void>;
  onAssignTask: (taskId: string, assigneeId: string | null) => void;
  onMoveTask: (taskId: string, listId: string) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({
  isOpen,
  onClose,
  task,
  lists,
  members,
  boardId,
  onUpdateTask,
  onAssignTask,
  onMoveTask,
  onDeleteTask,
}) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [newComment, setNewComment] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [remoteTypingUser, setRemoteTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setSaveSuccess(false);
      setIsAddingChecklist(false);
    }
  }, [task]);

  // Fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['task-comments', task?.id],
    queryFn: () => (task ? taskApi.getTaskComments(task.id) : Promise.resolve([])),
    enabled: !!task?.id && isOpen,
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['task-activities', task?.id],
    queryFn: () => (task ? taskApi.getTaskActivities(task.id) : Promise.resolve([])),
    enabled: !!task?.id && isOpen,
  });

  // Fetch checklist items
  const { data: checklist = [] } = useQuery({
    queryKey: ['task-checklist', task?.id],
    queryFn: () => (task ? taskApi.getTaskChecklist(task.id) : Promise.resolve([])),
    enabled: !!task?.id && isOpen,
  });

  // Listen for socket events to update comments, activities, and checklist in real time
  useEffect(() => {
    if (!socket || !task?.id) return;

    const handleCommentAdded = (data: { taskId: string; comment: Comment; activity?: TaskActivity }) => {
      if (data.taskId === task.id) {
        queryClient.invalidateQueries({ queryKey: ['task-comments', task.id] });
        queryClient.invalidateQueries({ queryKey: ['task-activities', task.id] });
      }
    };

    const handleTaskUpdated = (data: { task?: Task; taskId?: string }) => {
      if (data.taskId === task.id || data.task?.id === task.id) {
        queryClient.invalidateQueries({ queryKey: ['task-activities', task.id] });
      }
    };

    const handleChecklistUpdated = (data: { taskId: string }) => {
      if (data.taskId === task.id) {
        queryClient.invalidateQueries({ queryKey: ['task-checklist', task.id] });
        queryClient.invalidateQueries({ queryKey: ['lists'] });
        queryClient.invalidateQueries({ queryKey: ['task-activities', task.id] });
      }
    };

    const handleTypingStatus = (data: { taskId: string; userName: string; isTyping: boolean }) => {
      if (data.taskId === task.id) {
        setRemoteTypingUser(data.isTyping ? data.userName : null);
      }
    };

    socket.on('task:comment-added', handleCommentAdded);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task:checklist-updated', handleChecklistUpdated);
    socket.on('task:typing-status', handleTypingStatus);

    return () => {
      socket.off('task:comment-added', handleCommentAdded);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task:checklist-updated', handleChecklistUpdated);
      socket.off('task:typing-status', handleTypingStatus);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, task?.id, queryClient]);

  // Handle typing debounce
  const handleCommentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    if (!socket || !boardId || !task) return;

    socket.emit('task:typing', {
      boardId,
      taskId: task.id,
      userName: user?.name || 'Teammate',
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('task:typing', {
        boardId,
        taskId: task.id,
        userName: user?.name || 'Teammate',
        isTyping: false,
      });
    }, 1500);
  };

  // Mutation for creating a comment
  const createCommentMutation = useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      taskApi.createTaskComment(taskId, content),
    onSuccess: (data) => {
      setNewComment('');
      if (socket && boardId && task) {
        socket.emit('task:typing', {
          boardId,
          taskId: task.id,
          userName: user?.name || 'Teammate',
          isTyping: false,
        });
      }
      queryClient.setQueryData<Comment[]>(['task-comments', task?.id], (old = []) => [...old, data.comment]);
      if (data.activity) {
        queryClient.setQueryData<TaskActivity[]>(['task-activities', task?.id], (old = []) => [data.activity, ...old]);
      }
    },
  });

  // Checklist Mutations
  const createChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      taskApi.createChecklistItem(taskId, title),
    onSuccess: (newItem) => {
      setNewChecklistTitle('');
      setIsAddingChecklist(false);
      queryClient.setQueryData<ChecklistItem[]>(['task-checklist', task?.id], (old = []) => [...old, newItem]);
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities', task?.id] });
    },
  });

  const updateChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, itemId, data }: { taskId: string; itemId: string; data: { title?: string; isDone?: boolean } }) =>
      taskApi.updateChecklistItem(taskId, itemId, data),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<ChecklistItem[]>(['task-checklist', task?.id], (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['task-activities', task?.id] });
    },
  });

  const deleteChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) =>
      taskApi.deleteChecklistItem(taskId, itemId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ChecklistItem[]>(['task-checklist', task?.id], (old = []) =>
        old.filter((item) => item.id !== variables.itemId)
      );
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const handlePostComment = async () => {
    if (!task || !newComment.trim() || createCommentMutation.isPending) return;
    try {
      await createCommentMutation.mutateAsync({ taskId: task.id, content: newComment.trim() });
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;

    try {
      setIsSaving(true);
      await onUpdateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['task-activities', task.id] });
    } catch (err) {
      console.error('Failed to update task', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      try {
        setIsDeleting(true);
        await onDeleteTask(task.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete task', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen || !task) return null;

  const currentList = lists.find((l) => l.id === task.listId);
  const completedChecklistCount = checklist.filter((c) => c.isDone).length;
  const checklistPercent = checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-jost">
      <div
        data-ui="task-drawer"
        className="w-full max-w-lg bg-graphite-surface h-full flex flex-col justify-between animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div data-ui="drawer-header" className="p-5 bg-graphite-surface flex items-center justify-between border-b border-graphite-bg">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-graphite-orange bg-graphite-bg px-2.5 py-1 rounded">
              #{task.id.slice(0, 5)}
            </span>
            <span className="text-xs text-graphite-muted font-medium">
              in {currentList?.title || 'List'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-graphite-muted hover:text-rose-400 hover:bg-graphite-bg rounded transition"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg rounded transition"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Title Field */}
            <div>
              <label className="block text-xs font-bold text-graphite-muted mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-graphite-bg text-graphite-ink px-4 py-2.5 rounded-lg text-base font-bold placeholder-graphite-muted focus:outline-none focus:ring-1 focus:ring-graphite-orange transition"
              />
            </div>

            {/* Metadata Controls Strip */}
            <div className="grid grid-cols-2 gap-3 bg-graphite-bg p-4 rounded-lg text-xs">
              {/* List / Column Switcher */}
              <div>
                <span className="block font-bold text-graphite-muted mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-graphite-orange" />
                  <span>Column</span>
                </span>
                <select
                  value={task.listId}
                  onChange={(e) => onMoveTask(task.id, e.target.value)}
                  className="w-full bg-graphite-surface text-graphite-ink px-3 py-1.5 rounded font-medium focus:outline-none"
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee Picker */}
              <div>
                <span className="block font-bold text-graphite-muted mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-graphite-orange" />
                  <span>Assignee</span>
                </span>
                <select
                  value={task.assigneeId || ''}
                  onChange={(e) => onAssignTask(task.id, e.target.value ? e.target.value : null)}
                  className="w-full bg-graphite-surface text-graphite-ink px-3 py-1.5 rounded font-medium focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-bold text-graphite-muted mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes, context, or acceptance criteria..."
                className="w-full bg-graphite-bg text-graphite-ink px-4 py-3 rounded-lg text-sm leading-relaxed placeholder-graphite-muted focus:outline-none focus:ring-1 focus:ring-graphite-orange transition resize-none"
              />
            </div>

            {/* Subtasks & Checklist Section */}
            <div data-ui="checklist-section" className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-3.5 h-3.5 text-graphite-orange" />
                  <span className="text-xs font-bold text-graphite-ink">Subtasks & Checklist</span>
                </div>
                {checklist.length > 0 && (
                  <span className="text-[11px] text-graphite-muted font-bold">
                    {completedChecklistCount} of {checklist.length} ({checklistPercent}%)
                  </span>
                )}
              </div>

              {/* Progress Bar Track */}
              {checklist.length > 0 && (
                <div className="w-full bg-graphite-bg h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-graphite-orange h-full transition-[width] duration-200"
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>
              )}

              {/* Checklist Items List */}
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-graphite-bg hover:bg-graphite-elevated transition group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateChecklistItemMutation.mutate({
                          taskId: task.id,
                          itemId: item.id,
                          data: { isDone: !item.isDone }
                        })
                      }
                      className="flex items-center space-x-2.5 text-left flex-1"
                    >
                      {item.isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-graphite-muted hover:text-graphite-ink shrink-0" />
                      )}
                      <span
                        className={`text-xs transition ${
                          item.isDone ? 'line-through text-graphite-muted' : 'text-graphite-ink font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteChecklistItemMutation.mutate({ taskId: task.id, itemId: item.id })
                      }
                      className="opacity-0 group-hover:opacity-100 p-1 text-graphite-muted hover:text-rose-400 rounded transition"
                      title="Delete subtask"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Checklist Item */}
              {isAddingChecklist ? (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newChecklistTitle.trim()) {
                          createChecklistItemMutation.mutate({
                            taskId: task.id,
                            title: newChecklistTitle.trim()
                          });
                        }
                      } else if (e.key === 'Escape') {
                        setIsAddingChecklist(false);
                      }
                    }}
                    placeholder="Subtask title (Enter to save)..."
                    autoFocus
                    className="flex-1 bg-graphite-bg text-graphite-ink px-3 py-1.5 rounded text-xs placeholder-graphite-muted focus:outline-none focus:ring-1 focus:ring-graphite-orange"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newChecklistTitle.trim()) {
                        createChecklistItemMutation.mutate({
                          taskId: task.id,
                          title: newChecklistTitle.trim()
                        });
                      }
                    }}
                    disabled={!newChecklistTitle.trim() || createChecklistItemMutation.isPending}
                    className="px-3 py-1.5 bg-graphite-orange text-graphite-fieldInk font-bold text-xs rounded hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingChecklist(false)}
                    className="p-1.5 text-graphite-muted hover:text-graphite-ink rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingChecklist(true)}
                  className="flex items-center space-x-1.5 text-xs text-graphite-muted hover:text-graphite-orange font-bold transition py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add subtask item</span>
                </button>
              )}
            </div>

            {/* Created Timestamp */}
            <div className="text-[11px] text-graphite-muted flex items-center space-x-2 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created on {new Date(task.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
          </form>

          {/* Social / Activity Tab Strip */}
          <div className="space-y-4 pt-2">
            <div data-ui="tabs-nav" className="flex items-center space-x-4 border-b border-graphite-bg pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'comments'
                    ? 'text-graphite-orange'
                    : 'text-graphite-muted hover:text-graphite-ink'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments ({comments.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activity')}
                className={`text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'activity'
                    ? 'text-graphite-orange'
                    : 'text-graphite-muted hover:text-graphite-ink'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Activity ({activities.length})</span>
              </button>
            </div>

            {/* Comments Tab Content */}
            {activeTab === 'comments' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Remote Peer Typing Indicator */}
                {remoteTypingUser && (
                  <div className="flex items-center space-x-2 text-xs text-graphite-orange font-bold px-1 animate-in fade-in duration-150">
                    <span className="w-1.5 h-1.5 rounded-full bg-graphite-orange" />
                    <span>{remoteTypingUser} is typing a comment...</span>
                  </div>
                )}

                {/* New Comment Input */}
                <div className="p-3 bg-graphite-bg rounded-lg space-y-2">
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={handleCommentTextChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    placeholder="Write a comment... (Ctrl+Enter to post)"
                    className="w-full bg-graphite-surface text-graphite-ink px-3 py-2 rounded text-xs placeholder-graphite-muted focus:outline-none focus:ring-1 focus:ring-graphite-orange resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-graphite-muted">Ctrl+Enter to post</span>
                    <button
                      type="button"
                      onClick={handlePostComment}
                      disabled={createCommentMutation.isPending || !newComment.trim()}
                      className="px-3 py-1.5 bg-graphite-orange hover:opacity-90 active:scale-[0.98] disabled:opacity-40 text-graphite-fieldInk text-xs font-bold rounded transition flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{createCommentMutation.isPending ? 'Posting...' : 'Comment'}</span>
                    </button>
                  </div>
                </div>

                {/* Comment Thread */}
                <div className="space-y-2">
                  {isLoadingComments ? (
                    <div className="p-4 text-center text-graphite-muted text-xs">
                      Loading conversation...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="p-4 text-center text-graphite-muted text-xs bg-graphite-bg/40 rounded-lg">
                      No comments yet. Start the conversation.
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="p-3 bg-graphite-bg rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 rounded bg-graphite-orange text-[9px] text-graphite-fieldInk font-bold flex items-center justify-center uppercase">
                              {c.user.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-graphite-ink">{c.user.name}</span>
                          </div>
                          <span className="text-[10px] text-graphite-muted">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-graphite-ink pl-7 whitespace-pre-wrap leading-relaxed font-normal">
                          {c.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Activity Tab Content */}
            {activeTab === 'activity' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                {activities.length === 0 ? (
                  <div className="p-4 text-center text-graphite-muted text-xs bg-graphite-bg/40 rounded-lg">
                    No activity recorded for this task yet.
                  </div>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="flex items-start space-x-2.5 text-xs py-1.5 px-2 rounded hover:bg-graphite-bg transition">
                      <div className="w-1.5 h-1.5 rounded-full bg-graphite-orange mt-1.5 shrink-0" />
                      <div className="flex-1 truncate">
                        <span className="font-bold text-graphite-ink">{a.user?.name || 'Teammate'}</span>
                        <span className="text-graphite-muted ml-1.5">{a.action}</span>
                        {a.details && (
                          <span className="text-graphite-ink font-medium ml-1">"{a.details}"</span>
                        )}
                      </div>
                      <span className="text-[10px] text-graphite-muted shrink-0">
                        {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div data-ui="drawer-footer" className="p-5 bg-graphite-surface border-t border-graphite-bg flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-graphite-muted hover:text-graphite-ink transition"
          >
            Close
          </button>

          <div className="flex items-center space-x-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-5 py-2.5 bg-graphite-orange text-graphite-fieldInk font-bold text-xs rounded-lg hover:opacity-90 active:scale-[0.98] transition flex items-center space-x-1.5"
            >
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
