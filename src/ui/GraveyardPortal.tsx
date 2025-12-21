import type { BoardPoint } from "./BoardSlots";

type GraveyardPortalProps = {
  center: BoardPoint;
};

const GraveyardPortal = ({ center }: GraveyardPortalProps) => {
  const width = 189;
  const height = 250;
  const left = Math.round(center.x - width / 2);
  const top = Math.round(center.y - height / 2);

  return (
    <img
      className="graveyard-portal"
      src="/assets/ui/graveyard-the-void.png"
      alt=""
      style={{ left, top }}
    />
  );
};

export default GraveyardPortal;
