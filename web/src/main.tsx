import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";

/**
 * Componente: Reaproveitar / Isolar código
 * Propriedade: Uma informação enviada pra modificar um componente visual ou comportamental
 */

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
