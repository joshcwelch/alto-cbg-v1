import Panel from "../components/common/Panel";

const ProfileScreen = () => {
  return (
    <div className="screen screen--profile">
      <div className="hub-screen">
        <header className="hero-header">
          <img className="hero-header__frame" src="/ui/collection/hero-panel_frame.png" alt="" />
          <div className="hero-header__content">
            <img className="hero-header__portrait" src="/assets/heroes/tharos.png" alt="Tharos" />
            <div>
              <p className="hero-header__eyebrow">Sanctum</p>
              <h1>Profile</h1>
            </div>
          </div>
        </header>
        <div className="hub-grid">
          <Panel title="Overview" frameSrc="/ui/profile/profile-overview_panel.png">
            <p>Track your journey, ranks, and recent matches.</p>
          </Panel>
          <Panel title="Stats" frameSrc="/ui/profile/profile-stats_panel.png">
            <p>Win rate, favorite cards, and match history snapshot.</p>
          </Panel>
          <Panel title="Portrait" frameSrc="/ui/profile/player-portrait_frame.png">
            <p>Customize your hero portrait and title.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
