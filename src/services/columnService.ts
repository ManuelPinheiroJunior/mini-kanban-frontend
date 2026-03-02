import { api } from "./api";
import type { Column } from "./types/models";

interface CreateColumnInput {
  boardId: string;
  name: string;
}

export const columnService = {
  async create(input: CreateColumnInput): Promise<Column> {
    const { data } = await api.post<Column>(`/boards/${input.boardId}/columns`, {
      name: input.name
    });
    return data;
  }
};
