# KONZEPT.md — Vibe Playground

> Das lebende Konzept, verdichtet auf den aktuellen Stand. Lebende Engine-Spezifikation:
> die Prompt-YAMLs in [`api/_lib/setup/`](./api/_lib/setup).

## Kernidee

Der Playground liefert **Denkanstöße, kein fertiges Design**. Aus einem Briefing fällt pro Ergebnis ein
roher **Denkanstoß-Cluster** — ein lebendiger **Welt-Satz** (Kopfkino), ein **Leitwert** (Anker/Titel) und
lose Trigger: **Funde**, **Materialien**, **Bild-Referenzen**. Dieses offene Welt-Material füttert eine
nachgelagerte Bild-/Design-KI, die daraus etwas Schönes baut. Wir übersetzen nichts in Layout, Typo,
Komposition oder Farbwerte.

Ein **Leitwert** ist die EINE committete Design-Richtung, kuratorisch verdichtet aus den Funden: ein
form-tragendes Kompositum mit Editorial-Freiheit — darf Finish und Anwendung benennen, DE oder EN
(z. B. *Letterpress-Seidenband*, *Holographic Letterpress Cards*, *Tidenhub-Terminal*). Er löst sofort
eine visuelle Welt aus.

## Adaptiv: nah & fern gemischt

Jede Engine liefert pro Runde **beide Register gemischt** — ohne Label, das Verhältnis adaptiv am Briefing
(Heritage → mehr nah, verspielt → mehr fern), mit Boden von mind. einem je Pol:

- **nah/premium** — bleibt in der eigenen Brief-Welt und holt dort das Schönste, Best-in-Class;
  etablierte schöne Konventionen erlaubt (Hochzeit → Leinen, gepresste Blumen, Letterpress).
- **fern/überraschend** — eine ferne, frische Welt/Kollision; volle Anti-Klischee-Schärfe.

Das löst „premium **und** überraschend": der Nutzer spürt den Mix selbst, statt ihn etikettiert zu bekommen.

## Die zwei Engines (ein Harness)

- **Synthese** — Kollision ZWEIER Welten: den Kern des Briefings spüren, nah-premium UND fern-reimende
  Welten finden; die Überraschung entsteht in der Lücke zwischen ihnen.
- **Persona** — die EINE kohärente Quelle: eine fiktive Quelle erfinden, aus deren Existenz eine ganze Welt
  (und ihr Cluster) von selbst fällt — alles gehört zusammen, die Kohärenz ist der Wert.

Eine neue Methodik = ein Endpoint + eine Client-Funktion + ein `Source`-Eintrag. Cluster-Contract,
Karten-Mapping und Feld werden geteilt. Die Prompts — die eigentliche Qualitäts-Stellschraube — liegen
komplett in den YAMLs (`api/_lib/setup/`), zusammengesetzt über `npm run setup`.

## Was die Engines abwehren

Klischee-Gravitation (im fernen Register), Oberflächen-Matching, Mode-Collapse, wörtliche Abbildung des
Themas, „Story statt Welt-Material". Gegenmaßnahmen sind in den geteilten Regeln eingebaut
(`cluster` · `mix` · `diversity` · `compass` · `render_probe`).

## Interface & Steuerung

Das **Feld**: Leitidee oben, je Engine ein Panel (Hero über Satelliten). Das einzige Steuer-Primitiv ist
der **Anker** (max 5) — angeheftete Gold-Cluster ziehen die nächste Welle zu sich. Ein **LLM-Judge**
(zielgenau × Überraschung × Handwerk × **Form-Substanz**) gatet auf den zwei Pflicht-Achsen (zielgenau +
Form-Substanz) und lässt Überraschung + Handwerk die Überlebenden ranken; ein Klick öffnet den vollen
Cluster, **dezent kopierbar** (einzeln / gruppiert / gesamt) plus ein komponierter **Welt-Prompt**.
