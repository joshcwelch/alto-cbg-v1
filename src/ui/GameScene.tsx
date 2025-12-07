import { ContactShadows, Environment } from "@react-three/drei";
import Board3D from "./Board3D";
import Battlefield from "./Battlefield";
import Hand3D from "./Hand3D";

export default function GameScene() {
  return (
    <>
      <Environment preset="apartment" />
      <Board3D />
      <Battlefield />
      <Hand3D />
      <ContactShadows
        opacity={0.35}
        scale={16}
        blur={1.8}
        far={4}
        resolution={1024}
        position={[0, -0.02, 0]}
      />
    </>
  );
}
