# Mini-Kanban Frontend (React SPA)

SPA em React para consumir a API Mini-Kanban (boards, colunas e cards), com drag-and-drop entre colunas e atualizacao otimista de estado.

## Stack

- React + Vite + TypeScript
- Axios (service layer)
- Context API (estado global)
- `@dnd-kit` (drag-and-drop)
- CSS Modules

## Estrutura

```text
src/
 ├── components/
 │    ├── BoardList/
 │    ├── KanbanBoard/
 │    ├── Column/
 │    └── Card/
 ├── context/
 ├── hooks/
 ├── services/
 ├── pages/
 ├── styles/
 ├── App.tsx
 └── main.tsx
```

## Arquitetura

- `services/`: camada de integracao HTTP com backend.
  - `api.ts`: instancia Axios com `VITE_API_URL`.
  - `boardService.ts`, `columnService.ts`, `cardService.ts`: chamadas separadas por dominio.
- `context/KanbanContext.tsx`: fonte unica de estado da pagina Kanban.
  - guarda board selecionado, colunas/cards, loading e erros.
  - aplica atualizacao otimista para mover e excluir card.
- `components/`: UI separada por responsabilidade.
  - `BoardList`: selecao de board.
  - `KanbanBoard`: container do DnD.
  - `Column`: lista de cards + formulario de criacao.
  - `CardItem`: card arrastavel.
- `hooks/useKanban.ts`: acesso simplificado ao contexto.

## Variaveis de ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Configure:

```env
VITE_API_URL=https://mini-kanban-backend.vercel.app
```

## Como instalar

```bash
npm install
```

## Como rodar em desenvolvimento

```bash
npm run dev
```

Aplicacao por padrao em `http://localhost:5173`.

## Build de producao

```bash
npm run build
npm run preview
```

## Fluxo principal de dominio (mover card)

1. Usuario arrasta um card para outra coluna.
2. UI atualiza imediatamente (otimista) no Context.
3. Frontend chama `PATCH /cards/:id/move`.
4. Se falhar, estado anterior e restaurado e erro visual e exibido.

## Requisitos funcionais cobertos

- Listagem de boards
- Selecao de board
- Visualizacao de colunas e cards
- Criacao de card
- Exclusao de card
- Mover card entre colunas via drag-and-drop
- Loading, erro e feedback de sincronizacao
