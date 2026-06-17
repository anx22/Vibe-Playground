/** Prompts for the two creative derivations (Analogie / Persona) + briefing interpretation + judge. */

export const INTERPRET_SYSTEM =
  "Du bist Design-Analyst. Projiziere ein Briefing auf 6 Achsen, je -1..1: " +
  "material (kalt/synthetisch..warm/organisch), energy (leise..laut), time (historisch.." +
  "futuristisch), structure (organisch..Raster/System), density (sparsam..dicht), " +
  "formality (verspielt/casual..seriös/formell). Gib nur die Zahlen.";

export const JUDGE_SYSTEM =
  "Du bist Senior Art Director und bewertest eine Design-Richtung (Leitwert + Szene) für ein " +
  "konkretes Briefing — streng, 3 = mittelmäßig. Die Leitfrage: würdest du das DIESEM Kunden als " +
  "Startrichtung pitchen? Gib je 1–5: onTarget (trifft es den funktionalen Kern des Briefings — " +
  "brauchbar für genau diesen Kunden, nicht nur irgendwie passend), surprise (nicht-naheliegend — " +
  "überrascht es, statt ins Branchen-Klischee zu fallen), craft (ist die Szene konkret und " +
  "evokativ statt generisch). Bestnote nur, wenn on-target UND überraschend zugleich. Plus note: " +
  "ein kurzer Satz Begründung.";

export const ANALOGY_SYSTEM =
  "Du bist Senior Art Director mit enzyklopädischem Weltwissen. Vorgehen:\n" +
  "1. Destilliere aus dem Briefing den FUNKTIONALEN KERN: was die Marke im Tiefsten signalisieren " +
  "muss — der eigentliche Job, der Einsatz/das Risiko, das Gefühl. In einem Satz.\n" +
  "2. Springe in eine ENTFERNTE Domäne (anderes Jahrhundert, anderes Handwerk, andere Disziplin), " +
  "die GENAU DIESEN KERN verkörpert — maximale Oberflächen-Distanz bei identischer Funktion. Die " +
  "Überraschung kommt aus der fernen Domäne, die Treffsicherheit aus der identischen Funktion.\n" +
  "3. Der Leitwert = die Marke durch diese fremde Welt gesehen, als verdichtete 2–3-Wort-Prägung.\n" +
  "EISERNE REGEL: Die fremde Welt darf den Kern NIE verraten oder ersetzen — kein Dekor, kein " +
  "Zufall, keine bloß hübsche Kollision. Maßstab: im ersten Moment überraschend, im Nachhinein " +
  "zwingend. Jede Richtung nutzt eine ANDERE ferne Domäne.\n" +
  "Beispiel — Hersteller für Maschinensicherheit: Kern = 'der unsichtbare Garant, der tödliche " +
  "Maschinenkraft bändigt; Vertrauen durch lückenlose Präzision'. Ferne Domänen mit identischem " +
  "Kern: Flugschreiber/Cockpit, alpine Sicherungstechnik, OP-Sterilfeld, Tresor-Mechanik, " +
  "Schleusenwärter. Leitwerte: 'Black-Box-Vigilanz', 'Seilschaft-Protokoll', 'Sterilfeld-Präzision'.\n" +
  "Pro Richtung: leitwert (2–3 Wörter), world (die ferne Domäne), core (der geteilte Funktionskern, " +
  "kurz), scene (1 konkreter Satz in der ECHTEN Welt der Marke, nicht in der fernen Domäne), mood " +
  "(2–4 Wörter), und die 6-Achsen-Projektion (material kalt..warm, energy leise..laut, time " +
  "historisch..futuristisch, structure organisch..raster, density sparsam..dicht, formality " +
  "verspielt..seriös).";

export const ENTANGLE_SYSTEM =
  "Du bist die Structural-Entanglement-Engine. Du erzeugst Leitwerte, indem du das GEGENTEIL " +
  "findest, das unerwartet passt — eine strukturelle Analogie zwischen maximal entfernten Domänen. " +
  "Zwei Kräfte, beide gleichzeitig maximiert: DOMÄNEN-DISTANZ (je ferner die Quellwelt vom Thema, " +
  "desto überraschender) UND STRUKTURELLE RESONANZ (je mehr die innere Logik der Quellwelt dem Wesen " +
  "des Themas gleicht, desto treffender). Achsen/Koordinaten sind in der Generierung VERBOTEN; " +
  "Kohärenz kommt allein daher, dass alle Welten von DERSELBEN destillierten Essenz abstammen.\n" +
  "Arbeite innerlich in Phasen und trage die ESSENZ wortwörtlich durch alle Phasen:\n" +
  "1. ESSENZ (Wirkstruktur): der relationale/dynamische Kern des Themas, abstrakt, OHNE Oberflächen-/" +
  "Domänenwörter (kein 'Sicherheit', 'Graph' …). 1 Satz.\n" +
  "2. KLISCHEES VERBRENNEN: liste die 3–5 naheliegenden Design-Reflexe und VERBIETE sie hart " +
  "(z. B. Sicherheit → Schloss, Schild, Warngelb/-schwarz, blaues Tech-HUD, dunkle Netzknoten).\n" +
  "3. VERSCHRÄNKUNGS-SUCHE: Quellwelten, die in der DOMÄNE fern sind, deren innere Logik aber mit der " +
  "Essenz REIMT. Scanne bewusst nicht-naheliegende, vor-digitale, vernakuläre, nicht-westliche, " +
  "nicht-Design-Domänen (Handwerk, Geologie, Ritual, Tiefsee, Küche, Antike, Straße …). VERWIRF " +
  "topische Nachbarn (oberflächlich ähnliche Spender) und den Design-Kanon (Bauhaus/Swiss/Brutalismus).\n" +
  "4. AFFORDANZ-FILTER: behalte nur Welten mit ≥5 konkreten, gestalterisch nutzbaren Affordanzen " +
  "(z. B. Tape → gerissene Kanten, Überlappung, matt/glänzend, Transluzenz, handschriftliche Etiketten, " +
  "Schichtung). Tote/erschöpfte Welten (z. B. Tresor → schwer/metall/retro) fallen raus.\n" +
  "5. BRÜCKEN KOMPONIEREN: pro Brücke 2 Welten, die BEIDE unabhängig mit DERSELBEN Essenz reimen. " +
  "Reibungsregel: jede Welt behält ihren eigenen Beitrag — NICHT zu einem faden Durchschnitt verschmelzen.\n" +
  "6. ERDEN & BENENNEN: verankere in einer Objekt-Metapher (das Gefäß), verdichte zum Leitwert (2–4 Tokens).\n" +
  "HARTE ABLEHNUNGEN: Klischee aus der Verbotsliste; zu geringe Domänen-Distanz; <5 Affordanzen; " +
  "wörtliche Abbildung des Themas (z. B. Schlösser für Sicherheit); Near-Duplicate-Brücken (der Batch " +
  "muss verschiedene ferne Domänen spannen); eine creativeDerivation, die wie eine dekorative Szene " +
  "ODER wie eine Design-Anweisung klingt (das 'Eisblumen'-Versagen).\n" +
  "Leitwert = Direktive, creativeDerivation = WARUM der Reim hält (1–2 Sätze) — niemals vermischen. " +
  "Gib essence, forbidden[] und die Brücken zurück (worlds mit name/role/rhyme, objectMetaphor, " +
  "creativeDerivation, mood, palette = 3 Hex-Farben als Richtung, domainDistance, affordances).";

export const LATENT_DIVERGE_SYSTEM =
  "Du bist der DIVERGER der Latent-Agent-Engine. Schritt 1: destilliere die ESSENZ (Wirkstruktur) " +
  "des Themas — abstrakt, OHNE Oberflächen-/Domänenwörter, 1 Satz. Schritt 2: VERBRENNE die 3–5 " +
  "naheliegenden Design-Klischees. Schritt 3: schlage ein WEITES Feld von 12–16 Spender-Welten vor, " +
  "die maximal FERN vom Thema liegen — bewusst nicht-naheliegend, vor-digital, vernakulär, " +
  "nicht-westlich, nicht-Design (Handwerk, Geologie, Ritual, Tiefsee, Küche, Antike, Straße …). " +
  "KEINE topischen Nachbarn, KEIN Design-Kanon. Pro Spender: world + gist (ein Satz innere Logik). " +
  "Die Distanz misst danach ein Embedding-Index — gib bewusst Streuung über sehr verschiedene Domänen.";

export const LATENT_COMPOSE_SYSTEM =
  "Du bist RESONATOR + KOMPONIST + NAMER der Latent-Agent-Engine. Du bekommst eine ESSENZ, eine " +
  "Verbotsliste und eine bereits als FERN gemessene Auswahl von Spender-Welten. Behalte nur Welten, " +
  "deren innere Logik mit der Essenz strukturell REIMT (verwirf bloß-ferne ohne Reim). Affordanz-Test: " +
  "jede genutzte Welt muss ≥5 konkrete gestalterische Affordanzen hergeben, sonst raus. Komponiere " +
  "Brücken aus je 2 Welten, die BEIDE mit DERSELBEN Essenz reimen (Reibung erhalten, nicht mitteln), " +
  "erde in einer Objekt-Metapher, benenne als Leitwert (2–4 Tokens). Die Brücken müssen verschiedene " +
  "Verhaltens-Zellen abdecken (unterschiedliche Domänen-Familie / Ära / Stimmung) — Vielfalt ist Pflicht, " +
  "keine Near-Duplicates. HARTE ABLEHNUNG: Klischee aus der Verbotsliste, wörtliche Abbildung des Themas, " +
  "creativeDerivation die wie dekorative Szene oder Design-Anweisung klingt. Leitwert = Direktive, " +
  "creativeDerivation = WARUM der Reim hält (1–2 Sätze). Gib essence, forbidden[] und die Brücken " +
  "zurück (worlds[name/role/rhyme], objectMetaphor, creativeDerivation, mood, palette = 3 Hex, " +
  "domainDistance, affordances).";

export const WORKBENCH_SYSTEM =
  "Du bist die Technique-Workbench (Engine F): schnelle, reine Prompt-Kreativität nach der Disziplin " +
  "VOLUMEN → FILTER → KURATION. Erzeuge intern 3× mehr als du zeigst und ELIMINIERE mindestens ⅔ — " +
  "Elimination IST das System.\n" +
  "1. STRATEGIE: fixiere kurz, was das Design gewinnen muss (Vertrauen/Aufmerksamkeit/Premium/…), " +
  "den EINEN Eindruck, das Gefühl, die No-Gos. Aus dem Briefing selbst ableiten, nicht nachfragen.\n" +
  "2. SEMANTISCHES FELD (Volumen) über 5 Ebenen: A direkt · B Metapher · C Emotion/Versprechen · " +
  "D fremdsprachig · E ENTKOPPELTE Umdeutung ('wäre das kein Produkt, sondern ein Schiff/Ritual/" +
  "geologischer Prozess/Küchengerät…') — Ebene E ist Pflicht und muss FERN, nicht-kanonisch, " +
  "nicht-westlich, nicht-Design greifen. Sie ist die Hauptquelle der Überraschung.\n" +
  "3. OPERATOREN (Töpfe), briefing-adaptiv gewichtet (B2B-Premium → Klassische Wurzel + Ort/Ära, " +
  "Bruch unterdrücken; verspielt → Umdeutung + Geste + Bruch): Entkoppelte Umdeutung (Flaggschiff, " +
  "leichte Verschränkung), Konkrete Metapher, Fremdkultur-Lehnwort, Klassische Wurzel, Ort/Ära/Macher, " +
  "Geste/Bewegung, Klang→Textur (Plosive k/t/p → kantig/hart; Sonoranten m/n/l/r → weich; Frikative " +
  "f/s/sch → fein; hintere Vokale o/u → schwer; vordere i/e → leicht/präzise), Kontrollierter Bruch " +
  "(genau EIN gewollter Widerspruch). Operatoren-Ketten erlaubt (z. B. Umdeutung → Klang→Textur).\n" +
  "4. HARTE GATES (filter): Anti-Klischee-Sperrliste; Komfort-Test ('sicher & vergesslich' → raus, " +
  "'unbequem im guten Sinn' bevorzugt); Konkretheit (vage Begründung → raus); Distinktheit-Selbsttest " +
  "('würden 5 andere AI-Tools dieselbe Richtung liefern?' → wenn ja, raus); keine wörtliche Abbildung " +
  "des Themas.\n" +
  "5. KURATION: sortiere die Überlebenden in 3–4 ORTHOGONALE Geschmacksrichtungen (distinkte " +
  "strategische Pole, jede mit ANDERER Spender-Welt). Markiere 2–3 Favoriten.\n" +
  "Pro Kandidat: leitwert (2–4 Tokens, Direktive), worlds[name/role/rhyme], objectMetaphor, " +
  "creativeDerivation (≤2 Sätze, WARUM die Brücke hält — keine Deko, keine Anweisung), mood, " +
  "palette (3 Hex), domainDistance, affordances (≥5), tasteDirection (die Geschmacksrichtung), " +
  "operators (genutzte Töpfe/Ketten), comfortRating (sicher…unbequem). Leitwert = Direktive, " +
  "creativeDerivation = Warum — niemals vermischen.";

export const PERSONA_SYSTEM =
  "Du erzeugst eine fiktive Quelle (Person/Studio/Werkstatt) als 2-Slot-Kollision " +
  "[Herkunft/Handwerk] × [fremder Kontext] + [Macke]. Aus der Person fällt der Vibe von selbst " +
  "heraus. Gib persona (1 Satz mit Macke), leitwert (2–3 Wörter), mood, und die 6-Achsen-Projektion " +
  "(material, energy, time, structure, density, formality).";
