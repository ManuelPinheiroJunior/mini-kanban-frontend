import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { ReactElement, ReactNode } from "react";
import { boardService } from "../services/boardService";
import { cardService } from "../services/cardService";
import type { Board, BoardDetails } from "../services/types/models";

interface CreateCardInput {
  columnId: string;
  title: string;
  description?: string;
}

interface KanbanContextValue {
  boards: Board[];
  selectedBoardId: string | null;
  selectedBoard: BoardDetails | null;
  loadingBoards: boolean;
  loadingBoardDetails: boolean;
  actionLoading: boolean;
  error: string | null;
  loadBoards: () => Promise<void>;
  selectBoard: (boardId: string) => Promise<void>;
  createCard: (input: CreateCardInput) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, newColumnId: string) => Promise<void>;
  clearError: () => void;
}

const KanbanContext = createContext<KanbanContextValue | undefined>(undefined);

function updateBoardCard(
  board: BoardDetails,
  cardId: string,
  updater: (column: BoardDetails["columns"][number]) => BoardDetails["columns"][number]
): BoardDetails {
  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.cards.some((card) => card.id === cardId)) {
        return updater(column);
      }
      return column;
    })
  };
}

function moveCardInBoard(board: BoardDetails, cardId: string, newColumnId: string): BoardDetails {
  const sourceColumn = board.columns.find((column) => column.cards.some((card) => card.id === cardId));
  const targetColumn = board.columns.find((column) => column.id === newColumnId);

  if (!sourceColumn || !targetColumn) {
    return board;
  }

  const movedCard = sourceColumn.cards.find((card) => card.id === cardId);
  if (!movedCard) {
    return board;
  }

  const cardWithNextColumn = { ...movedCard, columnId: newColumnId };

  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.id === sourceColumn.id) {
        return {
          ...column,
          cards: column.cards.filter((card) => card.id !== cardId)
        };
      }

      if (column.id === targetColumn.id) {
        return {
          ...column,
          cards: [...column.cards, cardWithNextColumn]
        };
      }

      return column;
    })
  };
}

interface KanbanProviderProps {
  children: ReactNode;
}

export function KanbanProvider({ children }: KanbanProviderProps): ReactElement {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<BoardDetails | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingBoardDetails, setLoadingBoardDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadBoards = useCallback(async () => {
    setLoadingBoards(true);
    setError(null);

    try {
      const boardList = await boardService.list();
      setBoards(boardList);

      if (boardList.length > 0) {
        const boardId = selectedBoardId ?? boardList[0].id;
        setSelectedBoardId(boardId);
      } else {
        setSelectedBoardId(null);
        setSelectedBoard(null);
      }
    } catch {
      setError("Nao foi possivel carregar os boards.");
    } finally {
      setLoadingBoards(false);
    }
  }, [selectedBoardId]);

  const selectBoard = useCallback(async (boardId: string) => {
    setSelectedBoardId(boardId);
    setLoadingBoardDetails(true);
    setError(null);

    try {
      const board = await boardService.getById(boardId);
      setSelectedBoard(board);
    } catch {
      setError("Nao foi possivel carregar os detalhes do board.");
    } finally {
      setLoadingBoardDetails(false);
    }
  }, []);

  const createCard = useCallback(async (input: CreateCardInput) => {
    if (!selectedBoard) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const card = await cardService.create(input);
      const nextBoard = {
        ...selectedBoard,
        columns: selectedBoard.columns.map((column) =>
          column.id === input.columnId ? { ...column, cards: [...column.cards, card] } : column
        )
      };
      setSelectedBoard(nextBoard);
    } catch {
      setError("Nao foi possivel criar o card.");
    } finally {
      setActionLoading(false);
    }
  }, [selectedBoard]);

  const deleteCard = useCallback(async (cardId: string) => {
    if (!selectedBoard) {
      return;
    }

    const previousBoard = selectedBoard;
    const optimisticBoard = updateBoardCard(selectedBoard, cardId, (column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId)
    }));

    setSelectedBoard(optimisticBoard);
    setActionLoading(true);
    setError(null);

    try {
      await cardService.delete(cardId);
    } catch {
      setSelectedBoard(previousBoard);
      setError("Nao foi possivel excluir o card.");
    } finally {
      setActionLoading(false);
    }
  }, [selectedBoard]);

  const moveCard = useCallback(async (cardId: string, newColumnId: string) => {
    if (!selectedBoard) {
      return;
    }

    const previousBoard = selectedBoard;
    const optimisticBoard = moveCardInBoard(selectedBoard, cardId, newColumnId);
    setSelectedBoard(optimisticBoard);
    setActionLoading(true);
    setError(null);

    try {
      await cardService.move(cardId, { newColumnId });
    } catch {
      setSelectedBoard(previousBoard);
      setError("Nao foi possivel mover o card.");
    } finally {
      setActionLoading(false);
    }
  }, [selectedBoard]);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    if (!selectedBoardId) {
      return;
    }
    void selectBoard(selectedBoardId);
  }, [selectedBoardId, selectBoard]);

  const value = useMemo(
    () => ({
      boards,
      selectedBoardId,
      selectedBoard,
      loadingBoards,
      loadingBoardDetails,
      actionLoading,
      error,
      loadBoards,
      selectBoard,
      createCard,
      deleteCard,
      moveCard,
      clearError
    }),
    [
      boards,
      selectedBoardId,
      selectedBoard,
      loadingBoards,
      loadingBoardDetails,
      actionLoading,
      error,
      loadBoards,
      selectBoard,
      createCard,
      deleteCard,
      moveCard,
      clearError
    ]
  );

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
}

export function useKanbanContext(): KanbanContextValue {
  const context = useContext(KanbanContext);

  if (!context) {
    throw new Error("useKanbanContext deve ser usado dentro de KanbanProvider.");
  }

  return context;
}
