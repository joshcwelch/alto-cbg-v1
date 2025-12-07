import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { EffectComposer as ThreeEffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Vector2 } from "three";
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
            camera={{ position: [0, 5, 9], fov: 32 }}
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
            <PostProcessing />
          </Canvas>
        </div>
      </div>
      <ManaBar />
      <EndTurnButton />
    </div>
  );
}

function PostProcessing() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<ThreeEffectComposer>();

  useEffect(() => {
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new Vector2(size.width, size.height),
      0.35,
      0.6,
      0.5
    );

    const comp = new ThreeEffectComposer(gl);
    comp.addPass(renderPass);
    comp.addPass(bloomPass);
    comp.setSize(size.width, size.height);
    composer.current = comp;

    return () => {
      comp.dispose();
    };
  }, [gl, scene, camera, size.width, size.height]);

  useFrame(() => {
    composer.current?.render();
  }, 1);

  return null;
}
