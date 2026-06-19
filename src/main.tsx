import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CockpitPreview from "./CockpitPreview";
import "./styles/global.css";

// #cockpit renders the isolated static cockpit preview (mock data); everything else is the live App.
const isCockpit = typeof location !== "undefined" && location.hash.includes("cockpit");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isCockpit ? <CockpitPreview /> : <App />}
  </StrictMode>,
);
