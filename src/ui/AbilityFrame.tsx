import type { BoardPoint } from "./BoardSlots";

type AbilityFrameProps = {
  slot: BoardPoint;
};

const AbilityFrame = ({ slot }: AbilityFrameProps) => {
  return (
    <img
      className="ability-frame"
      src="/assets/ui/frames/ability-frame.png"
      alt=""
      style={{ left: slot.x, top: slot.y }}
    />
  );
};

export default AbilityFrame;
