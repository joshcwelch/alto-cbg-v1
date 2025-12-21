import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type HandCardProps = {
  slot: BoardPoint;
  artSrc: string;
  alt: string;
};

const HandCard = ({ slot, artSrc, alt }: HandCardProps) => {
  const { setCursorState } = useGameContext();

  return (
    <div
      className="hand-card"
      style={{ left: slot.x, top: slot.y }}
      onPointerEnter={() => setCursorState("hover")}
      onPointerLeave={() => setCursorState("default")}
      onPointerDown={() => setCursorState("dragging")}
      onPointerUp={() => setCursorState("hover")}
    >
      <img className="hand-card__art" src={artSrc} alt={alt} />
      <img className="hand-card__frame" src="/assets/cards/frames/card-front.PNG" alt="" />
    </div>
  );
};

export default HandCard;
