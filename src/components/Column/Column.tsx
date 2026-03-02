import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import type { Column as ColumnModel } from "../../services/types/models";
import { CardItem } from "../Card/CardItem";
import styles from "./Column.module.css";

interface ColumnProps {
  column: ColumnModel;
  disabled?: boolean;
  onCreateCard: (columnId: string, title: string, description?: string) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export function Column({
  column,
  disabled = false,
  onCreateCard,
  onDeleteCard
}: ColumnProps): ReactElement {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: "column",
      columnId: column.id
    }
  });

  const cardIds = column.cards.map((card) => `card-${card.id}`);

  const handleCreateCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }

    await onCreateCard(column.id, normalizedTitle, description.trim() || undefined);
    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  return (
    <section ref={setNodeRef} className={isOver ? styles.columnOver : styles.column}>
      <header className={styles.header}>
        <h3 className={styles.title}>{column.name}</h3>
        <span className={styles.count}>{column.cards.length}</span>
      </header>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className={styles.cards}>
          {column.cards.map((card) => (
            <CardItem key={card.id} card={card} disabled={disabled} onDelete={onDeleteCard} />
          ))}
        </div>
      </SortableContext>

      {showForm ? (
        <form className={styles.form} onSubmit={handleCreateCard}>
          <input
            className={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titulo do card"
            maxLength={120}
          />
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descricao (opcional)"
            rows={3}
          />
          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={disabled}>
              Salvar
            </button>
            <button type="button" className={styles.secondary} onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className={styles.addCardButton}
          onClick={() => setShowForm(true)}
          disabled={disabled}
        >
          + Add Card
        </button>
      )}
    </section>
  );
}
