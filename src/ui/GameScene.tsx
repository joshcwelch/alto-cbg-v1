import { Suspense } from "react";
import Board3D from "./Board3D";
import EnemyHand3D from "./EnemyHand3D";
import Hand3D from "./Hand3D";

export default function GameScene() {
  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 6]} intensity={0.9} />
      <Suspense fallback={null}>
        <Board3D />
        <EnemyHand3D />
        <Hand3D />
      </Suspense>
    </group>
  );
}
