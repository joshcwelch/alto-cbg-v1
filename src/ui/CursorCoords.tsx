import { useGameContext } from "../GameRoot";

type CursorCoordsProps = {
  turn: "player" | "enemy";
  timeLeftMs: number;
  mana: number;
  manaMax: number;
};

const CursorCoords = ({ turn, timeLeftMs, mana, manaMax }: CursorCoordsProps) => {
  const { cursor } = useGameContext();
  const seconds = Math.max(0, Math.ceil(timeLeftMs / 1000));

  return (
    <div className="cursor-coords">
      <div className="cursor-coords__label">Cursor</div>
      <div className="cursor-coords__value">
        {Math.round(cursor.x)}, {Math.round(cursor.y)}
      </div>
      <div className="cursor-coords__label cursor-coords__label--secondary">Turn</div>
      <div className="cursor-coords__value">{turn}</div>
      <div className="cursor-coords__label cursor-coords__label--secondary">Timer</div>
      <div className="cursor-coords__value">{seconds}s</div>
      <div className="cursor-coords__label cursor-coords__label--secondary">Mana</div>
      <div className="cursor-coords__value">
        {mana}/{manaMax}
      </div>
    </div>
  );
};

export default CursorCoords;
