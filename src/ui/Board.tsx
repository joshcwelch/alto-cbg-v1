import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import GameScene from "./GameScene";
import EndTurnButton from "./EndTurnButton";
import ManaBar from "./ManaBar";
import { useGameStore } from "../state/useGameStore";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <div className="board-shell">
      <div className="board-stage">
        <div className="board-canvas-frame">
          <Canvas
            shadows
            camera={{ position: [0, 6, 11], fov: 50 }}
          >
            <color attach="background" args={["#0f1624"]} />
            <ambientLight intensity={0.6} />
            <directionalLight
              castShadow
              position={[4, 10, 6]}
              intensity={1}
              shadow-mapSize-height={2048}
              shadow-mapSize-width={2048}
              shadow-bias={-0.0002}
            />
            <spotLight
              position={[0, 10, 0]}
              angle={0.6}
              intensity={0.3}
              penumbra={0.3}
              castShadow
            />
            <GameScene />
          </Canvas>
        </div>
      </div>
      <ManaBar />
      <EndTurnButton />
    </div>
  );
}
