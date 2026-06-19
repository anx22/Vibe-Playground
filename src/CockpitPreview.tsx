import "./styles/cockpit.css";

/**
 * STATIC visual preview of the new 3-zone cockpit (vibe-finding instrumentarium).
 * Mock data, no store, no LLM — rendered only on the #cockpit hash so the live
 * App/Board stay untouched while we agree the look. Throwaway until ported.
 */

type El = { layer: string; element: string };
type Card = {
  id: string; name: string; mood: string; src: "synthese" | "persona";
  pal: [string, string, string]; els: El[]; typo: string; layout: string; world: string; deriv: string;
};

const ACC: Record<Card["src"], string> = { synthese: "#CE82FF", persona: "#1CB0F6" };

const CARDS: Card[] = [
  {
    id: "a", name: "Brennofen-Glasur", mood: "kühl · wachsam", src: "synthese",
    pal: ["#e8804a", "#7a2e12", "#f4d3b0"], world: "Brennofen × Sicherheitslabor",
    deriv: "Beide leben von kontrollierter Hitze und einem Punkt, an dem nichts schiefgehen darf.",
    typo: "Schmale Grotesk mit keramischer Rundung (z. B. Söhne)",
    layout: "Enges Schamott-Raster, ein craquelé-Bruch als Akzent",
    els: [
      { layer: "Material", element: "Schamott-Glasur, matt mit feinen Haarrissen" },
      { layer: "Form", element: "Trichter-Silhouette des Ofenmauls" },
      { layer: "Layout", element: "enges Raster, von einem Riss durchbrochen" },
    ],
  },
  {
    id: "b", name: "Selvedge-Webkante", mood: "geerdet · präzise", src: "synthese",
    pal: ["#3b5bdb", "#16204a", "#c3d0f0"], world: "Webstuhl × Datenprotokoll",
    deriv: "Zeile um Zeile, jede Kante zählt — Stoff wie Logfile.",
    typo: "Mono mit Faden-Anmutung", layout: "linke rote Kante als feste Spalte",
    els: [
      { layer: "Material", element: "Selvedge-Denim, rote Fadenkante" },
      { layer: "Farbe", element: "Indigo-Verlauf, ausgewaschen" },
      { layer: "Bewegung", element: "laufende Webkante, Zeile um Zeile" },
    ],
  },
  {
    id: "c", name: "Trafohaus-Kupfer", mood: "ruhig · geladen", src: "synthese",
    pal: ["#b87333", "#2e2a22", "#e7d4b8"], world: "Umspannwerk × Keramik-Atelier",
    deriv: "Hohe Spannung, von Hand isoliert.", typo: "technische Grotesk, breit",
    layout: "Schaltplan-Gitter mit Knotenpunkten",
    els: [
      { layer: "Material", element: "oxidiertes Kupfer, grüne Patina" },
      { layer: "Form", element: "Keramik-Isolator, gestapelte Glocken" },
      { layer: "Layout", element: "Schaltplan-Gitter, klare Knoten" },
    ],
  },
  {
    id: "d", name: "Tidenhub-Schlick", mood: "weich · zyklisch", src: "persona",
    pal: ["#6b7a5a", "#262b1e", "#cdd2bf"], world: "Wattführer-Persona",
    deriv: "Eine Figur, die den Boden liest, den das Meer zweimal am Tag freigibt.",
    typo: "humanistische Serif, feucht-weich", layout: "horizontale Schichten wie Priele",
    els: [
      { layer: "Material", element: "nasser Schlick, spiegelnde Haut" },
      { layer: "Bewegung", element: "Gezeiten-Rhythmus, langsames Auf/Ab" },
      { layer: "Farbe", element: "Wattgrau-Grün, silbrige Lichter" },
    ],
  },
  {
    id: "e", name: "Sporenkapsel-Raster", mood: "fein · streuend", src: "persona",
    pal: ["#7b5cc0", "#241640", "#ddd0ef"], world: "Mykologen-Persona",
    deriv: "Alles ordnet sich radial, bereit loszulassen.", typo: "feine geometrische Sans",
    layout: "radiales Raster, das nach außen streut",
    els: [
      { layer: "Form", element: "Sporenkapsel, aufspringend" },
      { layer: "Anordnung", element: "radiales Raster, Streupunkte" },
      { layer: "Farbe", element: "Staub-Violett auf Cremegrund" },
    ],
  },
];

const Slider = ({ label, lo, hi, at }: { label: string; lo: string; hi: string; at: number }) => (
  <div className="ck-slider">
    <div className="ck-slider-label"><span>{lo}</span><b style={{ color: "var(--ink)" }}>{label}</b><span>{hi}</span></div>
    <div className="ck-track"><span className="ck-knob" style={{ left: `${at}%` }} /></div>
  </div>
);

export default function CockpitPreview() {
  const f = CARDS[0];
  return (
    <div className="ck">
      <div className="ck-top">
        <div className="ck-brand"><span className="ck-bdot" /> Vibe Playground</div>
        <div className="ck-top-right">
          <span className="ck-pill">★ Anker 2/5</span>
          <span className="ck-pill ck-pill--accent">Welle 1</span>
        </div>
      </div>

      <div className="ck-body">
        {/* LEFT — Steuerung */}
        <aside className="ck-zone ck-left">
          <div className="ck-block">
            <div className="ck-kicker">Leitidee</div>
            <div className="ck-brief-text">Sicherheitskomponenten für Industrieanlagen, ingenieursgetrieben</div>
          </div>

          <div className="ck-block">
            <div className="ck-kicker">Engines</div>
            <div className="ck-engine"><i style={{ background: ACC.synthese }} /> Synthese <span className="count">3</span></div>
            <div className="ck-engine"><i style={{ background: ACC.persona }} /> Persona <span className="count">2</span></div>
          </div>

          <div className="ck-block">
            <div className="ck-kicker">Globale Regler</div>
            <Slider label="Dichte" lo="sparsam" hi="dicht" at={62} />
            <Slider label="Temperatur" lo="kühl" hi="warm" at={40} />
            <Slider label="Energie" lo="leise" hi="laut" at={30} />
          </div>

          <div className="ck-block">
            <div className="ck-kicker">Anker 2/5</div>
            <div className="ck-anchors">
              <span className="ck-chip">Brennofen-Glasur</span>
              <span className="ck-chip">Trafohaus-Kupfer</span>
            </div>
          </div>

          <button className="ck-btn">Aus Ankern ableiten ↻</button>
        </aside>

        {/* MIDDLE — Feld */}
        <main className="ck-zone">
          <div className="ck-field-head">
            <div className="ck-field-title">Feld · 5 Richtungen</div>
            <span className="ck-pill ck-btn--ghost" style={{ padding: "5px 12px" }}>Iterieren ↻</span>
          </div>
          <div className="ck-grid">
            {CARDS.map((c) => (
              <div key={c.id} className={`ck-card${c.id === f.id ? " is-focus" : ""}`}>
                <div className="ck-card-pal">{c.pal.map((p, i) => <span key={i} style={{ background: p }} />)}</div>
                <div className="ck-card-body">
                  {c.id === f.id && <span className="ck-star">★</span>}
                  <div className="ck-card-name">{c.name}</div>
                  <div className="ck-card-mood">{c.mood}</div>
                  {c.els.map((e, i) => (
                    <div key={i} className="ck-el"><b>{e.layer}</b> {e.element}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT — Inspektor + Instrumente */}
        <aside className="ck-zone ck-right">
          <div>
            <div className="ck-insp-src">Synthese · {f.world}</div>
            <div className="ck-insp-name">{f.name}</div>
            <div className="ck-insp-mood">{f.mood}</div>
          </div>
          <div className="ck-pal-big">{f.pal.map((p, i) => <span key={i} style={{ background: p }} />)}</div>
          <div className="ck-deriv">{f.deriv}</div>

          <div className="ck-seclabel">Elemente aus dem Ergebnis</div>
          {f.els.map((e, i) => (
            <div key={i} className="ck-el-row"><b>{e.layer}</b><span>{e.element}</span></div>
          ))}
          <div className="ck-line"><b>Typo:</b> {f.typo}</div>
          <div className="ck-line"><b>Layout & Motion:</b> {f.layout}</div>

          <div className="ck-seclabel">Instrumente</div>
          <Slider label="Dichte" lo="sparsam" hi="dicht" at={62} />
          <Slider label="Temperatur" lo="kühl" hi="warm" at={40} />
          <input className="ck-dna" readOnly value="X trifft Y — z. B. Aesop trifft Bloomberg-Terminal" />
          <div className="ck-lens">
            <span className="ck-chip">Ära ▾</span>
            <span className="ck-chip">Material ▾</span>
            <span className="ck-chip">Imagery ▾</span>
          </div>
          <button className="ck-btn ck-btn--ghost">Inhalt kopieren ⤓</button>
        </aside>
      </div>
    </div>
  );
}
