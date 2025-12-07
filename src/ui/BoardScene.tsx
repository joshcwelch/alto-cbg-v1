import { Environment } from "@react-three/drei";
import Battlefield from "./Battlefield";
import Hand3D from "./Hand3D";
import Board3D from "./Board3D";

export default function BoardScene() {
  return (
    <>
      <Environment preset="apartment" />
      <Board3D />
      <Battlefield />
      <Hand3D />
    </>
  );
}
