import api from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data;
  },
};
