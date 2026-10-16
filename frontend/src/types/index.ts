export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  role: Role;
  userId: string;
  workspaceId: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
}

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  members?: WorkspaceMember[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  dueDate?: string | null;
  listId: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  title: string;
  order: number;
  boardId: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  taskId?: string;
  boardId?: string;
  createdAt: string;
}
