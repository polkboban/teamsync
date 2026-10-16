import React from 'react';
import type { Board, WorkspaceMember } from '../types';
import { Kanban, Plus, UserPlus, User as UserIcon, Terminal } from 'lucide-react';

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
    <aside className="w-64 bg-carbon-900 border-r border-carbon-800 flex flex-col h-[calc(100vh-3.25rem)] shrink-0 select-none font-mono">
      {/* Boards Section */}
      <div className="p-3.5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-carbon-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-carbon-400 flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>DISPATCH_BOARDS ({boards.length})</span>
          </span>
          <button
            onClick={onOpenCreateBoard}
            className="p-1 hover:bg-carbon-800 text-carbon-400 hover:text-cyan-400 transition"
            title="Create new board"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {boards.length === 0 ? (
            <div className="text-xs text-carbon-500 py-4 text-center">
              <div>NO_BOARDS_FOUND</div>
              <button
                onClick={onOpenCreateBoard}
                className="text-cyan-400 hover:underline mt-1.5 text-[11px] block mx-auto font-semibold"
              >
                + INITIALIZE BOARD
              </button>
            </div>
          ) : (
            boards.map((b, idx) => {
              const isActive = b.id === selectedBoardId;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBoard(b.id)}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 text-xs transition text-left border ${
                    isActive
                      ? 'bg-carbon-800 text-cyan-300 font-semibold border-cyan-500/40 shadow-inner'
                      : 'border-transparent text-carbon-400 hover:text-carbon-200 hover:bg-carbon-850'
                  }`}
                >
                  <span className="text-[10px] text-carbon-500 font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <Kanban className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-carbon-500'}`} />
                  <span className="truncate uppercase font-medium">{b.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Workspace Operators Section */}
      <div className="p-3.5 border-t border-carbon-800 bg-carbon-950/60">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-carbon-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-carbon-400">
            OPERATORS ({members.length})
          </span>
          <button
            onClick={onOpenInvite}
            className="p-1 hover:bg-carbon-800 text-carbon-400 hover:text-cyan-400 transition"
            title="Dispatch invite"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-carbon-850/60 transition"
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 bg-carbon-800 border border-carbon-700 flex items-center justify-center text-[9px] text-carbon-200 uppercase font-bold shrink-0">
                  {m.user.name?.charAt(0) || <UserIcon className="w-2.5 h-2.5" />}
                </div>
                <span className="text-carbon-300 truncate max-w-[110px] text-[11px]" title={m.user.name}>
                  {m.user.name}
                </span>
              </div>
              <span
                className={`text-[9px] px-1 py-0.2 border uppercase tracking-wider font-semibold ${
                  m.role === 'OWNER'
                    ? 'border-amber-500/40 text-amber-400 bg-amber-950/20'
                    : m.role === 'ADMIN'
                    ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20'
                    : 'border-carbon-750 text-carbon-500'
                }`}
              >
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
