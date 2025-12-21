import type { BoardPoint } from "./BoardSlots";

type HeroSlotProps = {
  slot: BoardPoint;
  portraitSrc: string;
  frameSrc: string;
  alt: string;
  health?: number;
};

const HeroSlot = ({ slot, portraitSrc, frameSrc, alt, health = 30 }: HeroSlotProps) => {
  return (
    <div className="hero-slot" style={{ left: slot.x, top: slot.y }}>
      <img className="hero-slot__portrait" src={portraitSrc} alt={alt} />
      <img className="hero-slot__frame" src={frameSrc} alt="" />
      <div className="hero-slot__health">
        <img className="hero-slot__health-icon" src="/assets/ui/health.PNG" alt="" />
        <span className="hero-slot__health-text">{health}</span>
      </div>
    </div>
  );
};

export default HeroSlot;
