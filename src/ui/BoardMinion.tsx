import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type BoardMinionProps = {
  slot: BoardPoint;
  artSrc: string;
  alt: string;
  attack?: number;
  health?: number;
  isGhost?: boolean;
  isExhausted?: boolean;
  isAttackVisual?: boolean;
  onTargetStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onTargetEnter?: () => void;
  onTargetLeave?: () => void;
};

const BoardMinion = ({
  slot,
  artSrc,
  alt,
  attack = 2,
  health = 2,
  isGhost = false,
  isExhausted = false,
  isAttackVisual = false,
  onTargetStart,
  onTargetEnter,
  onTargetLeave,
}: BoardMinionProps) => {
  const { setCursorState } = useGameContext();

  return (
    <div
      className={`board-minion${isGhost ? " is-ghost" : ""}${isExhausted ? " is-exhausted" : ""}${isAttackVisual ? " is-attack-visual" : ""}`}
      style={{ left: slot.x, top: slot.y }}
      onPointerLeave={() => {
        if (isAttackVisual) return;
        setCursorState("default");
        onTargetLeave?.();
      }}
      onPointerDown={(event) => {
        if (isAttackVisual) return;
        setCursorState("dragging");
        onTargetStart?.(event);
      }}
      onPointerUp={() => {
        if (isAttackVisual) return;
        setCursorState("hover");
      }}
      onPointerEnter={() => {
        if (isAttackVisual) return;
        setCursorState("hover");
        onTargetEnter?.();
      }}
    >
      <img className="board-minion__art" src={artSrc} alt={alt} draggable={false} />
      <img className="board-minion__frame" src="/assets/ui/frames/minion.png" alt="" draggable={false} />
      {!isGhost && (
        <>
          <div className="board-minion__stat board-minion__stat--attack">
            <img className="board-minion__stat-icon" src="/assets/ui/attack.PNG" alt="" draggable={false} />
            <span className="board-minion__stat-text">{attack}</span>
          </div>
          <div className="board-minion__stat board-minion__stat--health">
            <img className="board-minion__stat-icon" src="/assets/ui/health.PNG" alt="" draggable={false} />
            <span className="board-minion__stat-text">{health}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default BoardMinion;
