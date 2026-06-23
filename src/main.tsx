import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CockpitPreview from "./CockpitPreview";
import LabPreview from "./lab/LabPreview";
import StudioApp from "./studio/StudioApp";
import "./styles/global.css";

// Isolated previews by hash; everything else is the live App.
const hash = typeof location !== "undefined" ? location.hash : "";
const view = hash.includes("studio") ? (
  <StudioApp />
) : hash.includes("lab") ? (
  <LabPreview />
) : hash.includes("cockpit") ? (
  <CockpitPreview />
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(<StrictMode>{view}</StrictMode>);
