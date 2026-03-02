import { api } from "./api";
import type { Board, BoardDetails } from "./types/models";

export const boardService = {
  async list(): Promise<Board[]> {
    const { data } = await api.get<Board[]>("/boards");
    return data;
  },

  async getById(boardId: string): Promise<BoardDetails> {
    const { data } = await api.get<BoardDetails>(`/boards/${boardId}`);
    return data;
  },

  async create(name: string): Promise<Board> {
    const { data } = await api.post<Board>("/boards", { name });
    return data;
  }
};
