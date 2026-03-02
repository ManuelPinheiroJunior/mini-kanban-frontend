import { api } from "./api";
import type { Card, MoveCardPayload } from "./types/models";

interface CreateCardInput {
  columnId: string;
  title: string;
  description?: string;
}

interface UpdateCardInput {
  id: string;
  title: string;
  description?: string;
}

export const cardService = {
  async create(input: CreateCardInput): Promise<Card> {
    const { data } = await api.post<Card>(`/columns/${input.columnId}/cards`, {
      title: input.title,
      description: input.description
    });
    return data;
  },

  async update(input: UpdateCardInput): Promise<Card> {
    const { data } = await api.put<Card>(`/cards/${input.id}`, {
      title: input.title,
      description: input.description
    });
    return data;
  },

  async delete(cardId: string): Promise<void> {
    await api.delete(`/cards/${cardId}`);
  },

  async move(cardId: string, payload: MoveCardPayload): Promise<Card> {
    const { data } = await api.patch<Card>(`/cards/${cardId}/move`, payload);
    return data;
  }
};
