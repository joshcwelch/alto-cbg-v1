import { Html, useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { CARD_H, CARD_W } from "../cards/CardMesh";
import type { UnitOnBoard } from "../../../../src/core/cardTypes";

const UNIT_SCALE = 0.78;
export const UNIT_W = CARD_W * UNIT_SCALE;
export const UNIT_H = CARD_H * UNIT_SCALE;
const UNIT_THICKNESS = 0.02;

// unit-frame.png is stored as a base64 string; load it via data URI to avoid relying on the card frame.
import unitFrameRaw from "../cards/textures/unit-frame.png?raw";

type Props = ThreeElements["group"] & {
  unit: UnitOnBoard;
};

export default function UnitMesh({ unit, ...rest }: Props) {
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
    atk: unit.base.attack,
    hp: Math.max(0, unit.base.health - unit.damage)
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
    <group {...groupProps}>
      <mesh ref={meshRef} geometry={geo} material={mats} castShadow receiveShadow renderOrder={renderOrder} />
      <Html
        center
        zIndexRange={[80, 80]}
        position={[0, 0, UNIT_THICKNESS / 2 + 0.002]}
        transform={false}
        className="unit-html-root"
        style={{
          width: `${UNIT_W * 100}px`,
          height: `${UNIT_H * 100}px`,
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#f3f6ff",
            textShadow: "0 2px 4px rgba(0,0,0,0.55)",
            fontSize: "clamp(12px, 1.4vh, 16px)",
            fontWeight: 700,
            letterSpacing: 0.3,
            padding: "10px"
          }}
        >
          <span style={{ position: "absolute", bottom: "12%", left: "10%", fontSize: "clamp(12px, 1.6vh, 18px)" }}>
            {stats.atk}
          </span>
          <span style={{ position: "absolute", bottom: "12%", right: "10%", fontSize: "clamp(12px, 1.6vh, 18px)" }}>
            {stats.hp}
          </span>
        </div>
      </Html>
    </group>
  );
}
