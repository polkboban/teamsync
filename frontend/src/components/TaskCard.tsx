import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task, WorkspaceMember } from '../types';
import { UserCheck, UserPlus, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  members: WorkspaceMember[];
  onAssignTask: (taskId: string, assigneeId: string | null) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  members,
  onAssignTask,
}) => {
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group bg-surface-850 border border-border-subtle hover:border-border-hover rounded-lg p-3 transition-all select-none relative ${
            snapshot.isDragging
              ? 'shadow-xl ring-1 ring-accent/60 bg-surface-800 rotate-[1deg] scale-[1.01] z-50'
              : ''
          }`}
        >
          {/* Header & Drag Handle */}
          <div className="flex items-start justify-between gap-1.5">
            <h4 className="text-xs font-medium text-zinc-100 group-hover:text-white transition leading-snug break-words flex-1">
              {task.title}
            </h4>
            <div
              {...provided.dragHandleProps}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-zinc-300 transition cursor-grab active:cursor-grabbing rounded"
              title="Drag task"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Card Footer: Task ID & Assignee */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border-subtle text-[11px]">
            <span className="text-[10px] text-zinc-500 font-mono">
              #{task.id.slice(0, 5)}
            </span>

            {/* Assignee Avatar / Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                className="flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-white/[0.05] transition text-zinc-400 hover:text-zinc-200"
                title={task.assignee ? `Assigned to ${task.assignee.name}` : 'Assign member'}
              >
                {task.assignee ? (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-[9px] text-white flex items-center justify-center font-medium uppercase shadow-sm">
                      {task.assignee.name.charAt(0)}
                    </div>
                    <span className="text-[11px] text-zinc-300 max-w-[80px] truncate">
                      {task.assignee.name.split(' ')[0]}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-zinc-500 hover:text-zinc-300">
                    <UserPlus className="w-3 h-3" />
                    <span className="text-[10px]">Assign</span>
                  </div>
                )}
              </button>

              {/* Assignee Dropdown */}
              {showAssigneeMenu && (
                <div className="absolute right-0 bottom-full mb-1 w-44 bg-surface-850 border border-border-subtle rounded-lg shadow-xl py-1 z-50">
                  <div className="px-2.5 py-1 text-[10px] font-medium text-zinc-400 border-b border-border-subtle">
                    Assign member
                  </div>
                  {task.assignee && (
                    <button
                      onClick={() => {
                        onAssignTask(task.id, null);
                        setShowAssigneeMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      Unassign
                    </button>
                  )}
                  {members.map((m) => (
                    <button
                      key={m.userId}
                      onClick={() => {
                        onAssignTask(task.id, m.userId);
                        setShowAssigneeMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/[0.05] flex items-center justify-between transition"
                    >
                      <span className="truncate">{m.user.name}</span>
                      {task.assigneeId === m.userId && (
                        <UserCheck className="w-3.5 h-3.5 text-accent" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
