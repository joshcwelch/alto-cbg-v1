type HeroSectionProps = {
  onPlayClick?: () => void;
  onDownloadClick?: () => void;
  onNavigateHeroes?: () => void;
};

export default function HeroSection({ onPlayClick, onDownloadClick, onNavigateHeroes }: HeroSectionProps) {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-grid" />
      <div className="alto-container hero-inner">
        <div>
          <span className="eyebrow">ALTO // LIGHT VS VOID</span>
          <h1 className="hero-title">A Tactical Fantasy CCG Forged in Light &amp; Void.</h1>
          <p className="hero-kicker">
            Command radiant champions or voidborn prodigies across three contested lanes. Draft luminous relics, unleash void bursts,
            and claim the Crown in cinematic, fast-paced duels.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={onPlayClick}>
              Play In Browser
            </button>
            <button className="btn btn-ghost" onClick={onDownloadClick}>
              Download Client
            </button>
          </div>
          <div className="hero-badges">
            <span className="badge">Live Deckbuilder</span>
            <span className="badge">3-Lane Combat</span>
            <span className="badge">Hero Cores</span>
            <span className="badge">Factions of Light &amp; Void</span>
          </div>
          <div id="download" className="anchor-target" aria-hidden="true" />
        </div>
        <div className="hero-visual">
          <div className="orb" />
          <div className="void" />
          <div className="silhouette">
            <div className="glow-sweep" />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={onNavigateHeroes}>
            Meet the Heroes
          </button>
        </div>
      </div>
    </section>
  );
}
