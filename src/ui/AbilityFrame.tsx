import type { BoardPoint } from "./BoardSlots";

type AbilityFrameProps = {
  slot: BoardPoint;
  iconSrc: string;
  iconAlt: string;
};

const AbilityFrame = ({ slot, iconSrc, iconAlt }: AbilityFrameProps) => {
  return (
    <div className="ability-frame" style={{ left: slot.x, top: slot.y }}>
      <img className="ability-frame__icon" src={iconSrc} alt={iconAlt} />
      <img className="ability-frame__frame" src="/assets/ui/frames/ability-frame.png" alt="" />
    </div>
  );
};

export default AbilityFrame;
