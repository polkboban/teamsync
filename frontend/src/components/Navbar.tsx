import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import type { Workspace } from '../types';
import { Bell, LogOut, Check, Users, ChevronDown, Radio, Activity } from 'lucide-react';

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
    <header className="h-13 bg-carbon-900 border-b border-carbon-800 flex items-center justify-between px-4 sticky top-0 z-30 select-none">
      {/* Left: Brand Wordmark & Workspace Dispatch Switcher */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-carbon-800 border border-carbon-700 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-inner">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-sm tracking-wider uppercase text-white">
            TEAM<span className="text-cyan-400 font-normal">SYNC</span>
          </span>
          <span className="hidden lg:inline text-[10px] font-mono tracking-widest text-carbon-500 uppercase px-1.5 py-0.5 border border-carbon-800 bg-carbon-950">
            DISPATCH_v1.0
          </span>
        </div>

        <div className="h-4 w-px bg-carbon-800 hidden sm:block" />

        {/* Workspace Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowWsDropdown(!showWsDropdown)}
            className="flex items-center space-x-2 px-2.5 py-1.5 bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs text-carbon-200 transition font-mono"
          >
            <span className="text-carbon-400 text-[10px]">WS:</span>
            <span className="font-medium max-w-[150px] truncate text-white">
              {currentWorkspace ? currentWorkspace.name.toUpperCase() : 'NO_SELECTION'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-carbon-400 ml-1" />
          </button>

          {showWsDropdown && (
            <div className="absolute left-0 mt-1.5 w-60 bg-carbon-900 border border-carbon-750 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-mono tracking-wider text-carbon-500 uppercase border-b border-carbon-800">
                ACTIVE WORKSPACES
              </div>
              <div className="max-h-60 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setShowWsDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-carbon-800 transition font-mono ${
                      currentWorkspace?.id === ws.id ? 'text-cyan-400 font-semibold bg-carbon-850' : 'text-carbon-300'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {currentWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-carbon-800 my-1" />
              <button
                onClick={() => {
                  setShowWsDropdown(false);
                  onOpenCreateWorkspace();
                }}
                className="w-full text-left px-3 py-2 text-xs text-cyan-400 hover:bg-cyan-950/20 font-mono font-medium flex items-center space-x-2"
              >
                <span>+ NEW WORKSPACE</span>
              </button>
            </div>
          )}
        </div>

        {currentWorkspace && (
          <button
            onClick={onOpenInvite}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono text-carbon-300 bg-carbon-850 hover:bg-carbon-800 hover:text-white border border-carbon-750 transition"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>INVITE_MEMBER</span>
          </button>
        )}
      </div>

      {/* Right: Live Telemetry Status, Notifications, Operator Profile */}
      <div className="flex items-center space-x-3">
        {/* Real-time Telemetry Indicator */}
        <div
          className={`flex items-center space-x-2 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border ${
            isConnected
              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/60 shadow-glow-green'
              : 'bg-amber-950/30 text-amber-400 border-amber-800/60'
          }`}
          title={isConnected ? 'Telemetry active: WebSocket synchronized' : 'Telemetry reconnecting...'}
        >
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </span>
          <span className="hidden sm:inline font-semibold">
            {isConnected ? 'SYS // LIVE' : 'SYS // SYNCING'}
          </span>
        </div>

        {/* Notifications Dispatch */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showNotifications) clearNotifications();
            }}
            className="p-1.5 bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-carbon-300 hover:text-white transition relative"
            title="Notification alerts"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-carbon-950 text-[10px] flex items-center justify-center font-mono font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-carbon-900 border border-carbon-750 shadow-2xl z-50">
              <div className="p-3 border-b border-carbon-800 flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase text-carbon-400 flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TELEMETRY_LOGS</span>
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-carbon-800 font-mono text-xs">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-carbon-500">NO PENDING ALERTS</div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="p-3 hover:bg-carbon-850 transition">
                      <p className="font-semibold text-white tracking-tight">{n.title}</p>
                      <p className="text-carbon-400 text-[11px] mt-0.5">{n.message}</p>
                      <span className="text-[9px] text-carbon-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 px-2 py-1 bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 transition"
          >
            <span className="text-xs font-mono text-carbon-300 hidden md:inline max-w-[120px] truncate uppercase">
              OP // {user?.name.split(' ')[0]}
            </span>
            <div className="w-6 h-6 bg-cyan-600 text-carbon-950 font-display text-[11px] font-bold flex items-center justify-center uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-carbon-900 border border-carbon-750 shadow-2xl py-1 z-50">
              <div className="px-3 py-2 border-b border-carbon-800 font-mono">
                <p className="text-xs font-bold text-white truncate uppercase">{user?.name}</p>
                <p className="text-[10px] text-carbon-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-xs font-mono text-rose-400 hover:bg-rose-950/20 flex items-center space-x-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>TERMINATE_SESSION</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
