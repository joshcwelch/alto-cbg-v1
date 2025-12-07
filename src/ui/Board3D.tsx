import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { SRGBColorSpace } from "three";

const BOARD_PATH = "/src/assets/board/board.png";
const BOARD_ASPECT = 1152 / 2048; // approximate height / width from provided asset
const BASE_WIDTH = 12;
const BOARD_SCALE = 1.35;
const BOARD_WIDTH = BASE_WIDTH * BOARD_SCALE;
const BOARD_HEIGHT = BOARD_WIDTH * BOARD_ASPECT;
const BOARD_TILT = -0.42;

export default function Board3D() {
  const { gl } = useThree();
  const boardTex = useTexture(BOARD_PATH);

  if (boardTex) {
    boardTex.colorSpace = SRGBColorSpace;
    boardTex.anisotropy = gl.capabilities.getMaxAnisotropy();
    boardTex.needsUpdate = true;
  }

  return (
    <mesh
      renderOrder={0}
      position={[0, 0, 0]}
      rotation={[BOARD_TILT, 0, 0]}
      scale={[6, 4, 1]}
      receiveShadow
    >
      <planeGeometry args={[BOARD_WIDTH, BOARD_HEIGHT]} />
      <meshStandardMaterial map={boardTex} roughness={1} metalness={0} />
    </mesh>
  );
}
