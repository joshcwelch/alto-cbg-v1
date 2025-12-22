import type { BoardPoint } from "./BoardSlots";

type GraveyardPortalProps = {
  center: BoardPoint;
};

export const GRAVEYARD_PORTAL_SIZE = {
  width: 151,
  height: 200,
};

const GraveyardPortal = ({ center }: GraveyardPortalProps) => {
  const { width, height } = GRAVEYARD_PORTAL_SIZE;
  const left = Math.round(center.x - width / 2);
  const top = Math.round(center.y - height / 2);

  return (
    <div className="graveyard-portal" style={{ left, top, width, height }}>
      <div className="graveyard-portal__vortex">
        <img
          className="graveyard-portal__vortex-img"
          src="/fx/graveyard/portal-vortex.png"
          alt=""
        />
      </div>
      <img className="graveyard-portal__frame" src="/fx/graveyard/portal-frame.png" alt="" />
    </div>
  );
};

export default GraveyardPortal;
