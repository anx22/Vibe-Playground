import "./lab.css";
import { ClusterCard } from "./ClusterCard";
import { MOCK_CARDS } from "../preview";

/** Isolated component lab (#lab). Mock cluster cards, no store, no LLM — for designing the
 *  Denkanstoß-Cluster card piece by piece. */
export default function LabPreview() {
  return (
    <div className="lab">
      <div className="lab-head">Komponenten-Lab · Denkanstoß-Cluster — Titel, Welt-Satz, Listen, dezente Copy (Mock)</div>
      {MOCK_CARDS.map((c) => (
        <ClusterCard key={c.id} card={c} />
      ))}
    </div>
  );
}
