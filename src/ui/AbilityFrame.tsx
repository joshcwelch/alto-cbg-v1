import type { BoardPoint } from "./BoardSlots";

type AbilityFrameProps = {
  slot: BoardPoint;
  iconSrc: string;
  iconAlt: string;
};

const AbilityFrame = ({ slot, iconSrc, iconAlt }: AbilityFrameProps) => {
  return (
    <button className="ability-frame" type="button" style={{ left: slot.x, top: slot.y }}>
      <img className="ability-frame__icon" src={iconSrc} alt={iconAlt} draggable={false} />
      <img className="ability-frame__frame" src="/assets/ui/frames/ability-frame.png" alt="" draggable={false} />
      <span className="sr-only">{iconAlt}</span>
    </button>
  );
};

export default AbilityFrame;
