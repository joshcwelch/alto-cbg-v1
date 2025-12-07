import { useEffect, useMemo, type CSSProperties } from "react";
import { useGameStore } from "../state/useGameStore";
import GameRoot from "./GameRoot";
import GameScene from "./GameScene";
import Battlefield from "./Battlefield";
import Hand from "./Hand";
import UIHud from "./UIHud";
import { useAnchors } from "./boardAnchors";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);
  const anchors = useAnchors();

  const layoutVars = useMemo(() => ({
    "--slot-hand-enemy": `${anchors.enemyHand.height * 100}vh`,
    "--slot-board-enemy": `${anchors.enemyBoard.height * 100}vh`,
    "--slot-board-player": `${anchors.playerBoard.height * 100}vh`,
    "--slot-hand-player": `${anchors.playerHand.height * 100}vh`,
    "--slot-gap": `${anchors.slotGap * 100}vh`,
    "--board-gap": `${anchors.boardGap * 100}vh`,
    "--frame-padding-top": `${anchors.paddingTop * 100}vh`,
    "--frame-padding-bottom": `${anchors.paddingBottom * 100}vh`,
    "--safe-bottom-zone": `${anchors.safeBottomPx}px`
  }) as CSSProperties, [anchors]);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <GameRoot canvasContent={<GameScene />}>
      <div className="board-layout" style={layoutVars}>
        <div className="slot hand-enemy" />
        <div className="slot spacer" aria-hidden="true" />
        <div className="slot board-row">
          <Battlefield anchors={anchors} side="enemy" units={[]} />
        </div>
        <div className="slot spacer" aria-hidden="true" />
        <div className="slot board-row">
          <Battlefield anchors={anchors} side="player" />
        </div>
        <div className="slot spacer" aria-hidden="true" />
        <div className="slot hand-player">
          <Hand anchors={anchors} />
        </div>
      </div>
      <UIHud safeBottom={anchors.safeBottomPx} />
    </GameRoot>
  );
}
