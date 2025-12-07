import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";
import BoardStage from "./BoardStage";
import Battlefield from "./Battlefield";
import Hand from "./Hand";
import UIHud from "./UIHud";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <BoardStage>
      <Battlefield />
      <Hand />
      <UIHud />
    </BoardStage>
  );
}
