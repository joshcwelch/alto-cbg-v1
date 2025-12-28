import type { BoardPoint } from "./BoardSlots";

type AbilityFrameProps = {
  slot: BoardPoint;
  iconSrc: string;
  iconAlt: string;
  onActivate?: () => void;
  isDisabled?: boolean;
  cost?: number;
};

const AbilityFrame = ({ slot, iconSrc, iconAlt, onActivate, isDisabled = false, cost }: AbilityFrameProps) => {
  return (
    <button
      className={`ability-frame${isDisabled ? " is-disabled" : " is-active"}`}
      type="button"
      style={{ left: slot.x, top: slot.y }}
      onClick={onActivate}
      disabled={isDisabled}
    >
      <img className="ability-frame__icon" src={iconSrc} alt={iconAlt} draggable={false} />
      <img className="ability-frame__frame" src="/assets/ui/frames/ability-frame.png" alt="" draggable={false} />
      {cost !== undefined && <span className="ability-frame__cost">{cost}</span>}
      <span className="sr-only">{iconAlt}</span>
    </button>
  );
};

export default AbilityFrame;
