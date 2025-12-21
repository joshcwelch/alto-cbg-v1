import type { BoardPoint } from "./BoardSlots";

type ManaBarProps = {
  current: number;
  max: number;
};

const ManaBar = ({ current, max }: ManaBarProps) => {
  const maxCrystals = 10;
  const start = { x: 403, y: 510 };
  const end = { x: 983, y: 510 };
  const step = (end.x - start.x) / (maxCrystals - 1);
  const crystals = Array.from({ length: maxCrystals }, (_, index) => ({
    x: start.x + step * index,
    y: start.y,
  }));

  return (
    <div className="mana-bar">
      {crystals.map((point, index) => {
        const isActive = index < Math.min(current, max);
        return (
          <span
            key={`mana-${index}`}
            className={`mana-pip${isActive ? " is-active" : ""}`}
            style={{ left: point.x, top: point.y }}
          />
        );
      })}
      <span className="sr-only">
        Mana {current} / {max}
      </span>
    </div>
  );
};

export default ManaBar;
