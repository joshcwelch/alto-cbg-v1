import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";
import GameRoot from "./GameRoot";
import Battlefield from "./Battlefield";
import Hand from "./Hand";
import UIHud from "./UIHud";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <GameRoot>
      <Battlefield />
      <Hand />
      <UIHud />
    </GameRoot>
  );
}
