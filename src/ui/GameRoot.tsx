import { useEffect, useMemo, useState, type PropsWithChildren, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import BoardOverlay from "./overlay/BoardOverlay";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./boardConfig";

type GameRootProps = PropsWithChildren<{
  canvasContent?: ReactNode;
}>;

export default function GameRoot({ children, canvasContent }: GameRootProps) {
  const getScale = () => {
    if (typeof window === "undefined") return 1;
    const scaleX = window.innerWidth / BOARD_WIDTH;
    const scaleY = window.innerHeight / BOARD_HEIGHT;
    return Math.min(scaleX, scaleY);
  };

  const [scale, setScale] = useState(getScale);
  const transform = useMemo(() => `translate(-50%, -50%) scale(${scale})`, [scale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => setScale(getScale());
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return (
    <div className="Viewport">
      <div className="GameRoot" style={{ transform }}>
        <img className="board-bg" src="/assets/board/board.png" alt="Board" draggable={false} />
        <div className="board-layer">
          <div className="board-frame">
            <Canvas
              orthographic
              camera={{ zoom: 100, position: [0, 0, 10] }}
              className="game-canvas"
              style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
              onCreated={({ gl }) => {
                const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
                gl.setPixelRatio(dpr);
                gl.setSize(BOARD_WIDTH, BOARD_HEIGHT, true);
              }}
            >
              {canvasContent}
            </Canvas>
            <BoardOverlay />
            <div id="ui-root">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
