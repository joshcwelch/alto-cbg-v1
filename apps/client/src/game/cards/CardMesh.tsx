import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { CardVisual, Rarity } from "./types";
import { rarityParams } from "./rarity";
import { useCardMaterials } from "./cardMaterials";

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
  const foil = visual.foil ?? false;
  const backId = visual.backId;

  const frontTex = useTexture(tex(`./textures/${visual.id}.png`));
  const backTex  = useTexture(tex(`./textures/${backId ?? "_back_default"}.png`));
  const aoTex    = useTexture(tex(`./textures/_occlusion_soft.png`));
  const foilTex  = useTexture(tex(`./textures/_foil_noise.png`));

  // Ensure sRGB and mipmap settings
  [frontTex, backTex, aoTex, foilTex].forEach((t) => {
    if (!t) return;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
  });

  const { front, back, edge, foil: foilMat } = useCardMaterials({
    frontTex, backTex, aoTex,
    foilTex, foilEnabled: foil,
    emissiveColor: new THREE.Color().fromArray(rarityParams[rarity].color),
    emissiveBoost: visual.emissiveBoost ?? 0
  });

  // Geometry: thin box so we get real edges + proper back
  const geo = useMemo(() => new THREE.BoxGeometry(CARD_W, CARD_H, THICKNESS, 1, 1, 1), []);
  // Assign AO UV2
  useMemo(() => {
    (geo as any).attributes.uv2 = (geo as any).attributes.uv;
  }, [geo]);

  const group = useRef<THREE.Group>(null!);
  const foilMesh = useRef<THREE.Mesh>(null!);

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

    // Foil shimmer scroll
    if (foil && foilMesh.current && (foilMat as any)?.map) {
      const m = (foilMat as THREE.MeshBasicMaterial);
      const map = m.map!;
      map.offset.x = (map.offset.x + dt * 0.05) % 1;
      map.offset.y = (map.offset.y + dt * 0.035) % 1;
      m.opacity = THREE.MathUtils.lerp(m.opacity, state === "hover" ? 0.34 : 0.22, Math.min(1, dt * 8));
    }
  });

  // Material array order for BoxGeometry (right,left,top,bottom,front,back)
  const mats = useMemo(() => {
    const arr: THREE.Material[] = [
      edge, edge, edge, edge, front, back
    ];
    return arr;
  }, [front, back, edge]);

  // Border glow via sprite ring
  const rimColor = useMemo(() => new THREE.Color().fromArray(rarityParams[rarity].color), [rarity]);
  const rimStrength = rarityParams[rarity].rim;

  return (
    <group ref={group} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut} {...rest}>
      {/* Main card body */}
      <mesh geometry={geo} material={mats} castShadow={shadow} receiveShadow={false} />

      {/* Foil overlay as slightly larger plane on front face */}
      {foil && foilMat && (
        <mesh ref={foilMesh} position={[0, 0, THICKNESS/2 + 0.0005]}>
          <planeGeometry args={[CARD_W * 1.002, CARD_H * 1.002, 1, 1]} />
          <primitive object={foilMat} attach="material" />
        </mesh>
      )}

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