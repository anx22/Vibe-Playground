import { tokenId, type ShakerToken, type VibeCard } from "./engine";

/** Mock cluster cards so the canvas can be rendered + screenshotted without the live LLM (dev preview only). */

let n = 0;
const card = (
  source: string,
  register: "nah" | "fern",
  leitwert: string,
  weltSatz: string,
  funde: string[],
  materialien: string[],
  bildReferenzen: string[],
): VibeCard => ({
  id: `${source}-mock-${n++}`,
  source,
  leitwert,
  weltSatz,
  register,
  funde,
  materialien,
  bildReferenzen,
  quality: { onTarget: 4, surprise: 4, craft: 4, formSubstanz: 4, overall: 4, note: "" },
});

export const MOCK_SEED = "Einladung & Webseite für eine Hochzeit am Meer";

export const MOCK_CARDS: VibeCard[] = [
  card(
    "synthese", "nah", "Letterpress-Seidenband",
    "Eine cremeweiße Karte, in die der Druck tiefe Mulden presst; ein Seidenband liegt lose über Büttenpapier, das nach Leinen riecht.",
    ["geprägte Initialen, die man mit dem Finger ertastet", "ein Band, das im Seewind flattert", "Wachssiegel, noch warm"],
    ["Büttenpapier", "Seidenband", "Prägedruck-Mulde", "Leinen", "Siegelwachs"],
    ["wie ein gepresstes Herbarium aus Großmutters Buch", "wie ein Brief, der lange in einer Holzschatulle lag"],
  ),
  card(
    "synthese", "fern", "Tidenhub-Salzkruste",
    "Bei Ebbe liegt das Watt frei, eine Salzkruste glitzert auf dunklem Schlick, und die Priele zeichnen eine Karte, die zweimal am Tag neu entsteht.",
    ["Salzränder wie Höhenlinien", "das Knistern trocknender Kruste", "Spuren, die die nächste Flut verschluckt"],
    ["Salzkruste", "nasser Schlick", "gebleichtes Treibholz", "Muschelkalk"],
    ["wie eine Seekarte aus Salz und Schlick", "wie die Innenseite einer Austernschale"],
  ),
  card(
    "synthese", "nah", "Strandhafer-Leinen",
    "Heller Leinenstoff bewegt sich träge in der Mittagshitze, dazwischen blasse Halme von Strandhafer, die feine Schatten auf den Sand werfen.",
    ["Halme, die sich im Wind neigen", "Sonne durch lockeres Gewebe", "Sand in den Nähten"],
    ["rohes Leinen", "Strandhafer", "gebleichtes Tau", "Sandstein"],
    ["wie eine Düne kurz vor Sonnenuntergang", "wie ein offenes Sommerhaus-Fenster"],
  ),
  card(
    "synthese", "fern", "Leuchtturm-Optik",
    "Im Inneren der Linse bricht sich das Licht in hundert konzentrischen Ringen; Messing glänzt matt, und alles dreht sich langsam, geduldig, unbeirrbar.",
    ["Lichtfächer über schwarzem Wasser", "geschliffene Glasrippen", "ein Puls aus Licht alle zehn Sekunden"],
    ["geschliffenes Glas", "poliertes Messing", "Salzglas-Beschlag", "geöltes Holz"],
    ["wie das Innere einer Fresnel-Linse", "wie ein Uhrwerk aus Licht"],
  ),
  card(
    "synthese", "nah", "Austernschalen-Perlmutt",
    "Aufgeklappte Austernschalen auf zerstoßenem Eis, innen schimmernd in Perlmutt-Grau und blassem Rosé, daneben ein angelaufener Silberlöffel.",
    ["Perlmutt, das die Farbe wechselt", "kühler Glanz auf Eis", "ein Tropfen Zitrone"],
    ["Perlmutt", "angelaufenes Silber", "zerstoßenes Eis", "Schalenkalk"],
    ["wie das Innere einer Austernschale im Streiflicht", "wie ein Austernstand am frühen Morgen"],
  ),

  card(
    "persona", "nah", "Papeterie-Werkstatt",
    "In einer kleinen Werkstatt presst eine Meisterin getrocknete Strandblumen zwischen Büttenbögen; überall feiner Papierstaub und der Geruch von Leim.",
    ["Blüten, flachgepresst und durchscheinend", "Papierfasern im Gegenlicht", "die Spur eines Falzbeins"],
    ["Büttenpapier", "gepresste Strandnelken", "Knochenleim", "Leinenfaden"],
    ["wie ein botanisches Herbarium", "wie eine alte Druckwerkstatt im Morgenlicht"],
  ),
  card(
    "persona", "fern", "Tiefsee-Kartografin",
    "Eine Vermessungsdrohne tastet in völliger Dunkelheit den Meeresboden ab; biolumineszente Punkte blinken auf, und aus Echos entsteht langsam eine Karte.",
    ["Echolot-Linien wie Atemzüge", "Leuchtpunkte in der Schwärze", "Sediment, das herabrieselt"],
    ["mattes Titan", "biolumineszenter Schleim", "kalter Schlamm", "Glasfaser"],
    ["wie ein Sonar-Bild des Meeresbodens", "wie Sterne unter Wasser"],
  ),
  card(
    "persona", "nah", "Segelmacher-Werft",
    "In einer hellen Werfthalle liegt schweres Segeltuch ausgebreitet; ein alter Segelmacher zieht Garn durch die Kante, Tau hängt in großen Buchten von der Decke.",
    ["genähte Kanten, die Wind halten", "Tauwerk in ordentlichen Buchten", "Salzflecken auf Tuch"],
    ["schweres Segeltuch", "geteertes Tau", "Messing-Ösen", "Bienenwachs-Garn"],
    ["wie ein zusammengelegtes Großsegel", "wie eine Werkbank voller Spleißwerkzeug"],
  ),
];

/** A pre-filled Vibe-Shaker (morsels from a few mock cards) so the dev preview shows the full tray. */
const seed = (c: VibeCard, kind: ShakerToken["kind"], text: string): ShakerToken => ({
  id: tokenId(c.id, kind, text),
  cardId: c.id,
  kind,
  text,
});
export const MOCK_SHAKER: ShakerToken[] = [
  seed(MOCK_CARDS[0], "leitwert", MOCK_CARDS[0].leitwert),
  seed(MOCK_CARDS[0], "materialien", MOCK_CARDS[0].materialien[0]),
  seed(MOCK_CARDS[1], "funde", MOCK_CARDS[1].funde[0]),
  seed(MOCK_CARDS[3], "materialien", MOCK_CARDS[3].materialien[0]),
  seed(MOCK_CARDS[3], "bildReferenzen", MOCK_CARDS[3].bildReferenzen[0]),
];
