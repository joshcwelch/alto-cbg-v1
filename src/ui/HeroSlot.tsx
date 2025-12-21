import type { BoardPoint } from "./BoardSlots";

type HeroSlotProps = {
  slot: BoardPoint;
  portraitSrc: string;
  frameSrc: string;
  alt: string;
};

const HeroSlot = ({ slot, portraitSrc, frameSrc, alt }: HeroSlotProps) => {
  return (
    <div className="hero-slot" style={{ left: slot.x, top: slot.y }}>
      <img className="hero-slot__portrait" src={portraitSrc} alt={alt} />
      <img className="hero-slot__frame" src={frameSrc} alt="" />
    </div>
  );
};

export default HeroSlot;
