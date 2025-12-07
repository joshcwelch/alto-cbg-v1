import { Environment } from "@react-three/drei";
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
    </>
  );
}
