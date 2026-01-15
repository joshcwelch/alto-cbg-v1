import { ReactNode, useEffect, useMemo, useState } from "react";
import type { ScreenId } from "./useScreenNav";

type ScreenRouterProps = {
  screen: ScreenId;
  render: (screen: ScreenId) => ReactNode;
};

const TRANSITION_MS = 240;

const ScreenRouter = ({ screen, render }: ScreenRouterProps) => {
  const [active, setActive] = useState<ScreenId>(screen);
  const [previous, setPrevious] = useState<ScreenId | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (screen === active) return;
    setPrevious(active);
    setActive(screen);
    setIsAnimating(true);
    const timeout = window.setTimeout(() => {
      setPrevious(null);
      setIsAnimating(false);
    }, TRANSITION_MS);
    return () => window.clearTimeout(timeout);
  }, [screen, active]);

  const activeNode = useMemo(() => render(active), [active, render]);
  const previousNode = useMemo(() => (previous ? render(previous) : null), [previous, render]);

  return (
    <div className="screen-router">
      {previous && (
        <div className="screen-layer screen-layer--exit" aria-hidden="true">
          {previousNode}
        </div>
      )}
      <div
        className={`screen-layer ${isAnimating ? "screen-layer--enter" : "screen-layer--active"}`}
        aria-live="polite"
      >
        {activeNode}
      </div>
    </div>
  );
};

export default ScreenRouter;
