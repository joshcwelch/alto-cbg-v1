type CommunitySectionProps = {
  onPlayClick?: () => void;
};

export default function CommunitySection({ onPlayClick }: CommunitySectionProps) {
  return (
    <section className="section community-section" id="community">
      <div className="alto-container">
        <div className="community-card">
          <h2 className="section-title" style={{ marginBottom: 6 }}>
            Forge with the community
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Join duels, theorycraft decks, and be first to test the in-browser client. Alto grows with every commander who enters the arena.
          </p>
          <div className="community-actions">
            <button className="btn btn-primary" onClick={onPlayClick}>
              Play In Browser
            </button>
            <button className="btn btn-ghost">Discord</button>
            <button className="btn btn-ghost">Twitter / X</button>
          </div>
          <div className="newsletter">
            <input type="email" placeholder="Newsletter - enter your email" aria-label="Newsletter signup placeholder" />
            <button className="btn btn-primary">Notify Me</button>
          </div>
        </div>
      </div>
    </section>
  );
}
