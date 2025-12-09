import type { PropsWithChildren, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import boardPng from "../assets/board/board.png";
import BoardOverlay from "./overlay/BoardOverlay";

type GameRootProps = PropsWithChildren<{
  canvasContent?: ReactNode;
}>;

export default function GameRoot({ children, canvasContent }: GameRootProps) {
  return (
    <div id="game-root">
      <img className="board-bg" src={boardPng} alt="Board" draggable={false} />
      <div className="board-layer">
        <div className="board-frame">
          <Canvas
            orthographic
            camera={{ zoom: 100, position: [0, 0, 10] }}
            className="game-canvas"
            dpr={[1, 2]}
          >
            {canvasContent}
          </Canvas>
          <BoardOverlay />
          <div id="ui-root">{children}</div>
        </div>
      </div>
    </div>
  );
}
