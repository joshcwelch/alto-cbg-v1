import type { UIScene } from "../state/useUIStore";

// TODO: Deprecated. Replaced by UIScene-driven main menu layout in src/ui/scenes.

type MainMenuScreenProps = {
  onNavigate: (scene: UIScene) => void;
};

const MainMenuScreen = ({ onNavigate }: MainMenuScreenProps) => {
  return (
    <div className="screen screen--menu">
      <div className="main-menu-scene">
        <header className="main-menu-header">
          <div className="main-menu-title">
            <h1>Alto</h1>
          </div>
          <button type="button" className="main-menu-profile" onClick={() => onNavigate("PROFILE")}>
            <div className="main-menu-profile__avatar" aria-hidden="true" />
            <div className="main-menu-profile__details">
              <div className="main-menu-profile__name">Player One</div>
              <div className="main-menu-profile__currency">
                <span>Gold: 1,250</span>
                <span>Shards: 350</span>
              </div>
            </div>
          </button>
        </header>

        <div className="main-menu-body">
          <button
            type="button"
            className="main-menu-quests"
            onClick={() => window.alert("Quests panel coming soon.")}
          >
            <div className="main-menu-quests__title">Quests</div>
            <div className="main-menu-quests__detail">Daily &amp; weekly objectives</div>
          </button>
          <div className="main-menu-hero">
            <div className="main-menu-hero__content">
              <div className="main-menu-hero__title">Feature window</div>
              <div className="main-menu-hero__detail">Main menu feature art placeholder.</div>
            </div>
          </div>
        </div>

        <nav className="main-menu-nav">
          <div className="main-menu-nav__primary">
            <button type="button" className="ui-button ui-button--primary" onClick={() => onNavigate("MATCHMAKING")}>
              Play
            </button>
            <button type="button" className="ui-button ui-button--secondary" onClick={() => onNavigate("COLLECTION")}>
              Collection
            </button>
            <button type="button" className="ui-button ui-button--secondary" onClick={() => onNavigate("STORE")}>
              Store
            </button>
            <button type="button" className="ui-button ui-button--secondary" onClick={() => onNavigate("OPTIONS")}>
              Options
            </button>
          </div>
          <button
            type="button"
            className="ui-button ui-button--ghost main-menu-nav__exit"
            onClick={() => {
              const confirmExit = window.confirm("Exit the game and return to the main menu?");
              if (confirmExit) {
                onNavigate("MAIN_MENU");
                // TODO: Hook into desktop quit flow when available.
              }
            }}
          >
            Exit
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MainMenuScreen;
