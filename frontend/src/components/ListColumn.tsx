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
    <div className="w-80 shrink-0 bg-carbon-900 border border-carbon-800 flex flex-col max-h-[calc(100vh-8.5rem)] shadow-lg shadow-black/40">
      {/* Column Lane Header */}
      <div className="p-3 pb-2.5 flex items-center justify-between border-b border-carbon-800 select-none">
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-cyan-400 text-xs font-bold tracking-wider uppercase">
            // {list.title}
          </span>
          <span className="px-1.5 py-0.2 bg-carbon-800 border border-carbon-700 text-[10px] font-bold text-carbon-400">
            {String(list.tasks.length).padStart(2, '0')}
          </span>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-carbon-800 text-carbon-400 hover:text-cyan-400 transition"
          title="Add task to lane"
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
            className={`p-2.5 flex-1 overflow-y-auto space-y-2 min-h-[140px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-cyan-950/15 ring-1 ring-cyan-500/30' : ''
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
              <form onSubmit={handleCreate} className="bg-carbon-850 border border-carbon-700 p-2.5 space-y-2 font-mono">
                <input
                  type="text"
                  placeholder="TASK TITLE..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-carbon-900 border border-carbon-750 px-2 py-1.5 text-xs text-white placeholder-carbon-500 focus:outline-none focus:border-cyan-500"
                />
                <textarea
                  placeholder="SPEC / DETAILS (OPTIONAL)..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-carbon-900 border border-carbon-750 px-2 py-1.5 text-xs text-white placeholder-carbon-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
                />
                <div className="flex items-center space-x-2 pt-1 font-mono">
                  <button
                    type="submit"
                    disabled={isSubmitting || !taskTitle.trim()}
                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-carbon-950 text-[11px] font-bold uppercase transition"
                  >
                    {isSubmitting ? 'SAVING...' : '+ DISPATCH'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="p-1 hover:bg-carbon-800 text-carbon-400 hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full py-2 text-[11px] font-mono text-carbon-500 hover:text-cyan-400 hover:bg-carbon-850/50 border border-dashed border-carbon-800 hover:border-carbon-700 flex items-center justify-center space-x-1.5 transition uppercase"
              >
                <Plus className="w-3 h-3" />
                <span>ADD_TASK</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
