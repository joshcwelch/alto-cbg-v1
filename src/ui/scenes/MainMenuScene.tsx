import { useUIStore } from "../state/useUIStore";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import ArtSlot from "../components/ArtSlot";

const MainMenuScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const resetPlayFlow = usePlayFlowStore((state) => state.resetAll);

  return (
    <div className="main-menu-scene">
      <header className="main-menu-header">
        <div className="main-menu-title">
          <p className="main-menu-title__eyebrow">Welcome back</p>
          <h1>Alto</h1>
        </div>
        <button
          type="button"
          className="main-menu-profile"
          onClick={() => setScene("PROFILE")}
        >
          <ArtSlot assetKey="mainMenuProfileAvatar" className="main-menu-profile__avatar" alt="" />
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
          onClick={() => setScene("QUESTS")}
        >
          <div className="main-menu-quests__title">Quests</div>
          <div className="main-menu-quests__detail">Daily &amp; weekly objectives</div>
          {/* TODO: Replace with quest list and reward indicators. */}
        </button>
        <div className="main-menu-hero">
          <ArtSlot assetKey="mainMenuHeroFeature" className="main-menu-hero__art" alt="" />
          <div className="main-menu-hero__content">
            <div className="main-menu-hero__title">Adventure Awaits</div>
            <div className="main-menu-hero__detail">Main menu feature art placeholder.</div>
            {/* TODO: Add hero art, vignette, and motion treatment. */}
          </div>
        </div>
      </div>

      <nav className="main-menu-nav">
        <div className="main-menu-nav__primary">
          <button
            type="button"
            className="ui-button ui-button--primary"
            onClick={() => {
              resetPlayFlow();
              setScene("WORLD_MAP");
            }}
          >
            Play
          </button>
          <button
            type="button"
            className="ui-button ui-button--secondary"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("collection:lastTab", "COLLECTION");
              }
              setScene("COLLECTION");
            }}
          >
            Collection
          </button>
          <button type="button" className="ui-button ui-button--secondary" onClick={() => setScene("STORE")}>
            Store
          </button>
          <button type="button" className="ui-button ui-button--secondary" onClick={() => setScene("OPTIONS")}>
            Options
          </button>
        </div>
        <button
          type="button"
          className="ui-button ui-button--ghost"
          onClick={() => {
            const confirmExit = window.confirm("Exit the game and return to the main menu?");
            if (confirmExit) {
              setScene("MAIN_MENU");
              // TODO: Hook into desktop exit flow when available.
            }
          }}
        >
          Exit
        </button>
      </nav>
    </div>
  );
};

export default MainMenuScene;
