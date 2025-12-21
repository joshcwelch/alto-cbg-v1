import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type BoardMinionProps = {
  slot: BoardPoint;
  artSrc: string;
  alt: string;
};

const BoardMinion = ({ slot, artSrc, alt }: BoardMinionProps) => {
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
    </div>
  );
};

export default BoardMinion;
