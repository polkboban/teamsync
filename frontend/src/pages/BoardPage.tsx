import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { workspaceApi } from '../api/workspaces';
import { boardApi } from '../api/boards';
import { taskApi } from '../api/tasks';
import type { List } from '../types';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ListColumn } from '../components/ListColumn';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { CreateBoardModal } from '../components/CreateBoardModal';
import { InviteModal } from '../components/InviteModal';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Kanban, Sparkles, Loader2 } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { socket, activeUsers, joinBoard, leaveBoard } = useSocket();

  // Modals state
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Active selections
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

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

  // Set default board if none selected
  useEffect(() => {
    if (boards.length > 0 && (!selectedBoardId || !boards.some((b) => b.id === selectedBoardId))) {
      setSelectedBoardId(boards[0].id);
    } else if (boards.length === 0) {
      setSelectedBoardId(null);
    }
  }, [boards, selectedBoardId]);

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

    const handleTaskUpdated = (data: { taskId: string; assignee: any }) => {
      queryClient.setQueryData(['lists', selectedBoardId], (oldLists: List[] | undefined) => {
        if (!oldLists) return oldLists;
        return oldLists.map((list) => ({
          ...list,
          tasks: list.tasks.map((task) =>
            task.id === data.taskId
              ? { ...task, assigneeId: data.assignee?.id || null, assignee: data.assignee }
              : task
          ),
        }));
      });
    };

    socket.on('task:reordered', handleTaskReordered);
    socket.on('task-updated', handleTaskUpdated);

    return () => {
      socket.off('task:reordered', handleTaskReordered);
      socket.off('task-updated', handleTaskUpdated);
    };
  }, [socket, selectedBoardId, queryClient]);

  // Mutations
  const createWorkspaceMutation = useMutation({
    mutationFn: workspaceApi.createWorkspace,
    onSuccess: (newWs) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSelectedWsId(newWs.id);
    },
  });

  const createBoardMutation = useMutation({
    mutationFn: (title: string) => boardApi.createBoard({ title, workspaceId: selectedWsId! }),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', selectedWsId] });
      setSelectedBoardId(newBoard.id);
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

  if (isLoadingWs) {
    return (
      <div className="min-h-screen bg-carbon-950 flex flex-col items-center justify-center text-carbon-400 space-y-3 font-mono">
        <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
        <span className="text-xs tracking-wider uppercase text-carbon-400">INITIALIZING_TELEMETRY...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation */}
      <Navbar
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={(ws) => setSelectedWsId(ws.id)}
        onOpenCreateWorkspace={() => setIsCreateWsOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          boards={boards}
          selectedBoardId={selectedBoardId}
          onSelectBoard={(id) => setSelectedBoardId(id)}
          onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
          members={members}
          onOpenInvite={() => setIsInviteOpen(true)}
        />

        {/* Main Board Area */}
        <main className="flex-1 flex flex-col bg-carbon-950 overflow-hidden bg-telemetry-grid">
          {/* Subheader: Board Title & Active Viewers Telemetry Presence */}
          {currentBoard ? (
            <div className="h-12 px-5 border-b border-carbon-800 flex items-center justify-between shrink-0 bg-carbon-900/90 font-mono">
              <div className="flex items-center space-x-3">
                <Kanban className="w-4 h-4 text-cyan-400" />
                <h2 className="font-display text-sm font-bold text-white tracking-wider uppercase">
                  {currentBoard.title}
                </h2>
                <span className="text-[10px] text-carbon-500 hidden sm:inline">
                  // ID_{currentBoard.id.slice(0, 8)}
                </span>
              </div>

              {/* Active presence indicators */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-[11px] text-carbon-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden md:inline uppercase text-[10px] text-carbon-500">OPERATORS_ACTIVE:</span>
                </div>
                <div className="flex -space-x-1 overflow-hidden">
                  {activeUsers.map((activeId, idx) => {
                    const memberMatch = members.find((m) => m.userId === activeId || m.user.id === activeId);
                    const name = memberMatch?.user.name || (activeId === user?.id ? user?.name : `Op ${idx + 1}`);
                    return (
                      <div
                        key={idx}
                        title={`${name} (Live on frequency)`}
                        className="w-6 h-6 bg-carbon-800 border border-carbon-700 text-[10px] text-cyan-300 flex items-center justify-center font-display font-bold uppercase shadow-sm ring-1 ring-cyan-500/40"
                      >
                        {name.charAt(0)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-12 px-5 border-b border-carbon-800 flex items-center text-xs text-carbon-500 font-mono">
              // NO_BOARD_SELECTED // INITIALIZE OR SELECT BOARD
            </div>
          )}

          {/* Kanban Board Columns Container */}
          <div className="flex-1 overflow-x-auto p-5">
            {!currentWorkspace ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 font-mono">
                <div className="w-14 h-14 bg-carbon-900 border border-carbon-800 text-cyan-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                  WORKSPACE REQUIRED
                </h3>
                <p className="text-xs text-carbon-400 max-w-sm mt-1">
                  Initialize your organization workspace to dispatch boards and invite operators.
                </p>
                <button
                  onClick={() => setIsCreateWsOpen(true)}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-carbon-950 text-xs font-bold uppercase tracking-wider transition"
                >
                  + CREATE WORKSPACE
                </button>
              </div>
            ) : !currentBoard ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 font-mono">
                <div className="w-14 h-14 bg-carbon-900 border border-carbon-800 text-carbon-400 flex items-center justify-center mb-4">
                  <Kanban className="w-6 h-6" />
                </div>
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                  DISPATCH BOARD EMPTY
                </h3>
                <p className="text-xs text-carbon-400 max-w-sm mt-1">
                  Create your first board to manage real-time tasks with synchronized lanes.
                </p>
                <button
                  onClick={() => setIsCreateBoardOpen(true)}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-carbon-950 text-xs font-bold uppercase tracking-wider transition"
                >
                  + INITIALIZE BOARD
                </button>
              </div>
            ) : isLoadingLists ? (
              <div className="h-full flex flex-col items-center justify-center text-carbon-500 font-mono space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-[11px] uppercase tracking-wider">SYNCING_LANES...</span>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex items-start space-x-4 h-full">
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
                    />
                  ))}

                  {/* Add New List (Lane) */}
                  <div className="w-80 shrink-0 font-mono">
                    {isAddingList ? (
                      <form
                        onSubmit={handleCreateList}
                        className="bg-carbon-900 border border-carbon-750 p-3 space-y-2 shadow-2xl"
                      >
                        <input
                          type="text"
                          placeholder="LANE NAME (E.G. IN REVIEW)..."
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          autoFocus
                          required
                          className="w-full bg-carbon-850 border border-carbon-700 px-3 py-1.5 text-xs text-white placeholder-carbon-500 focus:outline-none focus:border-cyan-500 uppercase"
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            type="submit"
                            disabled={createListMutation.isPending || !newListTitle.trim()}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-carbon-950 text-xs font-bold uppercase transition"
                          >
                            {createListMutation.isPending ? 'CREATING...' : '+ ADD LANE'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingList(false);
                              setNewListTitle('');
                            }}
                            className="px-3 py-1.5 text-xs text-carbon-400 hover:text-white transition uppercase"
                          >
                            CANCEL
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsAddingList(true)}
                        className="w-full py-3 px-4 bg-carbon-900/60 hover:bg-carbon-900 border border-dashed border-carbon-800 hover:border-carbon-700 text-xs font-bold text-carbon-500 hover:text-cyan-400 flex items-center justify-center space-x-2 transition uppercase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ ADD DISPATCH LANE</span>
                      </button>
                    )}
                  </div>
                </div>
              </DragDropContext>
            )}
          </div>
        </main>
      </div>

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
