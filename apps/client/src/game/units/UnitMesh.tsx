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
  const artTex = useTexture(card.artSrc);

  const artMaskTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(size / 2, size / 2, size * 0.36, size * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  useEffect(() => {
    frameTex.colorSpace = THREE.SRGBColorSpace;
    frameTex.needsUpdate = true;
    artTex.colorSpace = THREE.SRGBColorSpace;
    artTex.needsUpdate = true;
    if (artMaskTex) {
      artMaskTex.needsUpdate = true;
    }
  }, [artMaskTex, artTex, frameTex]);

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
      <mesh
        position={[0, 0, UNIT_THICKNESS / 2 + 0.0005]}
        renderOrder={renderOrder + 0.1}
      >
        <planeGeometry args={[UNIT_W * 0.88, UNIT_H * 0.74]} />
        <meshBasicMaterial
          map={artTex}
          alphaMap={artMaskTex ?? undefined}
          transparent
          alphaTest={0.1}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
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
