import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/vietnamese-700.css";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/be-vietnam-pro/latin-700.css";
import "katex/dist/katex.min.css";
import "./styles/index.css";
import { App } from "./app/App";
import { useUi } from "./stores/ui-store";
import { requestPersistentStorage } from "./lib/db";

void useUi.getState().hydrate();
void requestPersistentStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
