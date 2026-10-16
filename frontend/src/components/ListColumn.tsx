import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { List, WorkspaceMember } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, X } from 'lucide-react';

interface ListColumnProps {
  list: List;
  members: WorkspaceMember[];
  onAddTask: (listId: string, title: string, description?: string) => Promise<void>;
  onAssignTask: (taskId: string, assigneeId: string | null) => void;
}

export const ListColumn: React.FC<ListColumnProps> = ({
  list,
  members,
  onAddTask,
  onAssignTask,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddTask(list.id, taskTitle.trim(), taskDescription.trim() || undefined);
      setTaskTitle('');
      setTaskDescription('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-72 shrink-0 bg-surface-900 border border-border-subtle rounded-xl flex flex-col max-h-[calc(100vh-7.5rem)] shadow-sm">
      {/* Column Header */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-border-subtle select-none">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-xs text-zinc-200 tracking-tight">
            {list.title}
          </h3>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-medium text-zinc-400">
            {list.tasks.length}
          </span>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white rounded transition"
          title="Add task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Droppable Task Container */}
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 flex-1 overflow-y-auto space-y-2 min-h-[120px] transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? 'bg-accent-subtle/30 ring-1 ring-accent/30' : ''
            }`}
          >
            {list.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                members={members}
                onAssignTask={onAssignTask}
              />
            ))}
            {provided.placeholder}

            {/* Quick Add Form inside column bottom */}
            {isAdding ? (
              <form onSubmit={handleCreate} className="bg-surface-850 border border-border-hover rounded-lg p-2.5 space-y-2 shadow-md">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-surface-900 border border-border-subtle rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-accent/80 transition"
                />
                <textarea
                  placeholder="Add details (optional)..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-surface-900 border border-border-subtle rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-accent/80 transition resize-none"
                />
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <button
                    type="submit"
                    disabled={isSubmitting || !taskTitle.trim()}
                    className="px-2.5 py-1 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 rounded text-xs font-medium transition shadow-sm"
                  >
                    {isSubmitting ? 'Adding...' : 'Add card'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] rounded-md border border-dashed border-border-subtle flex items-center justify-center space-x-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add card</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
