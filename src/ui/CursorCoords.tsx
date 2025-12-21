import { useGameContext } from "../GameRoot";

const CursorCoords = () => {
  const { cursor } = useGameContext();

  return (
    <div className="cursor-coords">
      <div className="cursor-coords__label">Cursor</div>
      <div className="cursor-coords__value">
        {Math.round(cursor.x)}, {Math.round(cursor.y)}
      </div>
    </div>
  );
};

export default CursorCoords;
