import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type HandCardProps = {
  slot: BoardPoint;
  artSrc: string;
  alt: string;
  rotation?: number;
  isDragging?: boolean;
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onActivate?: () => void;
  name: string;
  text: string;
  cost: number;
  attack?: number;
  health?: number;
  type: "MINION" | "SPELL";
  hoverOffset?: { x: number; y: number };
  isPlayable?: boolean;
};

const HandCard = ({
  slot,
  artSrc,
  alt,
  rotation = 0,
  isDragging = false,
  onDragStart,
  onActivate,
  name,
  text,
  cost,
  attack,
  health,
  type,
  hoverOffset,
  isPlayable = false,
}: HandCardProps) => {
  const { setCursorState } = useGameContext();
  const nameLength = name.length;
  const nameSize =
    nameLength > 22 ? 8 : nameLength > 18 ? 9 : nameLength > 14 ? 10 : 11;
  const textLength = text.length;
  const textSize =
    textLength > 120 ? 7 : textLength > 90 ? 8 : textLength > 60 ? 9 : 10;

  return (
    <div
      className={`hand-card${isDragging ? " is-dragging" : ""}${isPlayable ? " is-playable" : ""}`}
      style={{
        left: slot.x,
        top: slot.y,
        ["--card-rot" as string]: `${rotation}deg`,
        ["--hover-x" as string]: `${hoverOffset?.x ?? 0}px`,
        ["--hover-y" as string]: `${hoverOffset?.y ?? 0}px`,
      }}
      onDragStart={(event) => event.preventDefault()}
      onPointerEnter={() => setCursorState("hover")}
      onPointerLeave={() => setCursorState("default")}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        if (onDragStart) {
          setCursorState("dragging");
          onDragStart(event);
        }
      }}
      onPointerUp={() => {
        setCursorState("hover");
        if (!isDragging) {
          onActivate?.();
        }
      }}
    >
      <span className="hand-card__glow" aria-hidden="true" />
      <img className="hand-card__art" src={artSrc} alt={alt} draggable={false} />
      <img
        className="hand-card__frame"
        src={
          type === "SPELL"
            ? "/assets/cards/frames/card-front-spell.PNG"
            : "/assets/cards/frames/card-front.PNG"
        }
        alt=""
        draggable={false}
      />
      <span className="hand-card__cost">{cost}</span>
      <span className="hand-card__name" style={{ fontSize: `${nameSize}px` }}>
        {name}
      </span>
      <span className="hand-card__text" style={{ fontSize: `${textSize}px` }}>
        {text}
      </span>
      {type === "MINION" && (
        <>
          <span className="hand-card__attack">{attack ?? 0}</span>
          <span className="hand-card__health">{health ?? 0}</span>
        </>
      )}
    </div>
  );
};

export default HandCard;
