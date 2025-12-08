import { Suspense } from "react";
import Board3D from "./Board3D";
import Hand3DEnemy from "./Hand3DEnemy";
import Hand3DPlayer from "./Hand3DPlayer";

export default function GameScene() {
  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 6]} intensity={0.9} />
      <Suspense fallback={null}>
        <Board3D />
        <Hand3DEnemy />
        <Hand3DPlayer />
      </Suspense>
    </group>
  );
}
