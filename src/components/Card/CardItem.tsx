import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactElement } from "react";
import type { Card } from "../../services/types/models";
import styles from "./CardItem.module.css";

interface CardItemProps {
  card: Card;
  disabled?: boolean;
  onDelete: (cardId: string) => void;
}

export function CardItem({ card, disabled = false, onDelete }: CardItemProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: {
      type: "card",
      cardId: card.id,
      columnId: card.columnId
    },
    disabled
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article ref={setNodeRef} style={style} className={isDragging ? styles.dragging : styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>{card.title}</h4>
        <button type="button" className={styles.deleteButton} onClick={() => onDelete(card.id)}>
          Excluir
        </button>
      </div>

      {card.description ? <p className={styles.description}>{card.description}</p> : null}

      <button type="button" className={styles.dragHandle} {...attributes} {...listeners}>
        Arrastar
      </button>
    </article>
  );
}
