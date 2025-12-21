import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type BoardMinionProps = {
  slot: BoardPoint;
  artSrc: string;
  alt: string;
  attack?: number;
  health?: number;
};

const BoardMinion = ({ slot, artSrc, alt, attack = 2, health = 2 }: BoardMinionProps) => {
  const { setCursorState } = useGameContext();

  return (
    <div
      className="board-minion"
      style={{ left: slot.x, top: slot.y }}
      onPointerEnter={() => setCursorState("hover")}
      onPointerLeave={() => setCursorState("default")}
      onPointerDown={() => setCursorState("dragging")}
      onPointerUp={() => setCursorState("hover")}
    >
      <img className="board-minion__art" src={artSrc} alt={alt} />
      <img className="board-minion__frame" src="/assets/ui/frames/minion.png" alt="" />
      <div className="board-minion__stat board-minion__stat--attack">
        <img className="board-minion__stat-icon" src="/assets/ui/attack.PNG" alt="" />
        <span className="board-minion__stat-text">{attack}</span>
      </div>
      <div className="board-minion__stat board-minion__stat--health">
        <img className="board-minion__stat-icon" src="/assets/ui/health.PNG" alt="" />
        <span className="board-minion__stat-text">{health}</span>
      </div>
    </div>
  );
};

export default BoardMinion;
