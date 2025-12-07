import type { PropsWithChildren, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import boardPng from "../assets/board/board.png";

export const STAGE_W = 1280;
export const STAGE_H = 640;

type BoardStageProps = PropsWithChildren<{
  canvasContent?: ReactNode;
}>;

export default function BoardStage({ children, canvasContent }: BoardStageProps) {
  return (
    <div
      className="alto-stage"
      style={{
        position: "relative",
        width: `${STAGE_W}px`,
        height: `${STAGE_H}px`,
        margin: "0 auto",
        overflow: "hidden",
        backgroundColor: "#0b1220"
      }}
    >
      <img
        src={boardPng}
        alt="Board"
        draggable={false}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          objectFit: "cover",
          pointerEvents: "none"
        }}
      />
      <Canvas
        orthographic
        camera={{ zoom: 100, position: [0, 0, 10] }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          inset: 0,
          pointerEvents: "none"
        }}
        dpr={[1, 2]}
      >
        {canvasContent}
      </Canvas>
      {children}
    </div>
  );
}
