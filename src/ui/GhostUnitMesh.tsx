import { Billboard } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { UNIT_H, UNIT_W } from "../../apps/client/src/game/units/UnitMesh";

const GHOST_THICKNESS = 0.02;

type Props = {
  renderOrder?: number;
};

export default function GhostUnitMesh({ renderOrder = 9 }: Props) {
  const geometry = useMemo(
    () => new THREE.BoxGeometry(UNIT_W, UNIT_H, GHOST_THICKNESS, 1, 1, 1),
    []
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.4,
        roughness: 0.8,
        metalness: 0.05,
        depthWrite: false
      }),
    []
  );

  return (
    <Billboard follow lockX lockY renderOrder={renderOrder}>
      <mesh geometry={geometry} material={material} renderOrder={renderOrder} />
    </Billboard>
  );
}
