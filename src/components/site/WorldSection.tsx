const LORE_POINTS = ["The Celestial Accord", "The Voidburst", "The War for the Crown"];

export default function WorldSection() {
  return (
    <section className="section" id="world">
      <div className="alto-container">
        <div className="section-header">
          <h2 className="section-title">A Realm Split by Radiance &amp; Ruin</h2>
          <p className="section-subtitle">
            The Accord forged peace through lightforged pacts, until the Voidburst carved open astral rifts. Now heroes rally to decide who
            claims the Crown in the coming age.
          </p>
        </div>
        <div className="world-strip">
          <div className="lore-items">
            {LORE_POINTS.map(point => (
              <div key={point} className="lore-card">
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
