import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import BoardStage from "./ui/BoardStage";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./ui/boardMetrics";

export type CursorState = "default" | "hover" | "dragging";

type CursorInfo = {
  x: number;
  y: number;
  visible: boolean;
};

type GameContextValue = {
  scale: number;
  offsetX: number;
  offsetY: number;
  cursor: CursorInfo;
  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export const useGameContext = () => {
  const value = useContext(GameContext);
  if (!value) {
    throw new Error("useGameContext must be used within GameRoot");
  }
  return value;
};

const GameRoot = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cursor, setCursor] = useState<CursorInfo>({ x: 0, y: 0, visible: false });
  const [cursorState, setCursorState] = useState<CursorState>("default");

  useLayoutEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const nextScale = Math.min(viewportWidth / BOARD_WIDTH, viewportHeight / BOARD_HEIGHT);
      const nextOffsetX = Math.round((viewportWidth - BOARD_WIDTH * nextScale) / 2);
      const nextOffsetY = Math.round((viewportHeight - BOARD_HEIGHT * nextScale) / 2);
      setScale(nextScale);
      setOffsetX(nextOffsetX);
      setOffsetY(nextOffsetY);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const gameX = (event.clientX - rect.left) / scale;
    const gameY = (event.clientY - rect.top) / scale;
    const visible = gameX >= 0 && gameX <= BOARD_WIDTH && gameY >= 0 && gameY <= BOARD_HEIGHT;
    setCursor({ x: gameX, y: gameY, visible });
  };

  const handlePointerLeave = () => {
    setCursor((prev) => ({ ...prev, visible: false }));
    setCursorState("default");
  };

  const contextValue = useMemo(
    () => ({
      scale,
      offsetX,
      offsetY,
      cursor,
      cursorState,
      setCursorState,
    }),
    [scale, offsetX, offsetY, cursor, cursorState]
  );

  return (
    <GameContext.Provider value={contextValue}>
      <div
        ref={rootRef}
        className="game-root"
        style={{
          left: offsetX,
          top: offsetY,
          transform: `scale(${scale})`,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <BoardStage />
      </div>
    </GameContext.Provider>
  );
};

export default GameRoot;
