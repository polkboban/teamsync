import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { workspaceApi } from '../api/workspaces';
import { boardApi } from '../api/boards';
import { taskApi } from '../api/tasks';
import type { Task } from '../types';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ListColumn } from '../components/ListColumn';
import { TaskDetailsDrawer } from '../components/TaskDetailsDrawer';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { CreateBoardModal } from '../components/CreateBoardModal';
import { InviteModal } from '../components/InviteModal';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Kanban,
  Loader2,
  LayoutGrid,
  List as ListIcon,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { boardId: paramBoardId } = useParams<{ boardId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { socket, activeUsers, joinBoard, leaveBoard } = useSocket();

  // Modals state
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Active selections
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'activity'>('kanban');

  // Task Details Drawer state
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);

  // New list title input state
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // 1. Fetch Workspaces
  const { data: workspaces = [], isLoading: isLoadingWs } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getUserWorkspaces,
  });

  // Set default workspace if none selected
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWsId) {
      setSelectedWsId(workspaces[0].id);
    }
  }, [workspaces, selectedWsId]);

  const currentWorkspace = useMemo(
    () => workspaces.find((w) => w.id === selectedWsId) || null,
    [workspaces, selectedWsId]
  );

  // 2. Fetch Boards for current workspace
  const { data: boards = [] } = useQuery({
    queryKey: ['boards', selectedWsId],
    queryFn: () => (selectedWsId ? boardApi.getWorkspaceBoards(selectedWsId) : Promise.resolve([])),
    enabled: !!selectedWsId,
  });

  const selectedBoardId = paramBoardId || null;

  const currentBoard = useMemo(
    () => boards.find((b) => b.id === selectedBoardId) || null,
    [boards, selectedBoardId]
  );

  // 3. Fetch Workspace Members
  const { data: members = [] } = useQuery({
    queryKey: ['members', selectedWsId],
    queryFn: () => (selectedWsId ? workspaceApi.getWorkspaceMembers(selectedWsId) : Promise.resolve([])),
    enabled: !!selectedWsId,
  });

  // 4. Fetch Lists & Tasks for current board
  const { data: lists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ['lists', selectedBoardId],
    queryFn: () => (selectedBoardId ? boardApi.getBoardLists(selectedBoardId) : Promise.resolve([])),
    enabled: !!selectedBoardId,
  });

  // 5. Connect board socket room for presence & real-time updates
  useEffect(() => {
    if (!selectedBoardId) return;

    joinBoard(selectedBoardId);

    return () => {
      leaveBoard(selectedBoardId);
    };
  }, [selectedBoardId, joinBoard, leaveBoard]);

  // Real-time listener for foreign socket events
  useEffect(() => {
    if (!socket || !selectedBoardId) return;

    const handleTaskReordered = () => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
    };

    const handleTaskUpdated = (data: { taskId?: string; task?: any; assignee?: any }) => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
      if (inspectingTask && (data.taskId === inspectingTask.id || data.task?.id === inspectingTask.id)) {
        if (data.task) setInspectingTask(data.task);
      }
    };

    const handleTaskDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
      setInspectingTask(null);
    };

    socket.on('task:reordered', handleTaskReordered);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:reordered', handleTaskReordered);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, selectedBoardId, queryClient, inspectingTask]);

  // Mutations
  const createWorkspaceMutation = useMutation({
    mutationFn: workspaceApi.createWorkspace,
    onSuccess: (newWs) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSelectedWsId(newWs.id);
      navigate('/app');
    },
  });

  const createBoardMutation = useMutation({
    mutationFn: (title: string) => boardApi.createBoard({ title, workspaceId: selectedWsId! }),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', selectedWsId] });
      navigate(`/app/boards/${newBoard.id}`);
    },
  });

  const createListMutation = useMutation({
    mutationFn: (title: string) => boardApi.createList({ title, boardId: selectedBoardId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
      setNewListTitle('');
      setIsAddingList(false);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: { title?: string; description?: string } }) =>
      taskApi.updateTask(taskId, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
      setInspectingTask(updatedTask);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
      setInspectingTask(null);
    },
  });

  const reorderTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: { listId: string; order: number } }) =>
      taskApi.reorderTask(taskId, data),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
    },
  });

  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string | null }) =>
      taskApi.assignTask(taskId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', selectedBoardId] });
    },
  });

  // Drag and Drop handler
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceList = lists.find((l) => l.id === source.droppableId);
    const destList = lists.find((l) => l.id === destination.droppableId);
    if (!sourceList || !destList) return;

    // Clone current lists for optimistic update
    const newLists = [...lists];
    const sourceListIndex = newLists.findIndex((l) => l.id === source.droppableId);
    const destListIndex = newLists.findIndex((l) => l.id === destination.droppableId);

    const sourceTasks = [...newLists[sourceListIndex].tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      newLists[sourceListIndex] = { ...newLists[sourceListIndex], tasks: sourceTasks };
    } else {
      const destTasks = [...newLists[destListIndex].tasks];
      destTasks.splice(destination.index, 0, { ...movedTask, listId: destination.droppableId });
      newLists[sourceListIndex] = { ...newLists[sourceListIndex], tasks: sourceTasks };
      newLists[destListIndex] = { ...newLists[destListIndex], tasks: destTasks };
    }

    // Calculate new order
    const destinationTasks =
      source.droppableId === destination.droppableId
        ? sourceTasks
        : newLists[destListIndex].tasks;

    let newOrder = 1000;
    if (destinationTasks.length === 1) {
      newOrder = 1000;
    } else if (destination.index === 0) {
      newOrder = Math.max(1, destinationTasks[1].order / 2);
    } else if (destination.index === destinationTasks.length - 1) {
      newOrder = destinationTasks[destination.index - 1].order + 1000;
    } else {
      const prevOrder = destinationTasks[destination.index - 1].order;
      const nextOrder = destinationTasks[destination.index + 1].order;
      newOrder = Math.round((prevOrder + nextOrder) / 2);
    }

    // Apply optimistic update to query cache
    queryClient.setQueryData(['lists', selectedBoardId], newLists);

    // Call backend API
    reorderTaskMutation.mutate({
      taskId: draggableId,
      data: {
        listId: destination.droppableId,
        order: newOrder,
      },
    });
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !selectedBoardId) return;
    await createListMutation.mutateAsync(newListTitle.trim());
  };

  const handleMoveTaskColumn = (taskId: string, listId: string) => {
    reorderTaskMutation.mutate({
      taskId,
      data: { listId, order: 1000 },
    });
  };

  // Compute aggregate stats across lists
  const allTasks = useMemo(() => lists.flatMap((l) => l.tasks), [lists]);

  if (isLoadingWs) {
    return (
      <div className="min-h-svh bg-graphite-bg flex flex-col items-center justify-center text-graphite-muted space-y-3 font-jost">
        <Loader2 className="w-8 h-8 animate-spin text-graphite-orange" />
        <span className="text-xs font-bold">CONNECTING TO WORKSPACE...</span>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-graphite-bg text-graphite-ink font-jost flex flex-col overflow-hidden selection:bg-graphite-orange selection:text-graphite-fieldInk">
      {/* Top Navigation */}
      <Navbar
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={(ws) => {
          setSelectedWsId(ws.id);
          navigate('/app');
        }}
        onOpenCreateWorkspace={() => setIsCreateWsOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          boards={boards}
          selectedBoardId={selectedBoardId}
          onSelectBoard={(id) => {
            if (id) {
              navigate(`/app/boards/${id}`);
            } else {
              navigate('/app');
            }
          }}
          onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
          members={members}
          onOpenInvite={() => setIsInviteOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-graphite-bg overflow-hidden">
          {/* ========================================================================= */}
          {/* LAYER 1: WORKSPACE HUB & BOARDS DIRECTORY (When no board is selected) */}
          {/* ========================================================================= */}
          {!selectedBoardId ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Workspace Header Tile */}
              <div className="bg-graphite-field text-graphite-fieldInk rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold tracking-normal uppercase">
                    WORKSPACE HUB
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mt-1 leading-none uppercase">
                    {currentWorkspace?.name || 'Your Workspace'}
                  </h1>
                  <p className="text-xs sm:text-sm font-medium mt-3 opacity-90 max-w-lg">
                    {currentWorkspace?.description ||
                      'Manage project sprint boards, track tasks, and collaborate with your team in real time.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsInviteOpen(true)}
                    className="px-4 py-2.5 bg-graphite-fieldInk text-graphite-field rounded-lg text-xs font-bold hover:opacity-90 active:scale-[0.98] transition"
                  >
                    + Invite Teammate
                  </button>
                  <button
                    onClick={() => setIsCreateBoardOpen(true)}
                    className="px-5 py-2.5 bg-graphite-orange text-graphite-fieldInk rounded-lg text-xs font-bold hover:opacity-90 active:scale-[0.98] transition"
                  >
                    + Create New Board
                  </button>
                </div>
              </div>

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-4 bg-graphite-surface rounded-lg">
                  <div className="text-xs text-graphite-muted font-bold">TOTAL BOARDS</div>
                  <div className="text-2xl sm:text-3xl font-bold text-graphite-ink mt-1">{boards.length}</div>
                </div>
                <div className="p-4 bg-graphite-surface rounded-lg">
                  <div className="text-xs text-graphite-muted font-bold">TEAM MEMBERS</div>
                  <div className="text-2xl sm:text-3xl font-bold text-graphite-ink mt-1">{members.length}</div>
                </div>
                <div className="p-4 bg-graphite-surface rounded-lg">
                  <div className="text-xs text-graphite-muted font-bold">WEBSOCKET STATUS</div>
                  <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Real-Time Active</span>
                  </div>
                </div>
                <div className="p-4 bg-graphite-surface rounded-lg">
                  <div className="text-xs text-graphite-muted font-bold">REDIS CACHE</div>
                  <div className="text-sm font-bold text-graphite-orange mt-2">
                    48h Ephemeral TTL
                  </div>
                </div>
              </div>

              {/* Boards Grid */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-lg font-bold text-graphite-ink">Active Sprint & Project Boards</h2>
                  <span className="text-xs text-graphite-muted font-bold">Select a board to open</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {boards.map((board) => (
                    <div
                      key={board.id}
                      onClick={() => navigate(`/app/boards/${board.id}`)}
                      className="p-5 rounded-xl bg-graphite-surface hover:bg-graphite-elevated cursor-pointer transition flex flex-col justify-between min-h-[160px] active:scale-[0.99] group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-graphite-bg text-graphite-orange flex items-center justify-center font-bold">
                            <Kanban className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-graphite-bg text-graphite-muted font-bold">
                            BOARD
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-graphite-ink group-hover:text-white transition">
                          {board.title}
                        </h3>
                      </div>

                      <div data-ui="board-card-footer" className="pt-4 border-t border-graphite-bg flex items-center justify-between text-xs text-graphite-muted">
                        <span>Created recently</span>
                        <div className="flex items-center space-x-1 text-graphite-orange font-bold group-hover:translate-x-0.5 transition">
                          <span>Open Board</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Create Board Tile */}
                  <div
                    onClick={() => setIsCreateBoardOpen(true)}
                    className="p-5 rounded-xl bg-graphite-surface/40 hover:bg-graphite-surface border-2 border-dashed border-graphite-elevated hover:border-graphite-orange cursor-pointer transition flex flex-col items-center justify-center text-center min-h-[160px] active:scale-[0.99]"
                  >
                    <div className="w-10 h-10 rounded-full bg-graphite-bg flex items-center justify-center text-graphite-muted mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs text-graphite-ink">+ Create New Board</span>
                    <span className="text-[11px] text-graphite-muted mt-0.5">Add sprint columns & tasks</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* LAYER 2: DEDICATED BOARD VIEW (/app/boards/:boardId)                      */
            /* ========================================================================= */
            <>
              {/* Board Header Bar: Breadcrumbs, View Switcher & Live Presence */}
              <div data-ui="board-header" className="h-14 px-4 sm:px-6 bg-graphite-surface border-b border-graphite-bg flex items-center justify-between shrink-0">
                {/* Left: Breadcrumbs & Board Title */}
                <div className="flex items-center space-x-3 truncate">
                  <button
                    onClick={() => navigate('/app')}
                    className="p-1 text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg rounded transition"
                    title="Back to all boards"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-xs font-bold text-graphite-muted hidden sm:inline">
                      {currentWorkspace?.name}
                    </span>
                    <span className="text-graphite-muted hidden sm:inline">/</span>
                    <h2 className="text-sm sm:text-base font-bold text-graphite-ink tracking-tight truncate">
                      {currentBoard?.title}
                    </h2>
                  </div>
                </div>

                {/* Center: View Switcher (Kanban, List, Activity) */}
                <div className="hidden md:flex bg-graphite-bg rounded-lg p-1 text-xs">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-1 rounded font-bold transition flex items-center space-x-1.5 ${
                      viewMode === 'kanban'
                        ? 'bg-graphite-surface text-graphite-orange'
                        : 'text-graphite-muted hover:text-graphite-ink'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kanban</span>
                  </button>

                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded font-bold transition flex items-center space-x-1.5 ${
                      viewMode === 'list'
                        ? 'bg-graphite-surface text-graphite-orange'
                        : 'text-graphite-muted hover:text-graphite-ink'
                    }`}
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                    <span>List</span>
                  </button>

                  <button
                    onClick={() => setViewMode('activity')}
                    className={`px-3 py-1 rounded font-bold transition flex items-center space-x-1.5 ${
                      viewMode === 'activity'
                        ? 'bg-graphite-surface text-graphite-orange'
                        : 'text-graphite-muted hover:text-graphite-ink'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Activity</span>
                  </button>
                </div>

                {/* Right: Active Presence Avatars */}
                <div className="flex items-center space-x-2.5">
                  <span className="text-[11px] text-graphite-muted hidden sm:inline">Live:</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {activeUsers.map((activeId, idx) => {
                      const memberMatch = members.find((m) => m.userId === activeId || m.user.id === activeId);
                      const name = memberMatch?.user.name || (activeId === user?.id ? user?.name : `User ${idx + 1}`);
                      return (
                        <div
                          key={idx}
                          title={`${name} (Viewing board in real time)`}
                          className="w-6 h-6 rounded bg-graphite-orange text-graphite-fieldInk text-[10px] font-bold flex items-center justify-center uppercase ring-2 ring-graphite-surface"
                        >
                          {name?.charAt(0) || 'U'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* View Content Area */}
              <div className="flex-1 overflow-x-auto p-4 sm:p-5">
                {isLoadingLists ? (
                  <div className="h-full flex flex-col items-center justify-center text-graphite-muted space-y-2">
                    <Loader2 className="w-7 h-7 animate-spin text-graphite-orange" />
                    <span className="text-xs font-bold">LOADING BOARD CARDS...</span>
                  </div>
                ) : viewMode === 'kanban' ? (
                  /* KANBAN VIEW */
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex items-start space-x-3 h-full">
                      {lists.map((list) => (
                        <ListColumn
                          key={list.id}
                          list={list}
                          members={members}
                          onAddTask={async (listId, title, description) => {
                            await createTaskMutation.mutateAsync({ title, description, listId });
                          }}
                          onAssignTask={(taskId, assigneeId) => {
                            assignTaskMutation.mutate({ taskId, assigneeId });
                          }}
                          onTaskClick={(task) => setInspectingTask(task)}
                        />
                      ))}

                      {/* Add New List (Column) */}
                      <div className="w-72 shrink-0">
                        {isAddingList ? (
                          <form
                            onSubmit={handleCreateList}
                            className="bg-graphite-surface rounded-xl p-3 space-y-2"
                          >
                            <input
                              type="text"
                              placeholder="Column title (e.g. In Review)..."
                              value={newListTitle}
                              onChange={(e) => setNewListTitle(e.target.value)}
                              autoFocus
                              required
                              className="w-full bg-graphite-bg rounded px-3 py-1.5 text-xs text-graphite-ink placeholder-graphite-muted focus:outline-none focus:ring-1 focus:ring-graphite-orange transition"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                type="submit"
                                disabled={createListMutation.isPending || !newListTitle.trim()}
                                className="px-3 py-1 bg-graphite-orange text-graphite-fieldInk disabled:opacity-50 font-bold rounded text-xs transition active:scale-[0.98]"
                              >
                                {createListMutation.isPending ? 'Adding...' : 'Add list'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingList(false);
                                  setNewListTitle('');
                                }}
                                className="px-2 py-1 text-xs text-graphite-muted hover:text-graphite-ink transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setIsAddingList(true)}
                            className="w-full py-3 px-4 bg-graphite-surface hover:bg-graphite-elevated rounded-xl text-xs font-bold text-graphite-muted hover:text-graphite-ink flex items-center justify-center space-x-2 transition"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Column</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </DragDropContext>
                ) : viewMode === 'list' ? (
                  /* LIST / TABLE VIEW (Departure Board Style) */
                  <div className="max-w-5xl mx-auto space-y-1.5">
                    <div className="flex items-center justify-between pb-2 text-xs font-bold text-graphite-muted uppercase">
                      <span>Task ({allTasks.length})</span>
                      <span>List Status / Assignee</span>
                    </div>
                    {allTasks.length === 0 ? (
                      <div className="p-8 text-center bg-graphite-surface rounded-xl text-xs text-graphite-muted">
                        No tasks on this board yet. Switch to Kanban view to add tasks.
                      </div>
                    ) : (
                      allTasks.map((task) => {
                        const listName = lists.find((l) => l.id === task.listId)?.title || 'Column';
                        return (
                          <div
                            key={task.id}
                            onClick={() => setInspectingTask(task)}
                            className="p-4 rounded-lg bg-graphite-surface hover:bg-graphite-elevated cursor-pointer transition flex items-center justify-between active:scale-[0.99]"
                          >
                            <div className="flex items-center space-x-3 truncate">
                              <span className="text-xs font-bold text-graphite-orange">
                                #{task.id.slice(0, 5)}
                              </span>
                              <span className="text-xs font-bold text-graphite-ink truncate">
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0 text-xs">
                              <span className="px-2 py-0.5 rounded bg-graphite-bg text-[10px] font-bold text-graphite-muted">
                                {listName}
                              </span>
                              <span className="text-graphite-muted text-xs">
                                {task.assignee?.name || 'Unassigned'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* ACTIVITY VIEW */
                  <div className="max-w-4xl mx-auto space-y-2">
                    <div className="p-6 bg-graphite-surface rounded-xl space-y-3">
                      <div data-ui="activity-header" className="flex items-center justify-between border-b border-graphite-bg pb-3">
                        <h3 className="text-sm font-bold text-graphite-ink">Live Board Activity Stream</h3>
                        <span className="text-xs text-graphite-orange font-bold">Socket.IO Connected</span>
                      </div>
                      <div className="space-y-2 text-xs text-graphite-muted">
                        <div className="flex items-center space-x-2 py-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-graphite-ink font-bold">Room synchronized:</span>
                          <span>`board:{selectedBoardId}` event listener active.</span>
                        </div>
                        <div className="flex items-center space-x-2 py-1">
                          <Clock className="w-4 h-4 text-graphite-orange" />
                          <span className="text-graphite-ink font-bold">Presence tracking:</span>
                          <span>{activeUsers.length} teammates connected via WebSocket transport.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Task Details Drawer (Layer 3) */}
      <TaskDetailsDrawer
        isOpen={!!inspectingTask}
        onClose={() => setInspectingTask(null)}
        task={inspectingTask}
        lists={lists}
        members={members}
        onUpdateTask={async (taskId, data) => {
          await updateTaskMutation.mutateAsync({ taskId, data });
        }}
        onAssignTask={(taskId, assigneeId) => {
          assignTaskMutation.mutate({ taskId, assigneeId });
        }}
        onMoveTask={handleMoveTaskColumn}
        onDeleteTask={async (taskId) => {
          await deleteTaskMutation.mutateAsync(taskId);
        }}
      />

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        onSubmit={async (name, description) => {
          await createWorkspaceMutation.mutateAsync({ name, description });
        }}
      />

      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onSubmit={async (title) => {
          await createBoardMutation.mutateAsync(title);
        }}
      />

      {currentWorkspace && (
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          workspaceId={currentWorkspace.id}
          workspaceName={currentWorkspace.name}
        />
      )}
    </div>
  );
};
