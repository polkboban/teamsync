import React from 'react';
import type { Board, WorkspaceMember } from '../types';
import { Kanban, Plus, UserPlus, User as UserIcon } from 'lucide-react';

interface SidebarProps {
  boards: Board[];
  selectedBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onOpenCreateBoard: () => void;
  members: WorkspaceMember[];
  onOpenInvite: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  boards,
  selectedBoardId,
  onSelectBoard,
  onOpenCreateBoard,
  members,
  onOpenInvite,
}) => {
  return (
    <aside className="w-60 bg-surface-900 border-r border-border-subtle flex flex-col h-[calc(100vh-3rem)] shrink-0 select-none">
      {/* Boards Section */}
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[11px] font-medium text-zinc-400 tracking-tight">
            Boards
          </span>
          <button
            onClick={onOpenCreateBoard}
            className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white rounded transition"
            title="Create board"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          {boards.length === 0 ? (
            <div className="text-xs text-zinc-500 py-3 px-2">
              No boards yet.
              <button
                onClick={onOpenCreateBoard}
                className="text-accent hover:underline block mt-1 text-xs"
              >
                + Create board
              </button>
            </div>
          ) : (
            boards.map((b) => {
              const isActive = b.id === selectedBoardId;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBoard(b.id)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs transition text-left ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-medium shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Kanban className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-zinc-500'}`} />
                  <span className="truncate">{b.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Workspace Members Section */}
      <div className="p-3 border-t border-border-subtle bg-surface-950/40">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[11px] font-medium text-zinc-400 tracking-tight">
            Members ({members.length})
          </span>
          <button
            onClick={onOpenInvite}
            className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white rounded transition"
            title="Invite member"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-0.5">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-white/[0.02] transition"
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 rounded-full bg-zinc-800 text-[10px] text-zinc-300 flex items-center justify-center font-medium shrink-0">
                  {m.user.name?.charAt(0) || <UserIcon className="w-2.5 h-2.5" />}
                </div>
                <span className="text-zinc-300 truncate text-[11px]" title={m.user.name}>
                  {m.user.name}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-normal capitalize">
                {m.role.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
