import api from './client';
import type { Workspace, WorkspaceMember } from '../types';

export const workspaceApi = {
  getUserWorkspaces: async (): Promise<Workspace[]> => {
    const res = await api.get<{ workspaces: Workspace[] }>('/workspaces');
    return res.data.workspaces;
  },

  createWorkspace: async (data: { name: string; description?: string }): Promise<Workspace> => {
    const res = await api.post<{ workspace: Workspace }>('/workspaces', data);
    return res.data.workspace;
  },

  getWorkspaceMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const res = await api.get<{ members: WorkspaceMember[] }>(`/workspaces/${workspaceId}/members`);
    return res.data.members;
  },

  createInvite: async (workspaceId: string, role: 'MEMBER' | 'ADMIN' = 'MEMBER'): Promise<{ inviteToken: string }> => {
    const res = await api.post<{ inviteToken: string }>(`/workspaces/${workspaceId}/invites`, { role });
    return res.data;
  },

  acceptInvite: async (token: string): Promise<{ workspace: Workspace }> => {
    const res = await api.post<{ message: string; workspace: Workspace }>('/workspaces/invites/accept', { token });
    return res.data;
  },
};
