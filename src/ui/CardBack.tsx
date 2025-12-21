import type { BoardPoint } from "./BoardSlots";

type CardBackProps = {
  slot: BoardPoint;
  rotation?: number;
};

const CardBack = ({ slot, rotation = 0 }: CardBackProps) => {
  return (
    <img
      className="card-back"
      src="/assets/cards/frames/card-back.PNG"
      alt=""
      style={{ left: slot.x, top: slot.y, transform: `rotate(${rotation}deg)` }}
    />
  );
};

export default CardBack;
