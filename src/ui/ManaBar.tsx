import type { BoardPoint } from "./BoardSlots";

type ManaBarProps = {
  slot: BoardPoint;
};

const ManaBar = ({ slot }: ManaBarProps) => {
  return (
    <div className="mana-bar" style={{ left: slot.x, top: slot.y }}>
      {/* TODO: Add mana bar base + mana crystal assets from /public/assets when available. */}
    </div>
  );
};

export default ManaBar;
