# KONZEPT.md — Vibe Playground

> Das lebende Konzept, verdichtet auf den aktuellen Stand. Detailspezifikationen der Engines:
> [`docs/engines/`](./docs/engines).

## Kernidee

Ein **Leitwert** benennt *das Gegenteil, das unerwartet passt*: die Wirkstruktur eines Briefings,
gesprungen in eine ferne Domäne, die sich strukturell mit ihr **reimt**. Beispiel — Maschinen-
sicherheit → *Black-Box-Vigilanz* (Flugschreiber). Überraschung kommt aus **Domänen-Distanz**,
Treffsicherheit aus **struktureller Resonanz**. Beide sind entkoppelt und werden gleichzeitig
maximiert — genau das löst „zielgenau **und** überraschend".

## Zwei eiserne Regeln

1. **Keine erfundenen Achsen in der Generierung.** Koordinaten plätten die Analogie und erzeugen
   Klischees. Kohärenz entsteht daraus, dass alle Welten von **einer destillierten Essenz** abstammen.
2. **Leitwert (Direktive) ≠ Herleitung (warum es trägt).** Nie vermischen — sonst leckt dekorative
   Prosa als vermeintliche Design-Anweisung ein (das *Eisblumen*-Versagen).

## Die Engines (vier kreative Herleitungen, ein Harness)

- **D · Verschränkung** — Essenz → Klischees verbrennen → ferne, reimende Welten → Affordanz-Test
  (≥5) → Brücke → benennen. Ein Pass, schnell.
- **E · Latent-Agent** — das LLM macht den Sprung, **echte Embeddings messen „fern"** (Perzentil-Rang).
  Tiefer, vernakulärer; der langsame Weg (Phase-2).
- **F · Werkbank** — Volumen → Filter → Kuration: weites Feld × Operatoren, 3× über-generieren / ⅔
  eliminieren, in orthogonale Geschmacksrichtungen clustern. Der schnellste Weg.
- **Persona** — eine fiktive Quelle, aus der der Vibe von selbst fällt.

Eine neue Methodik = ein Endpoint + eine Client-Funktion + ein `Source`-Eintrag. Bridge-Contract,
Karten-Mapping und Konstellation werden geteilt.

## Was die Engines abwehren (die LLM-Schwächen)

Klischee-Gravitation, Oberflächen-Matching (topische Nachbarn statt Struktur), Komfort-Bias,
Mode-Collapse, Kanon-Enge (Bauhaus/Swiss-Reflex), wörtliche Abbildung des Themas, „Justification
Theater". Gegenmaßnahmen sind in jeder Engine eingebaut (Klischees verbrennen, Distanz erzwingen,
Affordanz-Test, Eliminations-Quote, Distinktheit-Selbsttest). Details: `docs/engines/`.

## Interface & Steuerung

Die **Konstellation**: Leitidee im Zentrum, je Engine ein Cluster. Das einzige Steuer-Primitiv ist
der **Anker** (max 5) — angeheftete Gold-Bausteine ziehen die nächste Welle zu sich, das Zentrum
bleibt. Ein **LLM-Judge** (zielgenau × Überraschung × Handwerk) wählt je Cluster den stärksten aus;
der Mensch entscheidet final. Output ist ein fertiger Design-Brief-Prompt (Kopieren/Export).
