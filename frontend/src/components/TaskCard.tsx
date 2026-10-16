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
          className={`group bg-carbon-850/95 border border-carbon-750 hover:border-carbon-600 p-3 transition-all select-none relative ${
            snapshot.isDragging
              ? 'shadow-glow-cyan ring-1 ring-cyan-500 bg-carbon-800 rotate-[1deg] scale-[1.02] z-50'
              : ''
          }`}
        >
          {/* Card Meta & Drag Handle */}
          <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[10px]">
            <span className="text-cyan-400 font-bold tracking-wider">
              TASK_{task.id.slice(0, 6).toUpperCase()}
            </span>
            <div
              {...provided.dragHandleProps}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-carbon-500 hover:text-carbon-200 transition cursor-grab active:cursor-grabbing"
              title="Drag task"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Title */}
          <h4 className="text-xs font-semibold text-white tracking-tight leading-snug break-words">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-[11px] text-carbon-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Card Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-carbon-800 font-mono text-[10px]">
            <span className="text-carbon-500">
              SEQ_{task.order}
            </span>

            {/* Assignee / Operator Tag */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                className="flex items-center space-x-1.5 px-1.5 py-0.5 border border-carbon-700 bg-carbon-900/60 hover:bg-carbon-800 hover:border-carbon-600 transition text-carbon-300"
                title={task.assignee ? `Assigned to ${task.assignee.name}` : 'Assign operator'}
              >
                {task.assignee ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-carbon-200 uppercase font-medium max-w-[90px] truncate">
                      {task.assignee.name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 text-carbon-500" />
                    <span className="text-carbon-400">UNASSIGNED</span>
                  </>
                )}
              </button>

              {/* Assignee popup */}
              {showAssigneeMenu && (
                <div className="absolute right-0 bottom-full mb-1 w-48 bg-carbon-900 border border-carbon-700 shadow-2xl py-1 z-50 font-mono">
                  <div className="px-3 py-1 text-[9px] font-bold text-carbon-500 uppercase tracking-widest border-b border-carbon-800">
                    ASSIGN OPERATOR
                  </div>
                  {task.assignee && (
                    <button
                      onClick={() => {
                        onAssignTask(task.id, null);
                        setShowAssigneeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-950/20 transition"
                    >
                      UNASSIGN
                    </button>
                  )}
                  {members.map((m) => (
                    <button
                      key={m.userId}
                      onClick={() => {
                        onAssignTask(task.id, m.userId);
                        setShowAssigneeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-carbon-200 hover:bg-carbon-800 flex items-center justify-between transition"
                    >
                      <span className="truncate">{m.user.name}</span>
                      {task.assigneeId === m.userId && (
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
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
