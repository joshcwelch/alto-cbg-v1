import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";
import Battlefield from "./Battlefield";
import Hand from "./Hand";
import ManaBar from "./ManaBar";
import EndTurnButton from "./EndTurnButton";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <div className="board-shell">
      <div className="board-stage">
        <div className="board-canvas-frame">
          <Battlefield />
        </div>
      </div>
      <Hand />
      <ManaBar />
      <EndTurnButton />
    </div>
  );
}
