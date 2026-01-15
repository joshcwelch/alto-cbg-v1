import { useEffect, useMemo, useState } from "react";
import ScreenRouter from "./ScreenRouter";
import type { ScreenId } from "./useScreenNav";
import { useScreenNav } from "./useScreenNav";
import LoadingScreen from "../screens/LoadingScreen";
import MainMenuScreen from "../screens/MainMenuScreen";
import BoardScreen from "../screens/BoardScreen";
import CollectionScreen from "../screens/CollectionScreen";
import DeckBuilderScreen from "../screens/DeckBuilderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";

const AppShell = () => {
  const nav = useScreenNav("loading");
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [showDevHint, setShowDevHint] = useState(false);

  const appBackground = useMemo(() => {
    switch (nav.current) {
      case "menu":
      case "loading":
        return "/ui/main-menu/main-menu_background.png";
      case "board":
        return "/assets/ui/global-bg.png";
      default:
        return "/assets/ui/global-bg.png";
    }
  }, [nav.current]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Backquote") {
        setShowDevHint((prev) => !prev);
        return;
      }
      if (event.key !== "Escape") return;
      if (showExitPrompt) {
        setShowExitPrompt(false);
        return;
      }
      if (nav.current === "board") {
        setShowExitPrompt(true);
        return;
      }
      if (nav.current !== "loading" && nav.canBack) {
        nav.back();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nav.current, nav.canBack, nav.back, showExitPrompt]);

  const handleNavigate = (screen: ScreenId) => {
    if (screen === nav.current) return;
    nav.push(screen);
  };

  const renderScreen = (screen: ScreenId) => {
    switch (screen) {
      case "loading":
        return <LoadingScreen onContinue={() => nav.replace(nav.storedScreen)} />;
      case "menu":
        return <MainMenuScreen onNavigate={handleNavigate} />;
      case "board":
        return <BoardScreen />;
      case "collection":
        return <CollectionScreen />;
      case "decks":
        return <DeckBuilderScreen />;
      case "profile":
        return <ProfileScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell" style={{ backgroundImage: `url("${appBackground}")` }}>
      <div className="app-shell__background" aria-hidden="true" />
      <header className="app-shell__nav">
        <img
          className="app-shell__nav-frame ui-frame ui-frame--multiply"
          src="/ui/global/navigation-header_frame.png"
          alt=""
        />
        <div className="app-shell__nav-items">
          <button className="nav-item" onClick={() => handleNavigate("menu")}>
            Main Menu
          </button>
          <button className="nav-item" onClick={() => handleNavigate("board")}>
            Play
          </button>
          <button className="nav-item" disabled>
            World Map (Soon)
          </button>
          <button className="nav-item" onClick={() => handleNavigate("collection")}>
            Collection
          </button>
          <button className="nav-item" onClick={() => handleNavigate("decks")}>
            Decks
          </button>
          <button className="nav-item" onClick={() => handleNavigate("profile")}>
            Profile
          </button>
          <button className="nav-item" onClick={() => handleNavigate("settings")}>
            Settings
          </button>
        </div>
      </header>
      <main className="app-shell__content">
        <ScreenRouter screen={nav.current} render={renderScreen} />
      </main>
      <footer className="app-shell__footer">ALTO pre-alpha build</footer>
      <Modal
        isOpen={showExitPrompt}
        onClose={() => setShowExitPrompt(false)}
        title="Exit Match?"
      >
        <p>Leave the match and return to the main menu?</p>
        <div className="ui-modal__actions">
          <Button variant="secondary" onClick={() => setShowExitPrompt(false)}>
            Stay
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowExitPrompt(false);
              nav.replace("menu");
            }}
          >
            Exit to Menu
          </Button>
        </div>
      </Modal>
      {showDevHint ? (
        <div className="dev-hint">
          <div>Screen: {nav.current}</div>
          <div>History: {nav.history.join(" → ")}</div>
        </div>
      ) : null}
    </div>
  );
};

export default AppShell;
