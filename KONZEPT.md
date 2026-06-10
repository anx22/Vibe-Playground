# KONZEPT.md — Vibe Playground

> Lebendes Konzept-Dokument (Deutsch). Quelle der Wahrheit für das **Denkmodell**.
> `PROJECT.md` hält die stabilen Fakten, `DECISIONS.md` das Entscheidungs-Log — hier steht
> das ausführliche „Warum". Wenn Konzept und Build auseinanderlaufen, gewinnt dieses Dokument
> als Richtungsgeber (siehe §7: Stand der Umsetzung).

---

## 0. Ziel-Vision (das, was nicht verloren gehen darf)

**Der Leitwert ist die Magie. Der Rest ist optionale Individualisierung.**

Ein Leitwert ist **kein Label**, sondern ein **komprimierter Weltverweis** — ein Wort (oder Mini-Szene),
das beim LLM ein ganzes Feld an Konventionen auslöst. „Editorial" impliziert schon eine ganze
Schriftwelt, Papier, Satzregeln, Tonalität. Genau diese Auslöse-Dichte ist das Produkt.

Palette, Typo-Trio, Mood sind **co-generierte Beigaben** — sekundär. **Vibe is king** (E-024).
Kernjob: von einem **Briefing** (Idee / Produkt / Richtung) zu einer glaubwürdigen Design-Richtung,
schnell — das LLM orchestriert (E-026, E-014).

---

## 1. Das Erzeugungs-Problem: nicht-willkürlich

Der Fehler, den man vermeiden muss: **nicht in eine Liste benannter Stile kategorisieren**
(Brutalist, Editorial, Hightech …). Das überfittet, läuft trocken, und nach 30 Stück ist nichts mehr da.

Stattdessen: **einen Raum aus Achsen definieren.** Die benannten Stile sind dann nur **Regionen** in
diesem Raum — und zwischen ihnen liegen **unendlich viele Positionen ohne Namen**. Genau dort sitzt
die Vielfalt.

---

## 2. Vibe Space — die Achsen

Die Achsen, die die realen Beispiele auseinanderhalten:

| Achse | − | + |
|-------|---|---|
| **Material / Temperatur** | organisch-warm (Papier, Tinte, Handwerk) | synthetisch-kalt (Glas, Metall, Screen) |
| **Energie** | leise / zurückhaltend / minimal | laut / roh / maximal |
| **Zeit** | historisch (Letterpress, Swiss, Bauhaus) | futuristisch (Terminal, Neon, Neo-) |
| **Struktur** | Collage / organisch / Fläche | Raster / Linie / System |
| **Dichte** | sparsam | dicht |

„Brutalist", „softes Editorial", „graue Hightech-Linienwelt" sind nur **drei Punkte** in diesem Raum.
Du brauchst die Namen nicht — du brauchst nur **Positionen**.

---

## 3. Leitwert-Anatomie — die Kollision

Ein guter Leitwert ist **kein einzelner Punkt**. „Editorial-Tech-Atlas" sind **zwei kollidierende
Welten plus ein Objekt, das sie erdet**:

- **Heimatwelt** — z. B. Editorial → Papier, warm, Typo-getrieben
- **Intrusion** aus einer anderen Region — z. B. Tech → kalt, systematisch → **erzeugt die Spannung**
- **Objekt-/Format-Metapher** — Atlas, Notizbuch, Kartei, Dossier, Terminal, Zine → **macht das
  Abstrakte greifbar** (funktionales Grounding, E-025)

> Die Kreativität entsteht in der **Kollision**, nicht im einzelnen Stil.
> Ein reiner Stil ist ein **Preset**. Zwei kollidierende Welten sind ein **Vibe**.

---

## 4. Kohärenz-Regel (der Filter gegen Willkür)

**Zwei Welten dürfen nur kollidieren, wenn sie mindestens eine Achse teilen.** Der geteilte Wert ist
die **Brücke**, die den Zusammenprall kohärent statt chaotisch macht.

- Editorial (warm, **leise**, historisch) × Tech (kalt, **leise**, futuristisch) → teilen *leise/
  zurückhaltend* → **Brücke**, kohärent.
- Editorial × Vaporwave (warm vs. kalt, leise vs. laut, historisch vs. retrofuturistisch) → teilen
  **nichts** → **Matsch**.

Das ist gleichzeitig die Kohärenz-Regel **und** der Filter gegen das Willkürliche.

---

## 5. Das Erzeugungs-Muster in einem Satz

> Wähle eine **Heimatregion** im Achsenraum, lass eine **zweite Region** eindringen, die **mindestens
> eine Achse** mit ihr teilt, **erde** die Spannung in einer **Objektmetapher** — und **benenne** das
> Ergebnis als Kompositum.

Das gibt Tausende stimmige Leitwerte — keiner zufällig, keiner überfittet.

---

## 6. Drei Engines — orthogonale Erkenntnisprinzipien

Bewusst auf **unterschiedlichen Erkenntnisprinzipien** gebaut, nicht drei Geschmacksrichtungen
derselben Idee. Die eine garantiert Kohärenz durch eine **Regel**, die zweite durch eine **Metrik**,
die dritte durch **narrative Konsistenz**. Das ist die Achse, auf der sie sich unterscheiden.

### Engine A — Kombinatorische Grammatik (Kohärenz durch Regel)

Der ausgebaute Achsen-Ansatz. Niedrigdimensionaler Raum (Material/Temperatur, Energie, Zeit, Struktur,
Dichte); an jede Region hängen **drei Vokabular-Pools**: Heimatwelten, Intrusionen, Objektmetaphern.
Der Generator zieht eine Heimatregion, eine Intrusion, die **≥1 Achse teilt**, und eine Objektmetapher,
deren Konnotation zur resultierenden Temperatur passt — dann komponiert er das Kompositum.

**Die Engine sitzt fast vollständig in der Struktur; das LLM rendert nur noch.**

- **Stärke:** vollständig kontrollierbar, debugbar; Diversität durch gleichmäßiges Absampeln des Raums
  erzwingbar; jeder Output erklärbar („entstand aus Region X × Y").
- **Schwäche:** handkuratierte Pools → **Neuheits-Decke**; nach einigen Hundert Generationen leicht
  templatehaft.
- Das ist die **Designer-Engine**: zuverlässig, aber endlicher Wortschatz. → das **Sicherheitsnetz**.

### Engine B — Latent-Space-Sampling (Kohärenz durch Metrik)

Übersetzt die diskrete Kohärenz-Regel („müssen ≥1 Achse teilen") in eine **kontinuierliche Größe** —
und macht sie damit mathematisch steuerbar. Eine LLM-Kette mit math. Filtern dazwischen:

1. **Seed-Expansion:** ein LLM generiert frei ein paar Hundert „Weltbegriffe" über alle Domänen —
   nicht von Hand kuratiert. Damit fällt die Neuheits-Decke von A weg.
2. **Vektorisierung:** jeder Begriff wird embedded (echte Embeddings oder vom LLM auf dieselben Achsen
   projiziert). Jede Welt = Punkt in einem entdeckten Raum.
3. **Kombination über Distanz** (Cosinus-Abstand d):
   - `d < 0.3` → zu ähnlich, langweilig (dieselbe Welt)
   - `0.4 ≤ d ≤ 0.7` → **Spannungsband**: kohärente Reibung
   - `d > 0.8` → Matsch
4. **Interpolation als Kreativitätsregler:** `v = λ·A + (1−λ)·B`, dann „benenne die Designwelt an
   Punkt v". λ ist der Schieberegler zwischen den beiden Welten.
5. **Novelty-Filter:** Set aller bisherigen Vektoren; ein Kandidat muss einen Mindestabstand τ zu allem
   Bisherigen haben (Farthest-Point-Sampling) → echte Spreizung über Tausende Generationen.

Prompt-Kern für Schritt 4:

> „Welt A ist [Begriff + Konnotation]. Welt B ist [Begriff + Konnotation]. Erzeuge die Designwelt, die
> zu 60 % bei A und 40 % bei B liegt. Gib genau zurück: ein 2–3-Wort-Kompositum (Leitwert), eine
> Objektmetapher, einen Satz Stimmung. Keine Erklärung."

- **Stärke:** skaliert unendlich, erweitert seinen Wortschatz selbst; das Spannungsband ist ein echter
  Tuning-Knopf (App-Slider „sicher ↔ experimentell" via Temperatur + d-Band).
- **Schwäche:** braucht Embeddings/Compute, weniger erklärbar, kippt bei falsch getuntem Band in
  Inkohärenz.

### Engine C — Simulierter Autor (Kohärenz durch Person)

Komplett anderes Paradigma: **keine ästhetischen Tokens manipulieren.** Stattdessen eine **fiktive
Quelle** generieren — ein Studio, einen Menschen, eine Werkstatt — und die Ästhetik als **Nebenprodukt**
herausfallen lassen.

> „Das Designstudio eines pensionierten Schweizer Kartografen, der jetzt Synthesizer-Module baut."
> „Eine Buchbinderei in Kyoto, die nur noch für Software-Firmen arbeitet."

Aus so einer Person folgt der gesamte Vibe von selbst: Typografie, Farben, Tiefe, Bewegung, sogar die
Tonalität der Microcopy — weil ein Mensch **intern konsistent** ist. Kohärenz wird hier nicht durch
Regel oder Metrik erzwungen, sondern dadurch, dass **LLMs menschliche Konsistenz extrem gut
modellieren**. Überraschung und Stimmigkeit gleichzeitig — weil keine echte Person willkürlich ist.

Generativ eine **2-Slot-Kollision auf Personen-Ebene**: `[Herkunft/Handwerk] × [fremder Auftraggeber/
Kontext] + [Lebensbruch oder Macke]`. Die **Macke** („baut jetzt Synth-Module") ist das **Pendant zur
Objektmetapher** in A — sie erdet und spezifiziert.

- **Stärke:** die überraschendsten, menschlich-wärmsten Ergebnisse; praktisch grenzenlos.
- **Schwäche:** am schwersten zu kontrollieren/reproduzieren; manche Personen erzeugen keinen klaren
  Vibe (Filterstufe nötig).

### Orthogonalität & Stacking

Die drei sind **echt orthogonal**: **Regel** (kontrollierbar, endlich), **Metrik** (skalierend,
abstrakt), **Simulation** (überraschend, schwer steuerbar). Sie **stapeln** sich:

> **Engine C** erzeugt den Seed → **Engine B** sorgt für Distanz/Novelty über viele Generationen →
> **Engine A** liefert das Achsen-Vokabular als **Sicherheitsnetz** gegen Matsch.

---

## 7. Stand der Umsetzung (Konzept ↔ Build)

> Ehrlicher Abgleich, damit die Vision nicht wieder verengt. Stand: erster Studio-Slice.

**Treu umgesetzt**
- Achsenraum statt Stil-Liste (§1–2) → `src/engine/axes.ts`, `pools.ts`, Pentagon.
- Kollisions-Anatomie + Bridge-Regel (§3–4) → `engineA.ts` (`sharedSigns`, Heimat × Intrusion → Objekt).
- Palette/Typo/Mood aus dem Achsen-Vektor abgeleitet, als **additive** Beigabe (E-027).

**Platzhalter / bewusste Verengung**
- Pools sind **klein und handkuratiert** (Neuheits-Decke, wie im Konzept beschrieben).
- **Der LLM-Render-Layer fehlt.** Engine A liefert aktuell nur das **Kompositum-Skelett**
  („Editorial-Tech-Atlas"), nicht den evokativen Render / die Szene. Laut §6-A soll „die Struktur
  vorschlagen, das LLM rendern" — dieser zweite Schritt ist noch nicht da (E-028).
- **Engine B und C existieren nicht** — nur als Registry-Platzhalter. Damit fehlt der eigentliche
  Skalierungs- und Überraschungs-Motor (das, was den endlichen Wortschatz von A sprengt).

**Konsequenz**
Der heutige Build ist das **Sicherheitsnetz (A) ohne seinen Render-Layer**. Die Magie der Vision lebt
im **LLM-Render** und in **B/C**. Der MVP-Loop (Explore → Steer → Iterate → Commit) ist damit als
Gerüst bewiesen — aber die Vision ist erst eingelöst, wenn der Render-Layer und mindestens eine
LLM-Engine (B oder C) live laufen.
