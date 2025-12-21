import type { BoardPoint } from "./BoardSlots";

type HeroSlotProps = {
  slot: BoardPoint;
  portraitSrc: string;
  frameSrc: string;
  alt: string;
  health?: number;
  onTargetEnter?: () => void;
  onTargetLeave?: () => void;
  onTargetStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
};

const HeroSlot = ({
  slot,
  portraitSrc,
  frameSrc,
  alt,
  health = 30,
  onTargetEnter,
  onTargetLeave,
  onTargetStart,
}: HeroSlotProps) => {
  return (
    <div
      className="hero-slot"
      style={{ left: slot.x, top: slot.y }}
      onPointerEnter={() => onTargetEnter?.()}
      onPointerLeave={() => onTargetLeave?.()}
      onPointerDown={(event) => onTargetStart?.(event)}
    >
      <img className="hero-slot__portrait" src={portraitSrc} alt={alt} draggable={false} />
      <img className="hero-slot__frame" src={frameSrc} alt="" draggable={false} />
      <div className="hero-slot__health">
        <img className="hero-slot__health-icon" src="/assets/ui/health.PNG" alt="" draggable={false} />
        <span className="hero-slot__health-text">{health}</span>
      </div>
    </div>
  );
};

export default HeroSlot;
