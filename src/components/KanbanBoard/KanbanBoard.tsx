import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { BoardDetails, Card } from "../../services/types/models";
import { CardItem } from "../Card/CardItem";
import { Column } from "../Column/Column";
import styles from "./KanbanBoard.module.css";

interface KanbanBoardProps {
  board: BoardDetails | null;
  loading: boolean;
  disabled?: boolean;
  onCreateCard: (columnId: string, title: string, description?: string) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  onMoveCard: (cardId: string, newColumnId: string) => Promise<void>;
}

function extractId(rawId: string, prefix: "card-" | "column-"): string | null {
  return rawId.startsWith(prefix) ? rawId.replace(prefix, "") : null;
}

export function KanbanBoard({
  board,
  loading,
  disabled = false,
  onCreateCard,
  onDeleteCard,
  onMoveCard
}: KanbanBoardProps): ReactElement {
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const cardMap = useMemo(() => {
    if (!board) {
      return new Map<string, Card>();
    }

    return new Map(
      board.columns.flatMap((column) => column.cards.map((card) => [card.id, card] as const))
    );
  }, [board]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = extractId(String(event.active.id), "card-");
    if (!activeId) {
      return;
    }
    setActiveCard(cardMap.get(activeId) ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const cardId = extractId(String(event.active.id), "card-");
    if (!board || !event.over || !cardId) {
      return;
    }

    const overId = String(event.over.id);
    const overColumnId = extractId(overId, "column-");
    const overCardId = extractId(overId, "card-");

    let destinationColumnId: string | null = overColumnId;
    if (!destinationColumnId && overCardId) {
      destinationColumnId = cardMap.get(overCardId)?.columnId ?? null;
    }

    const sourceColumnId = cardMap.get(cardId)?.columnId ?? null;

    if (!destinationColumnId || !sourceColumnId || destinationColumnId === sourceColumnId) {
      return;
    }

    await onMoveCard(cardId, destinationColumnId);
  };

  if (loading) {
    return (
      <section className={styles.loadingContainer}>
        <div className={styles.columnSkeleton} />
        <div className={styles.columnSkeleton} />
        <div className={styles.columnSkeleton} />
      </section>
    );
  }

  if (!board) {
    return (
      <section className={styles.emptyContainer}>
        <h2>Nenhum board selecionado</h2>
        <p>Selecione um board na barra lateral para visualizar o Kanban.</p>
      </section>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <section className={styles.container}>
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            disabled={disabled}
            onCreateCard={onCreateCard}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </section>

      <DragOverlay>
        {activeCard ? <CardItem card={activeCard} onDelete={() => undefined} disabled /> : null}
      </DragOverlay>
    </DndContext>
  );
}
