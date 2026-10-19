import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Board, Task } from '../types';
import {
  Search,
  Kanban,
  LayoutGrid,
  Plus,
  Layers,
  UserPlus,
  List as ListIcon,
  Activity,
  ArrowRight,
  X,
  FileText
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Tasks' | 'Views';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  onSelectBoard: (boardId: string | null) => void;
  onOpenCreateBoard: () => void;
  onOpenCreateWorkspace: () => void;
  onOpenInvite: () => void;
  tasks?: Task[];
  onSelectTask?: (taskId: string) => void;
  currentView?: 'kanban' | 'list' | 'activity';
  onSwitchView?: (view: 'kanban' | 'list' | 'activity') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  boards,
  onSelectBoard,
  onOpenCreateBoard,
  onOpenCreateWorkspace,
  onOpenInvite,
  tasks = [],
  onSelectTask,
  currentView,
  onSwitchView,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build command catalogue
  const allCommands = useMemo(() => {
    const items: CommandItem[] = [];

    // Navigation: Workspace Hub
    items.push({
      id: 'nav-hub',
      category: 'Navigation',
      title: 'Go to Workspace Hub',
      subtitle: 'Overview of all sprint boards and metrics',
      icon: <LayoutGrid className="w-4 h-4 text-graphite-orange" />,
      action: () => {
        onSelectBoard(null);
        onClose();
      },
      keywords: ['hub', 'home', 'overview', 'dashboard', 'directory']
    });

    // Navigation: Boards
    boards.forEach((board) => {
      items.push({
        id: `nav-board-${board.id}`,
        category: 'Navigation',
        title: `Open Board: ${board.title}`,
        subtitle: 'Sprint Kanban and task lists',
        icon: <Kanban className="w-4 h-4 text-graphite-orange" />,
        action: () => {
          onSelectBoard(board.id);
          onClose();
        },
        keywords: ['board', 'sprint', board.title.toLowerCase()]
      });
    });

    // Actions
    items.push({
      id: 'act-create-board',
      category: 'Actions',
      title: 'Create New Board',
      subtitle: 'Add a new project or sprint board',
      icon: <Plus className="w-4 h-4 text-graphite-orange" />,
      action: () => {
        onClose();
        onOpenCreateBoard();
      },
      keywords: ['create', 'new', 'board', 'add', 'project']
    });

    items.push({
      id: 'act-create-workspace',
      category: 'Actions',
      title: 'Create New Workspace',
      subtitle: 'Add a team or organizational workspace',
      icon: <Layers className="w-4 h-4 text-graphite-orange" />,
      action: () => {
        onClose();
        onOpenCreateWorkspace();
      },
      keywords: ['create', 'new', 'workspace', 'organization', 'team']
    });

    items.push({
      id: 'act-invite-member',
      category: 'Actions',
      title: 'Invite Teammate',
      subtitle: 'Generate invitation link with 48h validity',
      icon: <UserPlus className="w-4 h-4 text-graphite-orange" />,
      action: () => {
        onClose();
        onOpenInvite();
      },
      keywords: ['invite', 'team', 'member', 'user', 'share', 'link']
    });

    // View Switching (if on a board)
    if (onSwitchView) {
      items.push({
        id: 'view-kanban',
        category: 'Views',
        title: 'Switch to Kanban View',
        subtitle: currentView === 'kanban' ? 'Currently active' : 'Drag-and-drop column board',
        icon: <Kanban className="w-4 h-4 text-graphite-orange" />,
        action: () => {
          onSwitchView('kanban');
          onClose();
        },
        keywords: ['kanban', 'board', 'cards', 'columns', 'drag']
      });

      items.push({
        id: 'view-table',
        category: 'Views',
        title: 'Switch to List / Table View',
        subtitle: currentView === 'list' ? 'Currently active' : 'Tabular departure-board layout',
        icon: <ListIcon className="w-4 h-4 text-graphite-orange" />,
        action: () => {
          onSwitchView('list');
          onClose();
        },
        keywords: ['table', 'list', 'rows', 'spreadsheet', 'grid']
      });

      items.push({
        id: 'view-activity',
        category: 'Views',
        title: 'Switch to Live Activity Stream',
        subtitle: currentView === 'activity' ? 'Currently active' : 'Real-time WebSocket event timeline',
        icon: <Activity className="w-4 h-4 text-graphite-orange" />,
        action: () => {
          onSwitchView('activity');
          onClose();
        },
        keywords: ['activity', 'stream', 'logs', 'audit', 'live', 'socket']
      });
    }

    // Tasks (if on a board with loaded tasks)
    if (onSelectTask && tasks.length > 0) {
      tasks.forEach((task) => {
        items.push({
          id: `task-${task.id}`,
          category: 'Tasks',
          title: task.title,
          subtitle: task.description ? task.description.slice(0, 70) : `Task #${task.id.slice(0, 5)}`,
          icon: <FileText className="w-4 h-4 text-graphite-orange" />,
          action: () => {
            onSelectTask(task.id);
            onClose();
          },
          keywords: [
            task.title.toLowerCase(),
            task.description?.toLowerCase() || '',
            task.id.slice(0, 5),
            task.assignee?.name?.toLowerCase() || ''
          ]
        });
      });
    }

    return items;
  }, [boards, tasks, onSelectBoard, onOpenCreateBoard, onOpenCreateWorkspace, onOpenInvite, onSelectTask, currentView, onSwitchView, onClose]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;

    return allCommands.filter((cmd) => {
      if (cmd.title.toLowerCase().includes(q)) return true;
      if (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) return true;
      if (cmd.keywords && cmd.keywords.some((k) => k.includes(q))) return true;
      return false;
    });
  }, [allCommands, query]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation within the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) {
        current.action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 font-jost"
      onClick={onClose}
    >
      <div
        data-ui="command-palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-graphite-surface rounded-xl border border-graphite-bg overflow-hidden relative"
      >
        {/* Search Input Bar */}
        <div data-ui="command-palette-input" className="p-3.5 border-b border-graphite-bg flex items-center space-x-3 bg-graphite-bg">
          <Search className="w-4 h-4 text-graphite-orange shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search boards, tasks, actions or views..."
            className="flex-1 bg-transparent text-sm text-graphite-ink placeholder:text-graphite-muted focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-graphite-muted hover:text-graphite-ink rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 rounded bg-graphite-surface text-[10px] text-graphite-muted border border-graphite-elevated font-semibold">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          data-ui="command-palette-results"
          className="max-h-80 overflow-y-auto p-2 space-y-1"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-graphite-muted text-xs">
              No matching commands or tasks found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-active={isSelected ? 'true' : 'false'}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-graphite-elevated text-white'
                      : 'text-graphite-ink hover:bg-graphite-bg'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-graphite-bg text-graphite-orange' : 'bg-graphite-bg text-graphite-muted'
                    }`}>
                      {cmd.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate group-hover:text-white">
                        {cmd.title}
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-graphite-muted truncate mt-0.5">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-graphite-bg text-graphite-muted font-bold">
                      {cmd.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-graphite-orange animate-in fade-in duration-100" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div data-ui="command-palette-footer" className="px-4 py-2 bg-graphite-surface border-t border-graphite-bg flex items-center justify-between text-[11px] text-graphite-muted">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.5 rounded bg-graphite-bg border border-graphite-elevated text-[9px] font-semibold">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-graphite-bg border border-graphite-elevated text-[9px] font-semibold">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-graphite-bg border border-graphite-elevated text-[9px] font-semibold">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span>TEAMSYNC</span>
        </div>
      </div>
    </div>
  );
};
