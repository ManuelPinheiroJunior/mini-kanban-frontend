import type { ReactElement } from "react";
import { KanbanProvider } from "./context/KanbanContext";
import { HomePage } from "./pages/HomePage";

function App(): ReactElement {
  return (
    <KanbanProvider>
      <HomePage />
    </KanbanProvider>
  );
}

export default App;
