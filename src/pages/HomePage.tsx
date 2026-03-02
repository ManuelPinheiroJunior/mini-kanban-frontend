import { useEffect } from "react";
import type { ReactElement } from "react";
import { BoardList } from "../components/BoardList/BoardList";
import { KanbanBoard } from "../components/KanbanBoard/KanbanBoard";
import { useKanban } from "../hooks/useKanban";
import styles from "./HomePage.module.css";

export function HomePage(): ReactElement {
  const {
    boards,
    selectedBoardId,
    selectedBoard,
    loadingBoards,
    loadingBoardDetails,
    actionLoading,
    error,
    selectBoard,
    createCard,
    deleteCard,
    moveCard,
    clearError
  } = useKanban();

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(() => clearError(), 3000);
    return () => window.clearTimeout(timer);
  }, [error, clearError]);

  return (
    <div className={styles.layout}>
      <BoardList
        boards={boards}
        selectedBoardId={selectedBoardId}
        loading={loadingBoards}
        onSelectBoard={(boardId) => void selectBoard(boardId)}
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{selectedBoard?.name ?? "Mini Kanban"}</h1>
            <p className={styles.subtitle}>Drag and drop entre colunas para mover cards.</p>
          </div>
          {actionLoading ? <span className={styles.badge}>Sincronizando...</span> : null}
        </header>

        {error ? <div className={styles.error}>{error}</div> : null}

        <KanbanBoard
          board={selectedBoard}
          loading={loadingBoardDetails}
          disabled={actionLoading}
          onCreateCard={(columnId, title, description) =>
            createCard({
              columnId,
              title,
              description
            })
          }
          onDeleteCard={(cardId) => deleteCard(cardId)}
          onMoveCard={(cardId, newColumnId) => moveCard(cardId, newColumnId)}
        />
      </main>
    </div>
  );
}
