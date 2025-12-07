import { useEffect, useRef, useState, type RefObject } from "react";
import { useCursor, useTexture } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  DoubleSide,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type Texture
} from "three";
import type { CardDef } from "../core/cardTypes";

const CARD_WIDTH = 1;
const CARD_HEIGHT = 1.45;
const HOVER_LIFT = 0.25;
const HOVER_TILT_X = -0.1;
const HOVER_TILT_Z = 0.06;
const FRAME_Z = 0.006;
const ART_Z = 0.001;
const BACK_Z = -0.003;
const ART_WIDTH = 0.76;
const ART_HEIGHT = 0.64;

type CardMeshProps = {
  card: CardDef;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isFaceUp?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

export default function CardMesh({
  card,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isFaceUp = true,
  onClick
}: CardMeshProps) {
  const { gl } = useThree();
  const frontFrame = useTexture("/src/assets/cards/card-front.png");
  const backFrame = useTexture("/src/assets/cards/card-back.png");
  const artTex = useTexture(card.artSrc);

  const hoverRef = useRef<Group>(null);
  const cardRef = useRef<Group>(null);
  const shadowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useCursor(hovered);

  useTextureConfig([frontFrame, backFrame, artTex], gl.capabilities.getMaxAnisotropy());
  useFrameHover(hoverRef, shadowRef, hovered);
  useFrameFlip(cardRef, isFaceUp);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group
        ref={hoverRef}
        onClick={onClick}
        onPointerOver={e => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={e => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <mesh
          ref={shadowRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.025, 0]}
          receiveShadow
        >
          <planeGeometry args={[CARD_WIDTH * 1.2, CARD_HEIGHT * 0.55]} />
          <meshStandardMaterial
            color="#000"
            transparent
            opacity={0.22}
            roughness={1}
            metalness={0}
          />
        </mesh>

        <group ref={cardRef}>
          {/* art window */}
          <mesh position={[0, 0, ART_Z]}>
            <planeGeometry args={[ART_WIDTH, ART_HEIGHT]} />
            <meshStandardMaterial
              map={artTex}
              side={DoubleSide}
              roughness={0.45}
              metalness={0.02}
            />
          </mesh>

          {/* front frame */}
          <mesh castShadow receiveShadow position={[0, 0, FRAME_Z]}>
            <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
            <meshStandardMaterial
              map={frontFrame}
              side={DoubleSide}
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>

          {/* back frame */}
          <mesh castShadow receiveShadow position={[0, 0, BACK_Z]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
            <meshStandardMaterial
              map={backFrame}
              side={DoubleSide}
              roughness={0.45}
              metalness={0.04}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function useTextureConfig(textures: Texture[], anisotropy: number) {
  useEffect(() => {
    textures.forEach(tex => {
      if (!tex) return;
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = anisotropy;
      tex.needsUpdate = true;
    });
  }, [textures, anisotropy]);
}

function useFrameHover(
  hoverRef: RefObject<Group>,
  shadowRef: RefObject<Mesh>,
  hovered: boolean
) {
  useFrame((_, delta) => {
    const grp = hoverRef.current;
    const shadow = shadowRef.current;
    if (!grp) return;

    const targetY = hovered ? HOVER_LIFT : 0;
    const targetRotX = hovered ? HOVER_TILT_X : 0;
    const targetRotZ = hovered ? HOVER_TILT_Z : 0;

    grp.position.y = MathUtils.damp(grp.position.y, targetY, 8, delta);
    grp.rotation.x = MathUtils.damp(grp.rotation.x, targetRotX, 8, delta);
    grp.rotation.z = MathUtils.damp(grp.rotation.z, targetRotZ, 8, delta);

    if (shadow) {
      const targetShadowScale = hovered ? 1.12 : 1;
      const targetShadowOpacity = hovered ? 0.32 : 0.22;
      shadow.scale.x = MathUtils.damp(shadow.scale.x, targetShadowScale, 10, delta);
      shadow.scale.y = MathUtils.damp(shadow.scale.y, targetShadowScale, 10, delta);
      const mat = shadow.material as MeshStandardMaterial;
      mat.opacity = MathUtils.damp(mat.opacity, targetShadowOpacity, 10, delta);
    }
  });
}

function useFrameFlip(cardRef: RefObject<Group>, isFaceUp: boolean) {
  useFrame((_, delta) => {
    const grp = cardRef.current;
    if (!grp) return;
    const targetRotY = isFaceUp ? 0 : Math.PI;
    grp.rotation.y = MathUtils.damp(grp.rotation.y, targetRotY, 10, delta);
  });
}
