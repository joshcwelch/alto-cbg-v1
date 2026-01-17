import UISceneRoot from "../scenes/UISceneRoot";
import AstraOverlayRoot from "../overlays/AstraOverlayRoot";

const AppShell = () => {
  return (
    <div className="ui-shell">
      {/* TODO: Legacy screen navigation remains in src/ui/shell and src/ui/screens. */}
      <div className="ui-background" aria-hidden="true" />
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
