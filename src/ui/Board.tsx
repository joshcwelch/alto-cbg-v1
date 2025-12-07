import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import GameScene from "./GameScene";
import EndTurnButton from "./EndTurnButton";
import ManaBar from "./ManaBar";
import { useGameStore } from "../state/useGameStore";
import BoardStage from "./BoardStage";
import Battlefield from "./Battlefield";
import Hand from "./Hand";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <BoardStage>
      <Canvas
        shadows
        orthographic
        gl={{ alpha: true }}
        dpr={[1, 2]}
        camera={{ zoom: 100, position: [0, 0, 10] }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <GameScene />
      </Canvas>
      <Battlefield />
      <Hand />
      <ManaBar />
      <EndTurnButton />
    </BoardStage>
  );
}
