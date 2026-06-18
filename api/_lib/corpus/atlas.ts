/**
 * The Atlas (A1) — a curated seed of FAR donor worlds spanning the whole of human knowledge, each with
 * its inner logic (the structural "rhyme handle" an analogy can hook onto). It PULLS generation toward
 * distant, non-canonical domains. Lexically seeded from cross-domain web research (crafts · natural
 * processes · obsolete trades · industry/logistics · subcultures · instruments · myth/cosmology ·
 * speculative engineering · food · sound · body · architecture · language · sport) and curated for
 * structural richness. Deliberately AVOIDS the engines' already-burned canon (those live in the
 * Anti-Korpus). A starter, not a closed canon — grow it freely.
 */
export interface AtlasWorld {
  /** The donor world — concrete, nameable. */
  world: string;
  /** Its inner logic / dynamic — the relational structure it can rhyme with (never surface decoration). */
  gist: string;
  /** Knowledge region — used to sample a spread, so a pulled set spans far-apart domains. */
  region: string;
}

export const ATLAS: AtlasWorld[] = [
  // ── craft & material ──
  { world: "Ebru (türkisches Marmorieren)", gist: "Ordnung aus kontrolliertem Treiben — Pigment schwimmt, wird gekämmt, friert als Muster ein", region: "craft" },
  { world: "Tsugite (japanische Holzverbindung)", gist: "trägt ohne Nagel; Last wandert durch präzise ineinandergreifende Geometrie", region: "craft" },
  { world: "Raku-Brand", gist: "der Riss ist das Design — Schock-Abkühlung macht den Zufall zur Signatur", region: "craft" },
  { world: "Sital-Pati (Kühlmatte, Bengalen)", gist: "Material, das von sich aus kühlt; die Funktion in die Faser gewoben", region: "craft" },
  { world: "Navajo-Sandbild", gist: "ein Bild, das für seine Wirkung zerstört werden muss — Vergänglichkeit als Ritual", region: "craft" },
  { world: "Aso-Oke-Weberei (Yoruba)", gist: "Status im Faden codiert — Wert über Webdichte und Kantenführung", region: "craft" },

  // ── natural process ──
  { world: "Abalone-Perlmutt", gist: "bruchzäh durch Ziegel-Mörtel-Nanolagen; weich gebaut, hart im Verhalten", region: "nature" },
  { world: "Schleimpilz-Netz", gist: "rechnet ohne Hirn — findet kürzeste Wege, indem es erfolgreiche Pfade verstärkt", region: "nature" },
  { world: "Liesegang-Ringe", gist: "rhythmische Fällungsbänder — Selbstorganisation, die sich als Streifen ablagert", region: "nature" },
  { world: "Lichtenberg-Figur", gist: "der Blitz im Material eingefroren — Entladung, die als Baum verzweigt", region: "nature" },
  { world: "Bleijodid-Fällung", gist: "aus zwei klaren Flüssigkeiten fällt schlagartig leuchtendes Gelb — Verborgenes wird sichtbar", region: "nature" },

  // ── obsolete trade ──
  { world: "Weckklopfer (knocker-upper)", gist: "bezahlte Pünktlichkeit vor dem Wecker — Dienst als menschliche Infrastruktur", region: "trade" },
  { world: "Lektor der Zigarrenfabrik", gist: "eine Stimme synchronisiert hundert Hände — Erzählung als Taktgeber der Arbeit", region: "trade" },
  { world: "Flugzeug-Horcher (Schallspiegel)", gist: "Beton-Ohren, die den Himmel abtasten — Wahrnehmung lange vor der Sicht", region: "trade" },
  { world: "Blutegel-Sammler", gist: "der eigene Körper ist Köder und Werkzeug zugleich", region: "trade" },

  // ── industry & logistics ──
  { world: "Hochregal-Stapelkran", gist: "vertikales Archiv in ständiger Umsortierung — Dichte gegen Zugriffszeit", region: "industry" },
  { world: "AMR-Schwarm (fließbandlose Fabrik)", gist: "Ordnung entsteht aus vielen autonomen Wegen statt einer Linie", region: "industry" },
  { world: "Kanban / Just-in-Time", gist: "nichts auf Vorrat — Nachschub erst auf Signal, Pull statt Push", region: "industry" },

  // ── subculture ──
  { world: "Northern-Soul-Crate-Digging", gist: "Wert aus Seltenheit und Schweiß — die ganze Nacht für die eine rare Rille", region: "subculture" },
  { world: "Techwear", gist: "Kleidung als System — Membran, Tasche, Befestigung; Funktion zur Silhouette gemacht", region: "subculture" },
  { world: "Health-Goth", gist: "klinische Reinheit trifft Transhumanismus — Sport, Schwarz, Zukunft", region: "subculture" },

  // ── instrument & measurement ──
  { world: "Groma (römische Vermessung)", gist: "rechte Winkel aus Lot und Kreuz — eine Stadt aus Schnur und Schwerkraft", region: "instrument" },
  { world: "Kippsäulen-Seismograph", gist: "ein Pfeiler, der umfällt, wird zum Messwert — die Katastrophe als Datenpunkt", region: "instrument" },
  { world: "Fakhrī-Sextant", gist: "ein monumentaler Bogen misst das Jahr auf Sekunden — Präzision durch schiere Größe", region: "instrument" },

  // ── myth & cosmology ──
  { world: "Yoruba-Orisha", gist: "Kräfte der Natur als handelnde Personen; die Welt in drei Etagen", region: "myth" },
  { world: "Xibalba (Maya-Unterwelt)", gist: "Prüfungshäuser im Untergrund — der Abstieg als Bewährung", region: "myth" },
  { world: "Ainu-Kamuy", gist: "jedes Ding — Eule, Meer, Werkzeug — ein Gast-Gott; Beseelung des Gewöhnlichen", region: "myth" },
  { world: "Hindu-Kalpa", gist: "zyklische Zeit in Milliarden Jahren — Aufbau und Auflösung als Atem", region: "myth" },

  // ── science & speculative ──
  { world: "Metamaterial", gist: "Eigenschaften aus Geometrie statt Stoff — Verhalten gebaut, nicht gemischt", region: "science" },
  { world: "Molekulares Additive Manufacturing", gist: "Struktur bis aufs Nanoteil spezifiziert — Bauen wie Schreiben", region: "science" },
  { world: "Bioprinting (iPS-Zellen)", gist: "lebende Materie schichtweise gedruckt — Wachstum als Fertigung", region: "science" },
  { world: "Biomineralisation (Muschel-Methode)", gist: "Hartes bei Raumtemperatur züchten statt brennen", region: "science" },

  // ── food ──
  { world: "Fermentation", gist: "kontrollierter Verfall als Veredelung — Zeit und Mikrobe als Köche", region: "food" },
  { world: "Nixtamalisation", gist: "Mais in Lauge aufgeschlossen — chemische Vorverdauung macht Nährstoff verfügbar", region: "food" },

  // ── sound & notation ──
  { world: "Spektrogramm", gist: "Klang als sichtbare Schichtung von Frequenz über Zeit", region: "sound" },
  { world: "Change Ringing (Wechselläuten)", gist: "Permutationen als Klang — Mathematik im Glockenturm", region: "sound" },
  { world: "Trommelsprache", gist: "Sprache über Distanz ohne Wörter — nur Rhythmus und Tonhöhe", region: "sound" },

  // ── body & medicine ──
  { world: "Propriozeption", gist: "der Körper kennt seine Lage ohne hinzusehen — ein innerer Sinn ohne Bild", region: "body" },
  { world: "Vakzin-Kühlkette", gist: "Wirkung hängt an lückenloser Kälte — Wert, der nur in einem schmalen Korridor überlebt", region: "body" },

  // ── architecture ──
  { world: "Windturm (Badgir)", gist: "Klimaanlage ohne Strom — die Form fängt und kühlt den Wind", region: "architecture" },
  { world: "Termitenbau-Belüftung", gist: "passive Klimatisierung durch Kamin-Geometrie — der Bau atmet von selbst", region: "architecture" },

  // ── language & code ──
  { world: "Flaggen-Semaphor", gist: "Botschaft aus Körperhaltung — Bedeutung allein aus Winkel und Pose", region: "language" },
  { world: "Maritimes Signalflaggen-Alphabet", gist: "jede Flagge trägt Wort UND Bild — doppelte Codierung in einem Zeichen", region: "language" },

  // ── sport & game ──
  { world: "Free-Solo-Klettern", gist: "kein Sicherungsfehler erlaubt — Präzision unter absolutem Einsatz", region: "sport" },
  { world: "Curling", gist: "Reibung als Steuerung — Wischen verändert den Lauf des Steins nach dem Wurf", region: "sport" },
  { world: "Go (Umzingelungs-Spiel)", gist: "Territorium aus Einfluss statt Eroberung — Stärke entsteht aus Leere", region: "sport" },
];
