import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { DoubleSide, SRGBColorSpace } from "three";
import type { CardDef } from "../core/cardTypes";

const CARD_WIDTH = 1;
const CARD_HEIGHT = 1.45;

type CardMeshProps = {
  card: CardDef;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

export default function CardMesh({
  card,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick
}: CardMeshProps) {
  const texture = useTexture(card.artSrc);

  useEffect(() => {
    if (!texture) return;
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow onClick={onClick}>
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
        <meshStandardMaterial
          map={texture}
          side={DoubleSide}
          roughness={0.48}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
}
