import React from 'react';
import { Link } from 'react-router-dom';
import type { Board, WorkspaceMember } from '../types';
import {
  Kanban,
  Plus,
  UserPlus,
  LayoutGrid,
  Shield,
  X,
  Layers,
  Settings
} from 'lucide-react';

interface SidebarProps {
  boards: Board[];
  selectedBoardId: string | null;
  onSelectBoard: (boardId: string | null) => void;
  onOpenCreateBoard: () => void;
  members: WorkspaceMember[];
  onOpenInvite: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  boards,
  selectedBoardId,
  onSelectBoard,
  onOpenCreateBoard,
  members,
  onOpenInvite,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col h-full justify-between select-none font-jost">
      {/* Top Header on Mobile */}
      <div data-ui="mobile-sidebar-header" className="p-3 border-b border-graphite-bg flex md:hidden items-center justify-between">
        <span className="font-bold text-sm text-graphite-ink uppercase tracking-wider">
          Navigation
        </span>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg transition"
          title="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Nav Links: Workspace Hub & Directory */}
      <div data-ui="sidebar-nav" className="p-3 space-y-1 border-b border-graphite-bg">
        <button
          onClick={() => {
            onSelectBoard(null);
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
            selectedBoardId === null
              ? 'bg-graphite-orange text-graphite-fieldInk'
              : 'text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg'
          }`}
        >
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4" />
            <span>Workspace Hub</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-graphite-bg/50">
            {boards.length}
          </span>
        </button>

        <Link
          to="/app/workspaces"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg transition text-left"
        >
          <Layers className="w-4 h-4 text-graphite-orange" />
          <span>Workspaces Directory</span>
        </Link>

        <Link
          to="/app/settings"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg transition text-left"
        >
          <Settings className="w-4 h-4 text-graphite-orange" />
          <span>Theme & Settings</span>
        </Link>
      </div>

      {/* Boards Section */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold text-graphite-muted">
            Active Boards
          </span>
          <button
            onClick={onOpenCreateBoard}
            className="p-1 hover:bg-graphite-bg text-graphite-muted hover:text-graphite-ink rounded transition"
            title="Create board"
          >
            <Plus className="w-3.5 h-3.5 text-graphite-orange" />
          </button>
        </div>

        <div className="space-y-1">
          {boards.length === 0 ? (
            <div className="text-xs text-graphite-muted py-3 px-2">
              No boards yet.
              <button
                onClick={onOpenCreateBoard}
                className="text-graphite-orange font-bold hover:underline block mt-1 text-xs"
              >
                + Create first board
              </button>
            </div>
          ) : (
            boards.map((b) => {
              const isActive = b.id === selectedBoardId;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBoard(b.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${
                    isActive
                      ? 'bg-graphite-orange text-graphite-fieldInk font-bold'
                      : 'text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Kanban className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{b.title}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Workspace Members Section */}
      <div data-ui="sidebar-footer" className="p-3 border-t border-graphite-bg bg-graphite-surface">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold text-graphite-muted">
            Team ({members.length})
          </span>
          <button
            onClick={onOpenInvite}
            className="p-1 hover:bg-graphite-bg text-graphite-muted hover:text-graphite-ink rounded transition"
            title="Invite member"
          >
            <UserPlus className="w-3.5 h-3.5 text-graphite-orange" />
          </button>
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-graphite-bg transition"
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-5 h-5 rounded bg-graphite-elevated text-[10px] text-graphite-ink flex items-center justify-center font-bold shrink-0">
                  {m.user.name?.charAt(0) || 'U'}
                </div>
                <span className="text-graphite-ink truncate text-xs font-medium" title={m.user.name}>
                  {m.user.name}
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-graphite-bg text-graphite-muted font-bold flex items-center space-x-1">
                {m.role === 'OWNER' && <Shield className="w-2.5 h-2.5 text-graphite-orange" />}
                <span>{m.role}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside data-ui="sidebar" className="hidden md:flex w-64 bg-graphite-surface border-r border-graphite-bg flex-col h-[calc(100dvh-3.5rem)] shrink-0 select-none font-jost">
        {content}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onCloseMobile}
          />
          <aside data-ui="mobile-drawer" className="relative z-50 w-72 max-w-[85vw] bg-graphite-surface border-r border-graphite-bg h-full flex flex-col animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
