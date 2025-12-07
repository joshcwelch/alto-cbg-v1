import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";
import GameRoot from "./GameRoot";
import GameScene from "./GameScene";
import UIHud from "./UIHud";
import { useAnchors } from "./boardAnchors";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);
  const anchors = useAnchors();

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <GameRoot canvasContent={<GameScene />}>
      <UIHud safeBottom={anchors.safeBottomPx} anchors={anchors} />
    </GameRoot>
  );
}
