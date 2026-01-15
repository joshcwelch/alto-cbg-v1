import type { ScreenId } from "../shell/useScreenNav";

type MainMenuScreenProps = {
  onNavigate: (screen: ScreenId) => void;
};

const MainMenuScreen = ({ onNavigate }: MainMenuScreenProps) => {
  return (
    <div className="screen screen--menu">
      <div className="main-menu">
        <div className="main-menu__stage">
          <img
            className="main-menu__logo ui-art ui-art--screen"
            src="/ui/main-menu/main-menu_logo.png"
            alt="ALTO"
          />
          <div className="main-menu__buttons">
            <button className="menu-button menu-button--primary" onClick={() => onNavigate("board")}>
              <img className="menu-button__art ui-art ui-art--screen" src="/ui/main-menu/main-menu_primary-button.png" alt="" />
              <span>Play</span>
            </button>
            <button className="menu-button" onClick={() => onNavigate("collection")}>
              <img className="menu-button__art ui-art ui-art--screen" src="/ui/main-menu/main-menu_secondary-button.png" alt="" />
              <span>Collection</span>
            </button>
            <button className="menu-button" onClick={() => onNavigate("decks")}>
              <img className="menu-button__art ui-art ui-art--screen" src="/ui/main-menu/main-menu_secondary-button.png" alt="" />
              <span>Decks</span>
            </button>
            <button className="menu-button" onClick={() => onNavigate("profile")}>
              <img className="menu-button__art ui-art ui-art--screen" src="/ui/main-menu/main-menu_secondary-button.png" alt="" />
              <span>Profile</span>
            </button>
            <button className="menu-button" onClick={() => onNavigate("settings")}>
              <img className="menu-button__art ui-art ui-art--screen" src="/ui/main-menu/main-menu_secondary-button.png" alt="" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;
