import * as THREE from "three";
import { useMemo } from "react";
export function useCardMaterials(opts: {
  frontTex: THREE.Texture;
  backTex: THREE.Texture;
  aoTex?: THREE.Texture | null;
  foilTex?: THREE.Texture | null;
  emissiveColor?: THREE.ColorRepresentation;
  emissiveBoost?: number; // 0..1
  foilEnabled?: boolean;
}) {
  const { frontTex, backTex, aoTex, foilTex, emissiveColor = 0x89cfff, emissiveBoost = 0, foilEnabled } = opts;
  return useMemo(() => {
    // Front material: crisp PBR with slight clearcoat
    const front = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.6,
      transparent: true,
      premultipliedAlpha: true,
      aoMap: aoTex ?? undefined,
      aoMapIntensity: 0.7,
      emissive: new THREE.Color(emissiveColor).multiplyScalar(0.35 + 0.65 * emissiveBoost),
      emissiveIntensity: 0.35 + 0.65 * emissiveBoost,
    });
    // Back material: matte card stock
    const back = new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: 0.85,
      metalness: 0.02,
    });
    // Edge material: dark paper core
    const edge = new THREE.MeshStandardMaterial({
      color: 0x2a2f3a,
      roughness: 0.9,
      metalness: 0.0,
    });
    // Foil overlay (optional): additive shimmer using multiTex scroll
    let foil: THREE.MeshBasicMaterial | null = null;
    if (foilEnabled && foilTex) {
      foilTex.wrapS = foilTex.wrapT = THREE.RepeatWrapping;
      foil = new THREE.MeshBasicMaterial({
        map: foilTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.22,
      });
    }
    return { front, back, edge, foil };
  }, [frontTex, backTex, aoTex, foilTex, emissiveColor, emissiveBoost, foilEnabled]);
}