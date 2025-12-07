import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { CardVisual, Rarity } from "./types";
import { rarityParams } from "./rarity";

const CARD_ASPECT = 1390 / 915;
export const CARD_W = 1.2;
export const CARD_H = CARD_W * CARD_ASPECT;
const THICKNESS = 0.028;

type Props = ThreeElements["group"] & {
  visual: CardVisual;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  shadow?: boolean;
};

function tex(url: string) {
  // Vite-proof import
  return new URL(url, import.meta.url).href;
}

export default function CardMesh({ visual, onClick, onPointerOver, onPointerOut, shadow = true, ...rest }: Props) {
  const rarity: Rarity = visual.rarity ?? "common";
  const state = visual.state ?? "idle";

  const frontTex = useTexture(tex("./textures/card-front.png"));
  const backTex  = useTexture(tex("./textures/card-back.png"));

  // Ensure sRGB and mipmap settings
  useEffect(() => {
    [frontTex, backTex].forEach((t) => {
      if (!t) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    });
  }, [frontTex, backTex]);

  // Basic frame-only materials
  const frontMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      map: frontTex,
      transparent: true,
      roughness: 0.55,
      metalness: 0.05
    }),
    [frontTex]
  );

  const backMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: 0.85,
      metalness: 0.02
    }),
    [backTex]
  );

  const edgeMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#2a2f3a",
      roughness: 0.9
    }),
    []
  );

  // Geometry: thin box so we get real edges + proper back
  const geo = useMemo(() => new THREE.BoxGeometry(CARD_W, CARD_H, THICKNESS, 1, 1, 1), []);
  // Assign AO UV2
  useMemo(() => {
    (geo as any).attributes.uv2 = (geo as any).attributes.uv;
  }, [geo]);

  const group = useRef<THREE.Group>(null!);

  // Animation states (idle/hover/drag/played)
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;

    const targetLift =
      state === "hover" ? 0.06 :
      state === "drag"  ? 0.08 :
      state === "played" ? 0.02 : 0.0;

    const targetTilt =
      state === "hover" ? -0.06 :
      state === "drag"  ? -0.02 :
      state === "disabled" ? 0.0 : -0.04;

    g.position.y += (targetLift - g.position.y) * Math.min(1, dt * 10);
    g.rotation.x += (targetTilt - g.rotation.x) * Math.min(1, dt * 10);
  });

  // Material array order for BoxGeometry (right,left,top,bottom,front,back)
  const mats = useMemo(() => {
    const arr: THREE.Material[] = [
      edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat
    ];
    return arr;
  }, [frontMat, backMat, edgeMat]);

  // Border glow via sprite ring
  const rimColor = useMemo(() => new THREE.Color().fromArray(rarityParams[rarity].color), [rarity]);
  const rimStrength = rarityParams[rarity].rim;

  return (
    <group ref={group} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut} {...rest}>
      {/* Main card body */}
      <mesh geometry={geo} material={mats} castShadow={shadow} receiveShadow={false} />

      {/* Border/rim glow (additive billboard) */}
      <mesh position={[0, 0, THICKNESS/2 + 0.001]} renderOrder={10}>
        <planeGeometry args={[CARD_W * 1.08, CARD_H * 1.08]} />
        <meshBasicMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={rimStrength}
          color={rimColor}
        />
      </mesh>
    </group>
  );
}
