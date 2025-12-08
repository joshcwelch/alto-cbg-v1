import { Billboard, Text, useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { CARD_H, CARD_W } from "../cards/CardMesh";
import type { CardDef, PlayerId } from "../../../../../src/core/cardTypes";

const UNIT_SCALE = 0.75;
export const UNIT_W = CARD_W * UNIT_SCALE;
export const UNIT_H = CARD_H * UNIT_SCALE;
const UNIT_THICKNESS = 0.02;

// unit-frame.png is stored as a base64 string; load it via data URI to avoid relying on the card frame.
import unitFrameRaw from "../cards/textures/unit-frame.png?raw";

type Props = ThreeElements["group"] & {
  card: CardDef;
  owner: PlayerId;
  damage?: number;
};

export default function UnitMesh({ card, damage = 0, ...rest }: Props) {
  const { renderOrder = 0, ...groupProps } = rest;
  const frameUrl = useMemo(() => {
    const trimmed = unitFrameRaw.trim();
    return trimmed.startsWith("data:") ? trimmed : `data:image/png;base64,${trimmed}`;
  }, []);

  const frameTex = useTexture(frameUrl);

  useEffect(() => {
    frameTex.colorSpace = THREE.SRGBColorSpace;
    frameTex.needsUpdate = true;
  }, [frameTex]);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: frameTex,
        roughness: 0.6,
        metalness: 0.08,
        transparent: true
      }),
    [frameTex]
  );

  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1d2230",
        roughness: 0.9,
        metalness: 0.05
      }),
    []
  );

  const geo = useMemo(() => {
    const geometry = new THREE.BoxGeometry(UNIT_W, UNIT_H, UNIT_THICKNESS, 1, 1, 1);
    (geometry as any).attributes.uv2 = (geometry as any).attributes.uv;
    return geometry;
  }, []);

  const stats = {
    atk: card.attack,
    hp: Math.max(0, card.health - damage)
  };

  const meshRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (!meshRef.current) return;
    const materials = meshRef.current.material as THREE.Material[];
    if (!Array.isArray(materials)) return;
    if (!materials[4]) return;
  }, []);

  const mats = useMemo(() => [edgeMat, edgeMat, edgeMat, edgeMat, mat, edgeMat], [edgeMat, mat]);

  return (
    <Billboard follow lockX lockY {...groupProps}>
      <mesh ref={meshRef} geometry={geo} material={mats} castShadow receiveShadow renderOrder={renderOrder} />
      <Text
        position={[-UNIT_W * 0.34, -UNIT_H * 0.36, UNIT_THICKNESS / 2 + 0.006]}
        fontSize={0.16}
        color="#f3f6ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor="#0a0d14"
        renderOrder={renderOrder + 1}
      >
        {stats.atk}
      </Text>
      <Text
        position={[UNIT_W * 0.34, -UNIT_H * 0.36, UNIT_THICKNESS / 2 + 0.006]}
        fontSize={0.16}
        color="#f3f6ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor="#0a0d14"
        renderOrder={renderOrder + 1}
      >
        {stats.hp}
      </Text>
    </Billboard>
  );
}
