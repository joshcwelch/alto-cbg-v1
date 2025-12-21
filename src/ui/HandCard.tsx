import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type HandCardProps = {
  slot: BoardPoint;
  artSrc: string;
  alt: string;
  rotation?: number;
  isDragging?: boolean;
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
};

const HandCard = ({
  slot,
  artSrc,
  alt,
  rotation = 0,
  isDragging = false,
  onDragStart,
}: HandCardProps) => {
  const { setCursorState } = useGameContext();

  return (
    <div
      className={`hand-card${isDragging ? " is-dragging" : ""}`}
      style={{ left: slot.x, top: slot.y, transform: `rotate(${rotation}deg)` }}
      onDragStart={(event) => event.preventDefault()}
      onPointerEnter={() => setCursorState("hover")}
      onPointerLeave={() => setCursorState("default")}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setCursorState("dragging");
        onDragStart?.(event);
      }}
      onPointerUp={() => setCursorState("hover")}
    >
      <img className="hand-card__art" src={artSrc} alt={alt} draggable={false} />
      <img className="hand-card__frame" src="/assets/cards/frames/card-front.PNG" alt="" draggable={false} />
    </div>
  );
};

export default HandCard;
