import React, { useState, useEffect } from 'react';
import type { Task, WorkspaceMember, List } from '../types';
import { X, Trash2, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';

interface TaskDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  lists: List[];
  members: WorkspaceMember[];
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
  onUpdateTask,
  onAssignTask,
  onMoveTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setSaveSuccess(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentList = lists.find((l) => l.id === task.listId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;

    try {
      setIsSaving(true);
      await onUpdateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsDeleting(true);
        await onDeleteTask(task.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

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
            <span className="text-xs text-graphite-muted">
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
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-graphite-muted mb-1.5">
              TASK TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-graphite-bg text-graphite-ink px-4 py-2.5 rounded-lg text-base font-bold placeholder-graphite-muted focus:outline-none focus:ring-2 focus:ring-graphite-orange transition"
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
              DESCRIPTION
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add comprehensive notes, context, or acceptance criteria..."
              className="w-full bg-graphite-bg text-graphite-ink px-4 py-3 rounded-lg text-sm leading-relaxed placeholder-graphite-muted focus:outline-none focus:ring-2 focus:ring-graphite-orange transition resize-none"
            />
          </div>

          {/* Timestamps */}
          <div className="text-[11px] text-graphite-muted flex items-center space-x-2 pt-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created on {new Date(task.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
        </form>

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
              <span>{isSaving ? 'Saving changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
