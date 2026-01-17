import { useUIStore } from "../state/useUIStore";
import ArtSlot from "../components/ArtSlot";

const achievements = [
  { title: "Quest Master", progress: 0.7, value: "7 / 10" },
  { title: "Powerful Plays", progress: 0.4, value: "2 / 5" },
  { title: "Deck Collector", progress: 0.6, value: "12 / 20" },
  { title: "Alto's Command", progress: 0.9, value: "9 / 10" },
  { title: "Arena Favorite", progress: 0.3, value: "3 / 10" },
];

const ProfileScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const heroLevel = 25;
  const levelProgress = 0.62;

  return (
    <div className="profile-scene">
      <header className="profile-header">
        <ArtSlot assetKey="profileHeaderCrest" className="profile-header__crest" alt="" />
        <h1>PROFILE</h1>
        <div className="profile-header__spacer" aria-hidden="true" />
      </header>

      <div className="profile-grid">
        <div className="profile-left">
          <section className="ui-panel profile-achievements">
            <div className="ui-panel__title">Achievements</div>
            <div className="profile-achievement-list">
              {achievements.map((achievement) => (
                <div className="profile-achievement" key={achievement.title}>
                  <ArtSlot assetKey="profileAchievementIcon" className="profile-achievement__icon" alt="" />
                  <div className="profile-achievement__content">
                    <div className="profile-achievement__title">{achievement.title}</div>
                    <div className="profile-achievement__progress">
                      <div className="profile-progress" aria-hidden="true">
                        <div
                          className="profile-progress__fill"
                          style={{ width: `${Math.round(achievement.progress * 100)}%` }}
                        />
                      </div>
                      <span className="profile-achievement__value">{achievement.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="profile-center">
          <button
            type="button"
            className="ui-panel profile-portrait-panel profile-portrait-link"
            onClick={() => setScene("HERO_PROFILE")}
          >
            <ArtSlot assetKey="profilePortrait" className="profile-portrait__image" alt="" />
            <div className="profile-nameplate">
              <div className="profile-hero-name">Stormcaller</div>
              <div className="profile-player-name">Joshua</div>
            </div>
          </button>

          <div className="profile-action-row">
            <button type="button" className="ui-button ui-button--primary">
              Skills
            </button>
            <button type="button" className="ui-button ui-button--secondary">
              Masques
            </button>
          </div>
        </div>

        <div className="profile-right">
          <section className="ui-panel profile-stats">
            <div className="ui-panel__title">Stats</div>
            <div className="profile-level">
              <div className="profile-level__badge">{heroLevel}</div>
              <div className="profile-level__details">
                <div className="profile-level__label">Hero Level</div>
                <div className="profile-progress" aria-hidden="true">
                  <div
                    className="profile-progress__fill"
                    style={{ width: `${Math.round(levelProgress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="profile-stat-grid">
              <div className="profile-stat">
                <div className="profile-stat__label">Win Count</div>
                <div className="profile-stat__value">343</div>
              </div>
              <div className="profile-stat profile-stat--rank">
                <div className="profile-stat__label">Highest Season Rank</div>
                <div className="profile-stat__value">Gold I</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat__label">Friends</div>
                <div className="profile-stat__value">27</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat__label">Matches Played</div>
                <div className="profile-stat__value">512</div>
              </div>
            </div>
            <div className="profile-ability-row">
              {["A1", "A2", "A3", "A4", "A5"].map((ability) => (
                <ArtSlot assetKey="profileAbilityIcon" className="profile-ability-icon" alt="" key={ability} />
              ))}
            </div>
            <div className="profile-stats__actions">
              <button type="button" className="ui-button ui-button--secondary">
                Customize
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className="profile-footer">
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("MAIN_MENU")}>
          BACK
        </button>
      </div>
    </div>
  );
};

export default ProfileScene;
