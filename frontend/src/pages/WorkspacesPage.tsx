import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspaces';
import { Navbar } from '../components/Navbar';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { InviteModal } from '../components/InviteModal';
import { CommandPalette } from '../components/CommandPalette';
import { GettingStartedModal } from '../components/GettingStartedModal';
import type { Workspace } from '../types';
import {
  Layers,
  Plus,
  Users,
  ArrowRight,
  Search,
  HelpCircle
} from 'lucide-react';

export const WorkspacesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [inviteWs, setInviteWs] = useState<Workspace | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch workspaces
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getUserWorkspaces,
  });

  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);
  const currentWorkspace = workspaces.find((w) => w.id === selectedWsId) || workspaces[0] || null;

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-svh bg-graphite-bg text-graphite-ink font-jost flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={(ws) => setSelectedWsId(ws.id)}
        onOpenCreateWorkspace={() => setIsCreateWsOpen(true)}
        onOpenInvite={() => setInviteWs(currentWorkspace)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspaces Directory */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Tile: Clear Explanation of What Workspaces Are */}
        <div className="bg-graphite-field text-graphite-fieldInk rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-normal uppercase block">
              WORKSPACE DIRECTORY
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mt-1 leading-tight">
              Team & Organization Workspaces
            </h1>
            <p className="text-xs sm:text-sm font-medium mt-2 opacity-90 max-w-2xl leading-relaxed">
              In TeamSync, boards and tasks must belong to a Workspace. Select an active workspace below to manage its project sprint boards, or create a new workspace to start organizing a new team.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-3.5 py-2.5 bg-graphite-field text-graphite-fieldInk border border-graphite-fieldInk/20 rounded-xl text-xs font-bold hover:bg-graphite-fieldInk/10 active:scale-[0.98] transition flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4 text-graphite-orange" />
              <span>Tour Guide</span>
            </button>
            <button
              onClick={() => setIsCreateWsOpen(true)}
              className="px-5 py-2.5 bg-graphite-orange text-graphite-fieldInk rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>

        {/* Filter & Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-graphite-ink">
              All Workspaces ({filteredWorkspaces.length})
            </h2>
            <span className="text-xs text-graphite-muted">
              Select one to view and create boards
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-graphite-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter workspaces..."
              className="w-full bg-graphite-surface text-graphite-ink pl-8 pr-3 py-1.5 rounded-lg text-xs border border-graphite-bg focus:outline-none focus:ring-1 focus:ring-graphite-orange transition placeholder-graphite-muted"
            />
          </div>
        </div>

        {/* ZERO STATE: When user has NO workspaces */}
        {!isLoading && workspaces.length === 0 && (
          <div className="p-8 sm:p-12 rounded-2xl bg-graphite-surface border-2 border-dashed border-graphite-elevated text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-graphite-bg text-graphite-orange flex items-center justify-center mx-auto border border-graphite-elevated">
              <Layers className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-graphite-ink">
                No Workspaces Found
              </h3>
              <p className="text-xs text-graphite-muted leading-relaxed max-w-sm mx-auto">
                Before you can create boards or add tasks, you need a workspace to house them. Workspaces let you organize projects and collaborate with teammates.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsCreateWsOpen(true)}
                className="px-6 py-3 bg-graphite-orange text-graphite-fieldInk rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Your First Workspace</span>
              </button>
            </div>
          </div>
        )}

        {/* WORKSPACES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkspaces.map((ws) => {
            const memberCount = ws.members?.length || 1;
            const isOwner = ws.members?.some((m) => m.role === 'OWNER');

            return (
              <div
                key={ws.id}
                className="bg-graphite-surface rounded-2xl p-5 border border-graphite-bg hover:border-graphite-elevated transition flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-graphite-bg text-graphite-orange flex items-center justify-center font-bold text-sm border border-graphite-elevated">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-graphite-bg text-graphite-muted">
                      {isOwner ? 'OWNER' : 'MEMBER'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-graphite-ink group-hover:text-white transition">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-graphite-muted line-clamp-2 mt-1">
                      {ws.description || 'No description provided for this workspace.'}
                    </p>
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div data-ui="card-footer" className="pt-4 border-t border-graphite-bg space-y-3">
                  <div className="flex items-center justify-between text-xs text-graphite-muted">
                    <span className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{memberCount} member{memberCount > 1 ? 's' : ''}</span>
                    </span>

                    <button
                      onClick={() => setInviteWs(ws)}
                      className="text-graphite-muted hover:text-graphite-orange text-[11px] font-bold transition"
                    >
                      + Invite
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedWsId(ws.id);
                      navigate(`/app`);
                    }}
                    className="w-full py-2.5 bg-graphite-bg hover:bg-graphite-elevated text-graphite-ink group-hover:text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 border border-graphite-bg"
                  >
                    <span>Open Workspace Boards</span>
                    <ArrowRight className="w-3.5 h-3.5 text-graphite-orange group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Create New Workspace Card */}
          <div
            onClick={() => setIsCreateWsOpen(true)}
            className="p-6 rounded-2xl bg-graphite-surface/40 hover:bg-graphite-surface border-2 border-dashed border-graphite-elevated hover:border-graphite-orange cursor-pointer transition flex flex-col items-center justify-center text-center min-h-[220px] active:scale-[0.99] group space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-graphite-bg flex items-center justify-center text-graphite-muted group-hover:text-graphite-orange transition">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-graphite-ink block">
                + Create New Workspace
              </span>
              <span className="text-xs text-graphite-muted mt-1 max-w-[200px] block mx-auto">
                Set up a fresh workspace for a new project, team, or organization
              </span>
            </div>
          </div>
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
          await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
          setSelectedWsId(newWs.id);
          setIsCreateWsOpen(false);
        }}
      />

      <InviteModal
        isOpen={!!inviteWs}
        onClose={() => setInviteWs(null)}
        workspaceId={inviteWs?.id || ''}
        workspaceName={inviteWs?.name || ''}
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
          setInviteWs(currentWorkspace);
        }}
      />
    </div>
  );
};
