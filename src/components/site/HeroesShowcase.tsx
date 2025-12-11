const HEROES = [
  { name: "Lyra", title: "Voidborn Oracle", tagline: "Bends reality with crystalline echoes.", accent: "void" },
  { name: "Tharos", title: "Ember Crown", tagline: "Calls solar lances to scorch the lanes.", accent: "light" },
  { name: "Arel", title: "Celestial Warden", tagline: "Shields allies with luminous wards.", accent: "light" },
  { name: "Nyx", title: "Shadow Diver", tagline: "Strikes from the breach between worlds.", accent: "void" },
];

export default function HeroesShowcase() {
  return (
    <section className="section heroes-section" id="heroes">
      <div className="alto-container">
        <div className="section-header">
          <h2 className="section-title">Heroes of the Accord &amp; the Void</h2>
          <p className="section-subtitle">
            Build around hero cores that redefine your deck. Swap ultimates, alter passives, and craft a signature win-condition.
          </p>
        </div>
        <div className="hero-rail" role="list">
          {HEROES.map(hero => (
            <article key={hero.name} className="hero-card" role="listitem">
              <div className="portrait-placeholder" aria-hidden="true" />
              <h3 className="hero-name">
                {hero.name}{" "}
                <span style={{ color: hero.accent === "light" ? "var(--alto-light)" : "var(--alto-accent)", fontSize: 13 }}>
                  [{hero.accent === "light" ? "LIGHT" : "VOID"}]
                </span>{" "}
                {hero.title}
              </h3>
              <p className="hero-tagline">{hero.tagline}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
