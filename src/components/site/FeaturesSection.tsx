const FEATURES = [
  {
    title: "Deckbuilding",
    copy: "Craft luminous or void-infused strategies with modular hero cores and signature spells.",
    icon: "DK",
  },
  {
    title: "3-Lane Combat",
    copy: "Command flanks and center lines with tactical positioning, timing, and reactive plays.",
    icon: "3L",
  },
  {
    title: "Hero Cores",
    copy: "Swap cores to remix ultimates, passive blessings, and finishers for each champion.",
    icon: "HC",
  },
  {
    title: "Factions of Light & Void",
    copy: "Blend radiant Accord with chaotic Voidburst to forge hybrid decks and surprise counters.",
    icon: "FV",
  },
];

export default function FeaturesSection() {
  return (
    <section className="section" id="features">
      <div className="alto-container">
        <div className="section-header">
          <h2 className="section-title">Play the Alto Formula</h2>
          <p className="section-subtitle">
            Every duel is a cinematic clash of luminous strategy and void-born improvisation. Build, adapt, and outmaneuver in minutes.
          </p>
        </div>
        <div className="feature-grid">
          {FEATURES.map(feature => (
            <article key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-copy">{feature.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
