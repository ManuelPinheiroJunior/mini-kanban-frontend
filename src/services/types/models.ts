export interface Board {
  id: string;
  name: string;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  cards: Card[];
}

export interface BoardDetails {
  id: string;
  name: string;
  columns: Column[];
}

export interface MoveCardPayload {
  newColumnId: string;
}
