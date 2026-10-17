import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import type { Workspace } from '../types';
import { Bell, LogOut, Check, UserPlus, ChevronDown, Plus } from 'lucide-react';

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
    <header data-ui="navbar" className="h-14 bg-graphite-surface border-b border-graphite-bg flex items-center justify-between px-4 sticky top-0 z-30 select-none font-jost">
      {/* Left: Brand & Workspace Selector */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-graphite-ink hover:opacity-90 transition">
          <span className="font-jost text-lg font-bold tracking-tight text-graphite-ink">
            TEAMSYNC
          </span>
        </Link>

        <span className="text-graphite-muted hidden sm:inline">/</span>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWsDropdown(!showWsDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-graphite-bg text-graphite-ink hover:bg-graphite-elevated transition"
          >
            <span className="max-w-[150px] truncate">
              {currentWorkspace ? currentWorkspace.name : 'Select workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-graphite-muted" />
          </button>

          {showWsDropdown && (
            <div data-ui="dropdown" className="absolute left-0 mt-2 w-64 bg-graphite-surface border border-graphite-bg rounded-lg py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-2 text-[11px] font-bold text-graphite-muted">
                Your Workspaces
              </div>
              <div className="max-h-56 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setShowWsDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-graphite-bg transition ${
                      currentWorkspace?.id === ws.id
                        ? 'text-graphite-orange font-bold bg-graphite-bg/50'
                        : 'text-graphite-ink'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {currentWorkspace?.id === ws.id && <Check className="w-4 h-4 text-graphite-orange shrink-0" />}
                  </button>
                ))}
              </div>
              <div data-ui="divider" className="border-t border-graphite-bg my-1" />
              <button
                onClick={() => {
                  setShowWsDropdown(false);
                  onOpenCreateWorkspace();
                }}
                className="w-full text-left px-3 py-2 text-xs text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg flex items-center space-x-2 transition font-bold"
              >
                <Plus className="w-4 h-4 text-graphite-orange" />
                <span>+ Create workspace</span>
              </button>
            </div>
          )}
        </div>

        {currentWorkspace && (
          <button
            onClick={onOpenInvite}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg rounded-lg transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-graphite-orange" />
            <span>Invite</span>
          </button>
        )}
      </div>

      {/* Right: Socket Status, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        {/* Socket Status Indicator */}
        <div
          className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-graphite-bg"
          title={isConnected ? 'WebSocket connected' : 'Reconnecting...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span className="hidden sm:inline text-graphite-muted text-[11px]">
            {isConnected ? 'Socket Live' : 'Syncing'}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showNotifications) clearNotifications();
            }}
            className="p-2 rounded-lg bg-graphite-bg text-graphite-muted hover:text-graphite-ink hover:bg-graphite-elevated transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-graphite-orange rounded-full ring-2 ring-graphite-surface" />
            )}
          </button>

          {showNotifications && (
            <div data-ui="dropdown" className="absolute right-0 mt-2 w-80 bg-graphite-surface border border-graphite-bg rounded-lg z-50 overflow-hidden">
              <div data-ui="popover-header" className="p-3 border-b border-graphite-bg flex items-center justify-between">
                <span className="text-xs font-bold text-graphite-ink">Live Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] font-bold text-graphite-orange hover:underline transition"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div data-ui="list" className="max-h-64 overflow-y-auto divide-y divide-graphite-bg text-xs">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-graphite-muted">No new notifications</div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="p-3 hover:bg-graphite-bg transition">
                      <p className="font-bold text-graphite-ink">{n.title}</p>
                      <p className="text-graphite-muted text-xs mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-graphite-muted mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-graphite-bg transition"
          >
            <div className="w-7 h-7 rounded-lg bg-graphite-elevated text-graphite-ink flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserDropdown && (
            <div data-ui="dropdown" className="absolute right-0 mt-2 w-52 bg-graphite-surface border border-graphite-bg rounded-lg py-1 z-50">
              <div data-ui="popover-header" className="px-3 py-2 border-b border-graphite-bg">
                <p className="text-xs font-bold text-graphite-ink truncate">{user?.name}</p>
                <p className="text-[11px] text-graphite-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/20 flex items-center space-x-2 transition"
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
