import { useEffect, useState, type PropsWithChildren } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH, getBoardScale } from "./boardConfig";
export default function BoardScaleContainer({ children }: PropsWithChildren) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setScale(getBoardScale(window.innerWidth, window.innerHeight));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${BOARD_WIDTH}px`,
          height: `${BOARD_HEIGHT}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center"
        }}
      >
        {children}
      </div>
    </div>
  );
}
