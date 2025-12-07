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
    "--slot-hand-player": `${anchors.playerHand.height * 100}vh`,
    "--slot-board-lane": `${anchors.laneHeight * 100}vh`,
    "--slot-mid-gap": `${anchors.midGap * 100}vh`,
    "--slot-gap-tight": `${anchors.handBoardGap * 100}vh`,
    "--frame-padding-top": `${anchors.paddingTop * 100}vh`,
    "--frame-padding-bottom": `${anchors.paddingBottom * 100}vh`,
    "--safe-bottom-zone": `${anchors.safeBottomPx}px`,
    "--lane-scale-enemy": anchors.laneScale.enemy,
    "--lane-scale-player": anchors.laneScale.player
  }) as CSSProperties, [anchors]);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <GameRoot canvasContent={<GameScene />}>
      <div className="board-layout" style={layoutVars}>
        <div className="board-ambient" aria-hidden="true" />
        <div className="slot hand-enemy">
          <Hand anchors={anchors} side="enemy" />
        </div>
        <div className="slot spacer tight" aria-hidden="true" />
        <div className="slot board-row enemy-lane">
          <Battlefield anchors={anchors} side="enemy" units={[]} />
        </div>
        <div className="slot mid-gap" aria-hidden="true">
          <div className="midfield-glow" />
        </div>
        <div className="slot board-row player-lane">
          <Battlefield anchors={anchors} side="player" />
        </div>
        <div className="slot spacer tight" aria-hidden="true" />
        <div className="slot hand-player">
          <Hand anchors={anchors} side="player" />
        </div>
      </div>
      <UIHud safeBottom={anchors.safeBottomPx} anchors={anchors} />
    </GameRoot>
  );
}
