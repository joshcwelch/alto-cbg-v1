import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type BoardMinionProps = {
  slot: BoardPoint;
  artSrc: string;
  alt: string;
  attack?: number;
  health?: number;
  isTaunt?: boolean;
  isGhost?: boolean;
  isExhausted?: boolean;
  isPlayable?: boolean;
  isInactive?: boolean;
  isAttackVisual?: boolean;
  isPresentation?: boolean;
  presentationStyle?: React.CSSProperties;
  presentationClassName?: string;
  dataMinionId?: string;
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
  isTaunt = false,
  isGhost = false,
  isExhausted = false,
  isPlayable = false,
  isInactive = false,
  isAttackVisual = false,
  isPresentation = false,
  presentationStyle,
  presentationClassName,
  dataMinionId,
  onTargetStart,
  onTargetEnter,
  onTargetLeave,
}: BoardMinionProps) => {
  const { setCursorState } = useGameContext();

  return (
    <div
      className={`board-minion${isTaunt ? " is-taunt" : ""}${isGhost ? " is-ghost" : ""}${isExhausted ? " is-exhausted" : ""}${isPlayable ? " is-playable" : ""}${isInactive ? " is-inactive" : ""}${isAttackVisual ? " is-attack-visual" : ""}${presentationClassName ? ` ${presentationClassName}` : ""}`}
      style={{ left: slot.x, top: slot.y, pointerEvents: isPresentation ? "none" : undefined, ...presentationStyle }}
      data-minion-id={dataMinionId}
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
      {isTaunt && <div className="board-minion__taunt-shield" />}
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
