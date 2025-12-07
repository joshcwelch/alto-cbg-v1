import type { PropsWithChildren, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import boardPng from "../assets/board/board.png";

type GameRootProps = PropsWithChildren<{
  canvasContent?: ReactNode;
}>;

export default function GameRoot({ children, canvasContent }: GameRootProps) {
  return (
    <div id="game-root">
      <img
        className="board-bg"
        src={boardPng}
        alt="Board"
        draggable={false}
      />
      <Canvas
        orthographic
        camera={{ zoom: 100, position: [0, 0, 10] }}
        className="game-canvas"
        dpr={[1, 2]}
      >
        {canvasContent}
      </Canvas>
      <div id="ui-root">{children}</div>
    </div>
  );
}
