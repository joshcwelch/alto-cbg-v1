import { useUIStore } from "../state/useUIStore";
import ArtSlot from "../components/ArtSlot";

const HeroProfileScene = () => {
  const setScene = useUIStore((state) => state.setScene);

  return (
    <div className="hero-profile-scene">
      <header className="hero-profile-header">
        <ArtSlot assetKey="heroProfileHeaderCrest" className="hero-profile-header__crest" alt="" />
        <h1>HERO PROFILE</h1>
        <ArtSlot
          assetKey="heroProfileHeaderCrest"
          className="hero-profile-header__crest hero-profile-header__crest--spacer"
          alt=""
        />
      </header>

      <div className="hero-profile-body">
        <div className="hero-profile-left">
          <section className="ui-panel hero-profile-left-panel">
            <div className="hero-profile-name-row">
              <ArtSlot assetKey="heroProfileNameIcon" className="hero-profile-name-icon" alt="" />
              <span className="hero-profile-name">STORMCALLER</span>
            </div>

            <div className="hero-profile-portrait">
              <div className="hero-profile-portrait__frame">
                <ArtSlot assetKey="heroProfilePortrait" className="hero-profile-portrait__image" alt="" />
                <div className="hero-profile-level-badge">25</div>
              </div>
            </div>

            <div className="hero-profile-actions">
              <button type="button" className="ui-button ui-button--primary">
                CHANGE HERO
              </button>
              <button type="button" className="ui-button ui-button--secondary">
                COSMETICS
              </button>
            </div>
          </section>
        </div>

        <div className="hero-profile-right">
          <div className="hero-profile-stat-list">
            <div className="hero-profile-stat-panel">
              <div className="hero-profile-stat-label">WINS</div>
              <div className="hero-profile-stat-value">135</div>
            </div>
            <div className="hero-profile-stat-panel">
              <div className="hero-profile-stat-label">RANK</div>
              <div className="hero-profile-stat-value hero-profile-stat-value--rank">Champion II</div>
            </div>
            <div className="hero-profile-stat-panel">
              <div className="hero-profile-stat-label">POWER</div>
              <div className="hero-profile-stat-value">405</div>
            </div>
          </div>

          <div className="hero-profile-summary">
            <div className="hero-profile-summary-item">
              <div className="hero-profile-summary-label">GAMES PLAYED</div>
              <div className="hero-profile-summary-value">307</div>
            </div>
            <div className="hero-profile-summary-item">
              <div className="hero-profile-summary-label">WIN RATE</div>
              <div className="hero-profile-summary-value">68%</div>
            </div>
            <div className="hero-profile-summary-item">
              <div className="hero-profile-summary-label">CARDS COLLECTED</div>
              <div className="hero-profile-summary-value">110 / 120</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="hero-profile-footer">
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("PROFILE")}>
          BACK
        </button>
      </footer>
    </div>
  );
};

export default HeroProfileScene;
