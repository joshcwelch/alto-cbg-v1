import { useEffect } from "react";
import UISceneRoot from "../scenes/UISceneRoot";
import AstraOverlayRoot from "../overlays/AstraOverlayRoot";
import { useUIStore } from "../state/useUIStore";

const AppShell = () => {
  const transitionActive = useUIStore((state) => state.transitionActive);
  const pendingScene = useUIStore((state) => state.pendingScene);
  const transitionKey = useUIStore((state) => state.transitionKey);
  const endTransition = useUIStore((state) => state.endTransition);

  useEffect(() => {
    if (!transitionActive || pendingScene) return;
    if (typeof window === "undefined" || typeof document === "undefined") {
      endTransition(transitionKey);
      return;
    }

    let canceled = false;

    const waitForImages = (root: HTMLElement) =>
      new Promise<void>((resolve) => {
        const images = Array.from(root.querySelectorAll("img"));
        if (images.length === 0) {
          resolve();
          return;
        }
        let remaining = images.length;
        const done = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
        };
        images.forEach((img) => {
          if (img.complete) {
            done();
            return;
          }
          const onLoad = () => {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onLoad);
            done();
          };
          img.addEventListener("load", onLoad);
          img.addEventListener("error", onLoad);
        });
      });

    const waitForLayout = () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });

    const run = async () => {
      const root = document.querySelector(".ui-safe-frame") as HTMLElement | null;
      if (root) {
        await waitForImages(root);
      }
      if (canceled) return;
      await waitForLayout();
      if (canceled) return;
      endTransition(transitionKey);
    };

    run();

    return () => {
      canceled = true;
    };
  }, [transitionActive, pendingScene, transitionKey, endTransition]);

  return (
    <div className="ui-shell">
      {/* TODO: Legacy screen navigation remains in src/ui/shell and src/ui/screens. */}
      <div className="ui-background" aria-hidden="true" />
      <div
        className={`ui-screen-fade${transitionActive ? " ui-screen-fade--visible" : ""}`}
        aria-hidden="true"
      >
        <div className="ui-screen-fade__label">Switching Menus</div>
      </div>
      <div className="ui-layer">
        <div className="ui-safe-frame">
          <UISceneRoot />
        </div>
        <AstraOverlayRoot />
      </div>
    </div>
  );
};

export default AppShell;
