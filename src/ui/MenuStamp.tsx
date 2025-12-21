import type { BoardPoint } from "./BoardSlots";

type MenuStampProps = {
  slot: BoardPoint;
  src: string;
  alt: string;
  width: number;
  height: number;
};

const MenuStamp = ({ slot, src, alt, width, height }: MenuStampProps) => {
  return (
    <img
      className="menu-stamp"
      src={src}
      alt={alt}
      style={{ left: slot.x, top: slot.y, width, height }}
    />
  );
};

export default MenuStamp;
