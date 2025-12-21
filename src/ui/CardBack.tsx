import type { BoardPoint } from "./BoardSlots";

type CardBackProps = {
  slot: BoardPoint;
};

const CardBack = ({ slot }: CardBackProps) => {
  return (
    <img
      className="card-back"
      src="/assets/cards/frames/card-back.PNG"
      alt=""
      style={{ left: slot.x, top: slot.y }}
    />
  );
};

export default CardBack;
