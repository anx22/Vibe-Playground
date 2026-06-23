import "./studio.css";
import "../lab/lab.css";
import { useEffect } from "react";
import { MAX_ANCHORS, useVibeStore } from "../store/useVibeStore";
import { Studio } from "./Studio";

/**
 * StudioApp — self-contained shell for the new methodology board, wired to the
 * real store. Isolated on #studio so the live App stays untouched. Loads the
 * mock cards when empty so it can be screenshotted without the LLM.
 */
export default function StudioApp() {
  const gen = useVibeStore((s) => s.generation);
  const anchors = useVibeStore((s) => s.anchors);
  const loading = useVibeStore((s) => s.loading);
  const iterate = useVibeStore((s) => s.iterate);

  useEffect(() => {
    if (useVibeStore.getState().cards.length === 0) {
      void import("../preview").then(({ MOCK_CARDS, MOCK_SEED }) =>
        useVibeStore.setState({ phase: "studio", seed: MOCK_SEED, cards: MOCK_CARDS, generation: 1, loading: false }),
      );
    }
  }, []);

  return (
    <div className="studio-app">
      <header className="studio-top">
        <div className="studio-brand"><span className="studio-bdot" /> Vibe Playground</div>
        <div className="studio-top-right">
          <span className="soft-tag">Welle {gen}</span>
          <span className="soft-tag">★ {anchors.length}/{MAX_ANCHORS}</span>
          <button className="studio-btn" onClick={() => iterate()} disabled={loading}>
            {anchors.length ? "Aus Ankern ableiten ↻" : "Iterieren ↻"}
          </button>
        </div>
      </header>
      <Studio />
    </div>
  );
}
