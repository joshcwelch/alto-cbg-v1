import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/drei";
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
            camera={{ position: [0, 4.5, 8], fov: 32 }}
            onCreated={({ camera }) => {
              camera.lookAt(0, 0, 0);
            }}
          >
            <color attach="background" args={["#0f1624"]} />
            <fog attach="fog" args={["#0a0f1e", 7, 20]} />
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
            <EffectComposer>
              <Bloom
                mipmapBlur
                intensity={0.35}
                radius={0.6}
                luminanceThreshold={0.5}
              />
            </EffectComposer>
          </Canvas>
        </div>
      </div>
      <ManaBar />
      <EndTurnButton />
    </div>
  );
}
