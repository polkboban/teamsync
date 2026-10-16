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
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center text-zinc-500 space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <span className="text-xs">Loading workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col overflow-hidden font-sans">
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
        <main className="flex-1 flex flex-col bg-canvas overflow-hidden">
          {/* Subheader: Board Title & Active Presence */}
          {currentBoard ? (
            <div className="h-11 px-5 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface-900/40">
              <div className="flex items-center space-x-2.5">
                <Kanban className="w-4 h-4 text-zinc-400" />
                <h2 className="text-xs font-semibold text-white tracking-tight">
                  {currentBoard.title}
                </h2>
              </div>

              {/* Active presence indicators */}
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                  <span className="hidden sm:inline text-[11px] text-zinc-500">Active now:</span>
                </div>
                <div className="flex -space-x-1 overflow-hidden">
                  {activeUsers.map((activeId, idx) => {
                    const memberMatch = members.find((m) => m.userId === activeId || m.user.id === activeId);
                    const name = memberMatch?.user.name || (activeId === user?.id ? user?.name : `User ${idx + 1}`);
                    return (
                      <div
                        key={idx}
                        title={`${name} (Viewing board)`}
                        className="w-5 h-5 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-canvas text-[9px] text-white flex items-center justify-center font-medium uppercase shadow-sm"
                      >
                        {name.charAt(0)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-11 px-5 border-b border-border-subtle flex items-center text-xs text-zinc-500">
              Select or create a board to get started
            </div>
          )}

          {/* Kanban Board Columns Container */}
          <div className="flex-1 overflow-x-auto p-5">
            {!currentWorkspace ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-xl bg-surface-850 border border-border-subtle text-accent flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">Create your first workspace</h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Workspaces group your projects, boards, and team members together.
                </p>
                <button
                  onClick={() => setIsCreateWsOpen(true)}
                  className="mt-4 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-900 rounded-md text-xs font-medium transition shadow-sm"
                >
                  Create workspace
                </button>
              </div>
            ) : !currentBoard ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-xl bg-surface-850 border border-border-subtle text-zinc-400 flex items-center justify-center mb-3">
                  <Kanban className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">No board selected</h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Create a board to organize tasks with lists and drag-and-drop cards.
                </p>
                <button
                  onClick={() => setIsCreateBoardOpen(true)}
                  className="mt-4 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-900 rounded-md text-xs font-medium transition shadow-sm"
                >
                  Create board
                </button>
              </div>
            ) : isLoadingLists ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="text-xs">Loading cards...</span>
              </div>
            ) : (
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
                    />
                  ))}

                  {/* Add New List (Column) */}
                  <div className="w-72 shrink-0">
                    {isAddingList ? (
                      <form
                        onSubmit={handleCreateList}
                        className="bg-surface-900 border border-border-hover rounded-xl p-3 space-y-2 shadow-md"
                      >
                        <input
                          type="text"
                          placeholder="Column title (e.g. In Review)..."
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          autoFocus
                          required
                          className="w-full bg-surface-850 border border-border-subtle rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent/80 transition"
                        />
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="submit"
                            disabled={createListMutation.isPending || !newListTitle.trim()}
                            className="px-2.5 py-1 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 rounded text-xs font-medium transition shadow-sm"
                          >
                            {createListMutation.isPending ? 'Adding...' : 'Add list'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingList(false);
                              setNewListTitle('');
                            }}
                            className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsAddingList(true)}
                        className="w-full py-2.5 px-3 bg-surface-900/40 hover:bg-surface-900 border border-dashed border-border-subtle hover:border-border-hover rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center justify-center space-x-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add list</span>
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
