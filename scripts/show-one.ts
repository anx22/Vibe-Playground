import { readFileSync } from "node:fs";
import { clusterText, groupText } from "../src/export.js";

/** Shows, for ONE real eval result, the raw engine JSON vs. what the app's copy actually
 *  puts on your clipboard — the whole cluster (gesamt) and one group (gruppiert). No LLM. */

const all = JSON.parse(readFileSync("/tmp/eval-vibe.json", "utf8")) as any[];
const e = all[0];

// Build the VibeCard from the captured cluster fields, as the store would.
const card: any = {
  id: "demo",
  source: e.engine,
  leitwert: e.leitwert,
  weltSatz: e.weltSatz,
  register: e.register,
  metaphern: e.metaphern ?? [],
  materialien: e.materialien ?? [],
  bildVergleiche: e.bildVergleiche ?? [],
};

const line = (s: string) => console.log(s);
line("════════ 1) ROHES JSON — was die Engine erzeugt hat ════════");
line(JSON.stringify(e, null, 2));

line('\n\n════════ 2) GESAMT-COPY — was beim „Cluster kopieren" ankommt ════════');
line(clusterText(card));

line("\n\n════════ 3) GRUPPEN-COPY — z. B. nur die Materialien ════════");
line(groupText("Materialien", card.materialien));
