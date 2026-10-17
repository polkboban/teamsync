import api from './client';
import type { Task } from '../types';

export const taskApi = {
  createTask: async (data: { title: string; description?: string; listId: string }): Promise<Task> => {
    const res = await api.post<{ task: Task }>('/tasks', data);
    return res.data.task;
  },

  reorderTask: async (taskId: string, data: { listId: string; order: number }): Promise<Task> => {
    const res = await api.patch<{ task: Task }>(`/tasks/${taskId}/reorder`, data);
    return res.data.task;
  },

  assignTask: async (taskId: string, assigneeId: string | null): Promise<Task> => {
    const res = await api.patch<{ task: Task }>(`/tasks/${taskId}/assign`, { assigneeId });
    return res.data.task;
  },

  updateTask: async (taskId: string, data: { title?: string; description?: string }): Promise<Task> => {
    const res = await api.patch<{ task: Task }>(`/tasks/${taskId}`, data);
    return res.data.task;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};
