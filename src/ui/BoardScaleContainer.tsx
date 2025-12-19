import { useEffect, useState, type PropsWithChildren } from "react";

const BOARD_WIDTH = 1536;
const BOARD_HEIGHT = 1024;
export default function BoardScaleContainer({ children }: PropsWithChildren) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / BOARD_WIDTH;
      const scaleY = window.innerHeight / BOARD_HEIGHT;
      const nextScale = Math.min(scaleX, scaleY);
      const clamped = Math.max(0.75, Math.min(nextScale, 1.1));
      setScale(clamped);
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
