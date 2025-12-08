import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { CardVisual } from "./types";

export const CARD_ASPECT = 1390 / 915;
export const CARD_W = 1.2;
export const CARD_H = CARD_W * CARD_ASPECT;
const THICKNESS = 0.028;

function CardHtmlOverlay({ visual }: { visual: CardVisual }) {
  const { name, cost, attack, health, text } = visual;
  return (
    <div
      className="html-card card-overlay"
      style={{
        width: `${CARD_W * 100}px`,
        height: `${CARD_H * 100}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "10px",
        padding: "14px",
        color: "#0c1424",
        borderRadius: "12px",
        pointerEvents: "none",
        background: "transparent",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
        <span className="card-stats cost">{cost ?? ""}</span>
        <span className="card-name">{name ?? ""}</span>
      </div>
      <div
        className="card-text"
        style={{ flex: 1, lineHeight: 1.35, color: "#0f1a2a", wordBreak: "break-word", overflow: "hidden" }}
      >
        {text ?? ""}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
        <span className="card-stats atk">{attack != null ? `ATK ${attack}` : ""}</span>
        <span className="card-stats hp">{health != null ? `HP ${health}` : ""}</span>
      </div>
    </div>
  );
}

type Props = ThreeElements["group"] & {
  visual: CardVisual;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  shadow?: boolean;
  hideHtml?: boolean;
  disableAnimation?: boolean;
};

export default function CardMesh({
  visual,
  onClick,
  onPointerOver,
  onPointerOut,
  shadow = true,
  hideHtml = false,
  disableAnimation = false,
  ...rest
}: Props) {
  const { renderOrder = 0, ...groupProps } = rest;
  const state = visual.state ?? "idle";
  const isLocalOwner = visual.owner ? visual.owner === "player" : true;
  const shouldHideHtml = hideHtml || !isLocalOwner;

  const frontTex = useTexture(new URL("./textures/card-front.png", import.meta.url).href);
  const backTex = useTexture(new URL("./textures/card-back.png", import.meta.url).href);

  if (!frontTex) {
    console.error("Front card texture failed to load");
    return null;
  }

  // Ensure sRGB and mipmap settings
  useEffect(() => {
    frontTex.colorSpace = THREE.SRGBColorSpace;
    backTex.colorSpace = THREE.SRGBColorSpace;
    frontTex.anisotropy = backTex.anisotropy = 8;
    frontTex.needsUpdate = true;
    backTex.needsUpdate = true;
  }, [frontTex, backTex]);

  // Basic frame-only materials
  const frontMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: frontTex,
      transparent: true,
      roughness: 0.55,
      metalness: 0.05,
    });
    mat.depthWrite = true;
    mat.blending = THREE.NormalBlending;
    return mat;
  }, [frontTex]);

  const backMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: 0.85,
      metalness: 0.02,
    });
    mat.depthWrite = true;
    return mat;
  }, [backTex]);

  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2f3a",
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  );

  // Geometry: thin box so we get real edges + proper back
  const geo = useMemo(() => {
    const geometry = new THREE.BoxGeometry(CARD_W, CARD_H, THICKNESS, 1, 1, 1);
    (geometry as any).attributes.uv2 = (geometry as any).attributes.uv;
    return geometry;
  }, []);

  const cardGroup = useRef<THREE.Group>(null!);
  const animGroup = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  // Animation states (idle/hover/drag/played)
  useFrame((_, dt) => {
    if (disableAnimation) return;
    const g = animGroup.current;
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
    const arr: THREE.Material[] = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
    return arr;
  }, [frontMat, backMat, edgeMat]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    console.assert(Array.isArray(mesh.material) && (mesh.material as THREE.Material[])[4]?.map, "Front face (4) has no texture map");
    console.assert((mesh.material as THREE.Material[])[5]?.map, "Back face (5) has no texture map");
  }, [mats]);

  return (
    <group ref={cardGroup} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut} {...groupProps}>
      <group ref={animGroup}>
        {/* Main card body */}
        <mesh ref={meshRef} geometry={geo} material={mats} castShadow={shadow} receiveShadow={false} renderOrder={renderOrder} />
        {!shouldHideHtml && (
          <Html
            className="card-html-root"
            transform={false}
            occlude={false}
            position={[0, 0, THICKNESS / 2 + 0.001]}
            rotation={[0, 0, 0]}
            center
            zIndexRange={[100, 100]}
            style={{ pointerEvents: "none", background: "transparent", transform: "none" }}
          >
            <CardHtmlOverlay visual={visual} />
          </Html>
        )}
      </group>
    </group>
  );
}
