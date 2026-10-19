import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { List, WorkspaceMember, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, X } from 'lucide-react';

interface ListColumnProps {
  list: List;
  members: WorkspaceMember[];
  onAddTask: (listId: string, title: string, description?: string) => Promise<void>;
  onAssignTask: (taskId: string, assigneeId: string | null) => void;
  onTaskClick?: (task: Task) => void;
  remoteDraggingTasks?: Record<string, { userId: string; userName: string }>;
}

export const ListColumn: React.FC<ListColumnProps> = ({
  list,
  members,
  onAddTask,
  onAssignTask,
  onTaskClick,
  remoteDraggingTasks,
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
    <div
      data-ui="list-column"
      className="w-72 shrink-0 bg-graphite-surface rounded-xl flex flex-col max-h-[calc(100vh-8rem)] font-jost"
    >
      {/* Column Header */}
      <div data-ui="column-header" className="p-3 pb-2 flex items-center justify-between border-b border-graphite-bg select-none">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-xs text-graphite-ink tracking-tight">
            {list.title}
          </h3>
          <span className="px-2 py-0.5 rounded bg-graphite-bg text-[10px] font-bold text-graphite-muted">
            {list.tasks.length}
          </span>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-graphite-bg text-graphite-muted hover:text-graphite-ink rounded transition"
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
            className={`p-2 flex-1 overflow-y-auto space-y-2 min-h-[140px] transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? 'bg-graphite-elevated ring-2 ring-graphite-orange' : ''
            }`}
          >
            {list.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                members={members}
                onAssignTask={onAssignTask}
                onClick={() => onTaskClick?.(task)}
                remoteDragging={remoteDraggingTasks?.[task.id]}
              />
            ))}
            {provided.placeholder}

            {/* Quick Add Form inside column bottom */}
            {isAdding ? (
              <form onSubmit={handleCreate} className="bg-graphite-bg rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-graphite-surface rounded px-3 py-1.5 text-xs text-graphite-ink placeholder-graphite-muted focus:outline-none focus:ring-1 focus:ring-graphite-orange transition"
                />
                <textarea
                  placeholder="Add details (optional)..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-graphite-surface rounded px-3 py-1.5 text-xs text-graphite-ink placeholder-graphite-muted focus:outline-none focus:ring-1 focus:ring-graphite-orange transition resize-none"
                />
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || !taskTitle.trim()}
                    className="px-3 py-1 bg-graphite-orange text-graphite-fieldInk disabled:opacity-50 font-bold rounded text-xs transition active:scale-[0.98]"
                  >
                    {isSubmitting ? 'Adding...' : 'Add card'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setTaskTitle('');
                      setTaskDescription('');
                    }}
                    className="p-1 text-graphite-muted hover:text-graphite-ink rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg flex items-center justify-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add card</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
