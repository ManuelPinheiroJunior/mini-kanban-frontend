import type { ReactElement } from "react";
import type { Board } from "../../services/types/models";
import styles from "./BoardList.module.css";

interface BoardListProps {
  boards: Board[];
  selectedBoardId: string | null;
  loading: boolean;
  onSelectBoard: (boardId: string) => void;
}

export function BoardList({
  boards,
  selectedBoardId,
  loading,
  onSelectBoard
}: BoardListProps): ReactElement {
  if (loading) {
    return (
      <aside className={styles.container}>
        <h2 className={styles.title}>Boards</h2>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </aside>
    );
  }

  return (
    <aside className={styles.container}>
      <h2 className={styles.title}>Boards</h2>

      {boards.length === 0 && <p className={styles.empty}>Nenhum board encontrado.</p>}

      <ul className={styles.list}>
        {boards.map((board) => (
          <li key={board.id}>
            <button
              type="button"
              className={board.id === selectedBoardId ? styles.activeButton : styles.button}
              onClick={() => onSelectBoard(board.id)}
            >
              {board.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
