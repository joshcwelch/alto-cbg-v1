import type { CSSProperties } from "react";

type ManaBarProps = {
  current: number;
  max: number;
};

const maxCrystals = 10;
const start = { x: 404, y: 485 };
const end = { x: 984, y: 485 };
const step = (end.x - start.x) / (maxCrystals - 1);
const crystals = Array.from({ length: maxCrystals }, (_, index) => ({
  x: start.x + step * index,
  y: start.y,
  index,
}));

const ManaBar = ({ current, max }: ManaBarProps) => {
  const activeCount = Math.min(current, max);

  return (
    <div className="mana-bar">
      {crystals.map((point) => {
        const isInactive = point.index >= activeCount;
        return (
          <div
            key={`mana-${point.index}`}
            className={`mana-crystal${isInactive ? " is-inactive" : ""}`}
            style={{ left: point.x, top: point.y, ["--mana-index" as string]: point.index } as CSSProperties}
          >
            <span className="mana-crystal__bleed" />
            <span className="mana-crystal__base" />
            <span className="mana-crystal__energy" />
            <span className="mana-crystal__core" />
            <span className="mana-crystal__pulse" />
          </div>
        );
      })}
      <span className="sr-only">
        Mana {current} / {max}
      </span>
    </div>
  );
};

export default ManaBar;
