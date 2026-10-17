import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task, WorkspaceMember } from '../types';
import { UserPlus, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  members: WorkspaceMember[];
  onAssignTask: (taskId: string, assigneeId: string | null) => void;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  members,
  onAssignTask,
  onClick,
}) => {
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          data-ui="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={onClick}
          className={`group bg-graphite-bg hover:bg-graphite-elevated text-graphite-ink rounded-lg p-3.5 transition select-none relative cursor-pointer active:scale-[0.99] font-jost ${
            snapshot.isDragging
              ? 'ring-2 ring-graphite-orange bg-graphite-elevated rotate-[1deg] scale-[1.02] z-50'
              : ''
          }`}
        >
          {/* Header & Drag Handle */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-bold text-graphite-ink group-hover:text-white transition leading-snug break-words flex-1">
              {task.title}
            </h4>
            <div
              {...provided.dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 text-graphite-muted hover:text-graphite-ink transition cursor-grab active:cursor-grabbing rounded"
              title="Drag task"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Description Snippet */}
          {task.description && (
            <p className="text-[11px] text-graphite-muted mt-1.5 line-clamp-2 leading-relaxed font-normal">
              {task.description}
            </p>
          )}

          {/* Card Footer: Task ID & Assignee */}
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-[10px] text-graphite-orange font-bold">
              #{task.id.slice(0, 5)}
            </span>

            {/* Assignee Avatar / Selector */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-graphite-surface hover:bg-graphite-elevated transition text-graphite-muted hover:text-graphite-ink"
                title={task.assignee ? `Assigned to ${task.assignee.name}` : 'Assign member'}
              >
                {task.assignee ? (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 rounded bg-graphite-orange text-[9px] text-graphite-fieldInk flex items-center justify-center font-bold uppercase">
                      {task.assignee.name.charAt(0)}
                    </div>
                    <span className="text-[10px] text-graphite-ink font-medium max-w-[70px] truncate">
                      {task.assignee.name.split(' ')[0]}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-graphite-muted hover:text-graphite-ink">
                    <UserPlus className="w-3 h-3" />
                    <span className="text-[10px] font-medium">Assign</span>
                  </div>
                )}
              </button>

              {/* Assignee Dropdown */}
              {showAssigneeMenu && (
                <div data-ui="dropdown" className="absolute right-0 bottom-full mb-1 w-44 bg-graphite-surface rounded-lg py-1 z-50 border border-graphite-bg">
                  <div data-ui="header" className="px-2.5 py-1 text-[10px] font-bold text-graphite-muted border-b border-graphite-bg">
                    Assign member
                  </div>
                  {task.assignee && (
                    <button
                      onClick={() => {
                        onAssignTask(task.id, null);
                        setShowAssigneeMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/30 transition"
                    >
                      Unassign
                    </button>
                  )}
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onAssignTask(task.id, m.user.id);
                        setShowAssigneeMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-graphite-elevated transition ${
                        task.assignee?.id === m.user.id
                          ? 'text-graphite-orange font-bold'
                          : 'text-graphite-ink'
                      }`}
                    >
                      <span className="truncate">{m.user.name}</span>
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
