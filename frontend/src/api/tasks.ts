import api from './client';
import type { Task, Comment, TaskActivity, ChecklistItem } from '../types';

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

  getTaskComments: async (taskId: string): Promise<Comment[]> => {
    const res = await api.get<{ comments: Comment[] }>(`/tasks/${taskId}/comments`);
    return res.data.comments;
  },

  createTaskComment: async (taskId: string, content: string): Promise<{ comment: Comment; activity: TaskActivity }> => {
    const res = await api.post<{ comment: Comment; activity: TaskActivity }>(`/tasks/${taskId}/comments`, { content });
    return res.data;
  },

  getTaskActivities: async (taskId: string): Promise<TaskActivity[]> => {
    const res = await api.get<{ activities: TaskActivity[] }>(`/tasks/${taskId}/activities`);
    return res.data.activities;
  },

  getTaskChecklist: async (taskId: string): Promise<ChecklistItem[]> => {
    const res = await api.get<{ checklist: ChecklistItem[] }>(`/tasks/${taskId}/checklist`);
    return res.data.checklist;
  },

  createChecklistItem: async (taskId: string, title: string): Promise<ChecklistItem> => {
    const res = await api.post<{ item: ChecklistItem }>(`/tasks/${taskId}/checklist`, { title });
    return res.data.item;
  },

  updateChecklistItem: async (taskId: string, itemId: string, data: { title?: string; isDone?: boolean }): Promise<ChecklistItem> => {
    const res = await api.patch<{ item: ChecklistItem }>(`/tasks/${taskId}/checklist/${itemId}`, data);
    return res.data.item;
  },

  deleteChecklistItem: async (taskId: string, itemId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/checklist/${itemId}`);
  },
};
