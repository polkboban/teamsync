import api from './client';
import type { Board, List } from '../types';

export const boardApi = {
  getWorkspaceBoards: async (workspaceId: string): Promise<Board[]> => {
    const res = await api.get<{ boards: Board[] }>(`/boards/workspace/${workspaceId}`);
    return res.data.boards;
  },

  createBoard: async (data: { title: string; workspaceId: string }): Promise<Board> => {
    const res = await api.post<{ board: Board }>('/boards', data);
    return res.data.board;
  },

  getBoardLists: async (boardId: string): Promise<List[]> => {
    const res = await api.get<{ lists: List[] }>(`/lists/board/${boardId}`);
    return res.data.lists;
  },

  createList: async (data: { title: string; boardId: string }): Promise<List> => {
    const res = await api.post<{ list: List }>('/lists', data);
    return res.data.list;
  },
};
