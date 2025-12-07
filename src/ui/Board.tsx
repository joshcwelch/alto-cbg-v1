import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import GameScene from "./GameScene";
import EndTurnButton from "./EndTurnButton";
import ManaBar from "./ManaBar";
import { useGameStore } from "../state/useGameStore";
import BoardBG from "./BoardBG";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <div className="board-shell" style={{ position: "relative", width: "100%", height: "100%" }}>
      <BoardBG />
      <div className="board-stage" style={{ position: "absolute", inset: 0 }}>
        <div className="board-canvas-frame" style={{ position: "absolute", inset: 0 }}>
          <Canvas shadows gl={{ alpha: true }} camera={{ position: [0, 0, 10], fov: 30 }}>
            <ambientLight intensity={0.65} />
            <directionalLight
              castShadow
              position={[6, 12, 8]}
              intensity={1.2}
              shadow-mapSize-height={2048}
              shadow-mapSize-width={2048}
              shadow-bias={-0.0002}
            />
            <directionalLight position={[-4, 9, -6]} intensity={0.55} />
            <pointLight position={[0, 6, 0]} intensity={0.3} distance={15} />
            <GameScene />
          </Canvas>
        </div>
      </div>
      <ManaBar />
      <EndTurnButton />
    </div>
  );
}
