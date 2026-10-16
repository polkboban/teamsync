import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import type { Workspace } from '../types';
import { Bell, LogOut, Check, UserPlus, ChevronDown, Layers, Plus } from 'lucide-react';

interface NavbarProps {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenCreateWorkspace: () => void;
  onOpenInvite: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenCreateWorkspace,
  onOpenInvite,
}) => {
  const { user, logout } = useAuth();
  const { isConnected, notifications, clearNotifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWsDropdown, setShowWsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="h-12 bg-surface-900/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sticky top-0 z-30 select-none">
      {/* Left: Brand & Workspace Selector */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 text-white">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-white shadow-sm">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white hidden sm:inline">
            TeamSync
          </span>
        </div>

        <span className="text-zinc-700 hidden sm:inline">/</span>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWsDropdown(!showWsDropdown)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] transition"
          >
            <span className="max-w-[140px] truncate">
              {currentWorkspace ? currentWorkspace.name : 'Select workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {showWsDropdown && (
            <div className="absolute left-0 mt-1.5 w-56 bg-surface-850 border border-border-subtle rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                Workspaces
              </div>
              <div className="max-h-56 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setShowWsDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/[0.05] transition ${
                      currentWorkspace?.id === ws.id ? 'text-accent font-medium' : 'text-zinc-300'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {currentWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-border-subtle my-1" />
              <button
                onClick={() => {
                  setShowWsDropdown(false);
                  onOpenCreateWorkspace();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
                <span>Create workspace</span>
              </button>
            </div>
          )}
        </div>

        {currentWorkspace && (
          <button
            onClick={onOpenInvite}
            className="hidden md:flex items-center space-x-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] rounded-md transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        )}
      </div>

      {/* Right: Real-time Indicator, Notifications, User Menu */}
      <div className="flex items-center space-x-2.5">
        {/* Real-time Indicator */}
        <div
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] text-zinc-400 border border-border-subtle bg-white/[0.02]"
          title={isConnected ? 'Connected in real time' : 'Reconnecting...'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400'
            }`}
          />
          <span className="hidden sm:inline font-normal">{isConnected ? 'Live' : 'Syncing'}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showNotifications) clearNotifications();
            }}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.05] transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full ring-2 ring-surface-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 bg-surface-850 border border-border-subtle rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border-subtle flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-zinc-400 hover:text-white transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border-subtle text-xs">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-zinc-500">No new notifications</div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="p-3 hover:bg-white/[0.02] transition">
                      <p className="font-medium text-zinc-200">{n.title}</p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/[0.05] transition"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 text-white flex items-center justify-center text-[11px] font-medium shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-1.5 w-48 bg-surface-850 border border-border-subtle rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-border-subtle">
                <p className="text-xs font-medium text-zinc-200 truncate">{user?.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
