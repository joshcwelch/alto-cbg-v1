import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUIStore } from "../state/useUIStore";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import ArtSlot from "../components/ArtSlot";

const MainMenuScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const resetPlayFlow = usePlayFlowStore((state) => state.resetAll);
  const [bgTarget, setBgTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    setBgTarget(document.querySelector(".ui-shell"));
    const safeFrame = document.querySelector(".ui-safe-frame");
    safeFrame?.classList.add("ui-safe-frame--mainmenu");

    return () => {
      safeFrame?.classList.remove("ui-safe-frame--mainmenu");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const baseW = 1920;
    const baseH = 1080;
    const root = document.documentElement;
    const updateScale = () => {
      const fit = Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
      const scale = Math.max(0.65, Math.min(1.25, fit));
      root.style.setProperty("--mm-structure-scale", String(scale));
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <>
      {bgTarget
        ? createPortal(
            <div className="mainmenu-root alto-menu--fx" aria-hidden="true">
              <div className="mainmenu-bg">
                <ArtSlot assetKey="mainMenuStoneStructure" className="mm-structure" alt="" />
              </div>
              <div className="mainmenu-fx mainmenu-fx--rays" />
              <div className="mainmenu-fx mainmenu-fx--dust" />
              <div className="mainmenu-fx mainmenu-fx--torch mainmenu-fx--torch-left" />
              <div className="mainmenu-fx mainmenu-fx--torch mainmenu-fx--torch-right" />
            </div>,
            bgTarget,
          )
        : null}
      <div className="main-menu-scene alto-menu alto-menu--polish">
        <button
          type="button"
          className="mainmenu__questsBadge"
          onClick={() => setScene("QUESTS")}
          aria-label="Open quests"
        >
          <ArtSlot assetKey="mainMenuQuestsBadge" className="ui-art" alt="" />
        </button>
        <button
          type="button"
          className="mainmenu__playerPanel"
          onClick={() => setScene("PROFILE")}
          aria-label="Open player profile"
        >
          <ArtSlot
            assetKey="mainMenuProfileAvatar"
            className="mainmenu__playerPanelAvatar mainmenu__playerPanelAvatar--behind"
            alt=""
          />
          <ArtSlot assetKey="mainMenuPlayerPanel" className="ui-art mainmenu__playerPanelFrame" alt="" />
          <div className="mainmenu__playerPanelContent">
            <div className="mainmenu__playerPanelDetails">
              <div className="mainmenu__playerPanelCurrency">
                <span className="mainmenu__playerPanelCurrencyGold">Gold: 1,250</span>
                <span className="mainmenu__playerPanelCurrencyShards">350</span>
              </div>
            </div>
          </div>
        </button>
        <header className="main-menu-header">
          <div className="main-menu-title">
          </div>
        </header>

        <div className="main-menu-body">
          <div className="main-menu-quests" />
          
        </div>

        <nav className="main-menu-nav">
          <div className="main-menu-nav__primary">
            <button
              type="button"
              className="main-menu-nav-button"
              onClick={() => {
                resetPlayFlow();
                setScene("WORLD_MAP");
              }}
            >
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">Play</span>
            </button>
            <button
              type="button"
              className="main-menu-nav-button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("collection:lastTab", "COLLECTION");
                }
                setScene("COLLECTION");
              }}
            >
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">Collection</span>
            </button>
            <button type="button" className="main-menu-nav-button" onClick={() => setScene("STORE")}>
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">Store</span>
            </button>
            <button type="button" className="main-menu-nav-button" onClick={() => setScene("OPTIONS")}>
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">Options</span>
            </button>
          </div>
          <button
            type="button"
            className="main-menu-nav-button main-menu-nav__exit"
            onClick={() => {
              const confirmExit = window.confirm("Exit the game and return to the main menu?");
              if (confirmExit) {
                setScene("MAIN_MENU");
                // TODO: Hook into desktop exit flow when available.
              }
            }}
          >
            <span className="main-menu-nav-button__art" aria-hidden="true">
              <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
              <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
            </span>
            <span className="main-menu-nav-button__label">Exit</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default MainMenuScene;
