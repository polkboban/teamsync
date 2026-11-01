import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from '../components/Navbar';
import { GettingStartedModal } from '../components/GettingStartedModal';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { InviteModal } from '../components/InviteModal';
import { CommandPalette } from '../components/CommandPalette';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspaces';
import {
  Palette,
  ArrowLeft,
  Check,
  RotateCcw,
  Layers,
  HelpCircle,
  Keyboard,
  ExternalLink
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentColor, setThemeColor, setCustomHex, resetToDefault, presets } = useTheme();

  // Modals
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [customHexInput, setCustomHexInput] = useState(currentColor.hex);

  // Fetch workspaces for navbar
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getUserWorkspaces,
  });

  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);
  const currentWorkspace = workspaces.find((w) => w.id === selectedWsId) || workspaces[0] || null;

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setCustomHex(val);
    }
  };

  const handleNativeColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHexInput(val);
    setCustomHex(val);
  };

  return (
    <div className="min-h-svh bg-graphite-bg text-graphite-ink font-jost flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={(ws) => setSelectedWsId(ws.id)}
        onOpenCreateWorkspace={() => setIsCreateWsOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Settings Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div data-ui="settings-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-surface pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/app')}
              className="p-2 text-graphite-muted hover:text-graphite-ink hover:bg-graphite-surface rounded-lg transition"
              title="Back to board"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-graphite-orange uppercase tracking-wider block">
                Preferences & Personalization
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-graphite-ink tracking-tight">
                Settings
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-3.5 py-2 bg-graphite-surface hover:bg-graphite-elevated text-graphite-ink text-xs font-bold rounded-lg border border-graphite-bg flex items-center space-x-2 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-graphite-orange" />
              <span>Getting Started Guide</span>
            </button>
          </div>
        </div>

        {/* Dense Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SECTION 1: ACCENT COLOR & THEME CUSTOMIZATION (Takes 7 cols) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="bg-graphite-surface rounded-2xl p-5 sm:p-6 border border-graphite-bg space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-graphite-bg flex items-center justify-center text-graphite-orange">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-graphite-ink">Accent Theme & Color</h2>
                    <p className="text-xs text-graphite-muted">Customize the primary UI highlight and gradient colors</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetToDefault();
                    setCustomHexInput('#ff4a1f');
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-graphite-muted hover:text-graphite-ink bg-graphite-bg hover:bg-graphite-elevated transition flex items-center space-x-1.5"
                  title="Reset to default safety orange"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>

              {/* Preset Swatches */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-graphite-muted uppercase tracking-wider block">
                  Curated Color Presets
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {presets.map((preset) => {
                    const isSelected = currentColor.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setThemeColor(preset);
                          setCustomHexInput(preset.hex);
                        }}
                        className={`p-3 rounded-xl bg-graphite-bg hover:bg-graphite-elevated border text-left transition flex items-center justify-between group ${
                          isSelected
                            ? 'border-graphite-orange ring-1 ring-graphite-orange'
                            : 'border-graphite-surface'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-xs font-bold text-graphite-ink truncate">
                            {preset.name.split(' ')[0]}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-graphite-orange shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Picker Input */}
              <div data-ui="custom-hex-section" className="pt-2 border-t border-graphite-bg space-y-2">
                <span className="text-[11px] font-bold text-graphite-muted uppercase tracking-wider block">
                  Custom Color Palette
                </span>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={currentColor.hex}
                      onChange={handleNativeColorPicker}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0 block"
                      title="Choose custom color"
                    />
                  </div>
                  <input
                    type="text"
                    value={customHexInput}
                    onChange={handleCustomColorChange}
                    placeholder="#ff4a1f"
                    maxLength={7}
                    className="flex-1 bg-graphite-bg text-graphite-ink px-3.5 py-2 rounded-lg text-xs tracking-wider font-semibold border border-graphite-bg focus:outline-none focus:ring-2 focus:ring-graphite-orange transition"
                  />
                  <button
                    onClick={() => setCustomHex(customHexInput)}
                    className="px-4 py-2 bg-graphite-orange text-graphite-fieldInk text-xs font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[11px] text-graphite-muted">
                  Enter any standard 6-digit hex code. Changes apply dynamically across all boards, buttons, badges, and presence indicators.
                </p>
              </div>

              {/* Live Preview Component Tile */}
              <div data-ui="live-preview-section" className="pt-4 border-t border-graphite-bg space-y-2.5">
                <span className="text-[11px] font-bold text-graphite-muted uppercase tracking-wider block">
                  Live UI Appearance Preview
                </span>
                <div className="p-4 rounded-xl bg-graphite-bg border border-graphite-elevated space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-graphite-orange flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-graphite-orange" />
                      <span>Active Task Badge</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-graphite-surface text-graphite-orange flex items-center">
                      <Check className="w-2.5 h-2.5 mr-1" /> 3/4 (75%)
                    </span>
                  </div>

                  <p className="text-xs font-bold text-graphite-ink">
                    Real-Time Distributed Multiplayer Presence Engine
                  </p>

                  <div data-ui="preview-footer" className="flex items-center justify-between pt-2 border-t border-graphite-surface text-xs">
                    <div className="flex items-center space-x-1.5 text-graphite-orange text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-graphite-orange" />
                      <span>Alex is moving this...</span>
                    </div>

                    <button className="px-3 py-1 bg-graphite-orange text-graphite-fieldInk font-bold text-xs rounded-md">
                      Interactive Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: USER PROFILE & WORKSPACES DIRECTORY (Takes 5 cols) */}
          <section className="lg:col-span-5 space-y-4">
            {/* User Profile Card */}
            <div className="bg-graphite-surface rounded-2xl p-5 sm:p-6 border border-graphite-bg space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-graphite-bg flex items-center justify-center text-graphite-orange font-bold text-lg border border-graphite-elevated">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-graphite-ink truncate">
                    {user?.name || 'Logged in user'}
                  </h3>
                  <p className="text-xs text-graphite-muted truncate">{user?.email}</p>
                </div>
              </div>

              <div className="p-3 bg-graphite-bg rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-graphite-muted font-medium">Session Status</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Authenticated</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-muted font-medium">Workspaces Joined</span>
                  <span className="text-graphite-ink font-bold">{workspaces.length}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-2.5 text-xs font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 rounded-xl transition"
              >
                Log Out
              </button>
            </div>

            {/* Workspaces Hub Callout Tile */}
            <div className="bg-graphite-surface rounded-2xl p-5 sm:p-6 border border-graphite-bg space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-graphite-bg flex items-center justify-center text-graphite-orange">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-graphite-ink">Workspaces Hub</h3>
                  <p className="text-xs text-graphite-muted">Manage your organizations & teams</p>
                </div>
              </div>

              <p className="text-xs text-graphite-ink/80 leading-relaxed">
                Workspaces are the root container for your boards and team members. Switch between workspaces or create new ones from the dedicated directory.
              </p>

              <button
                onClick={() => navigate('/app/workspaces')}
                className="w-full py-2 bg-graphite-bg hover:bg-graphite-elevated text-graphite-orange text-xs font-bold rounded-lg border border-graphite-bg flex items-center justify-center space-x-1.5 transition"
              >
                <span>View All Workspaces ({workspaces.length})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Keyboard Shortcuts Tile */}
            <div className="bg-graphite-surface rounded-2xl p-5 sm:p-6 border border-graphite-bg space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-graphite-bg flex items-center justify-center text-graphite-orange">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-graphite-ink">Keyboard Shortcuts</h3>
                  <p className="text-xs text-graphite-muted">Quick actions for power users</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-graphite-bg">
                  <span className="text-graphite-muted">Universal Command Palette</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-graphite-surface text-[10px] text-graphite-ink font-mono font-bold">
                    Ctrl + K
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-graphite-bg">
                  <span className="text-graphite-muted">Dismiss Drawer / Modal</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-graphite-surface text-[10px] text-graphite-ink font-mono font-bold">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      <GettingStartedModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        onSubmit={async (name, description) => {
          const newWs = await workspaceApi.createWorkspace({ name, description });
          setSelectedWsId(newWs.id);
          setIsCreateWsOpen(false);
        }}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        workspaceId={currentWorkspace?.id || ''}
        workspaceName={currentWorkspace?.name || ''}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        boards={[]}
        onSelectBoard={(boardId) => {
          if (boardId) navigate(`/app/board/${boardId}`);
          else navigate('/app');
          setIsCommandPaletteOpen(false);
        }}
        onOpenCreateBoard={() => {
          navigate('/app');
          setIsCommandPaletteOpen(false);
        }}
        onOpenCreateWorkspace={() => {
          setIsCommandPaletteOpen(false);
          setIsCreateWsOpen(true);
        }}
        onOpenInvite={() => {
          setIsCommandPaletteOpen(false);
          setIsInviteOpen(true);
        }}
      />
    </div>
  );
};
