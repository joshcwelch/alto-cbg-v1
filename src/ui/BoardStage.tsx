import type { PropsWithChildren } from "react";
import boardPng from "../assets/board/board.png";

export const STAGE_W = 1280;
export const STAGE_H = 640;

export default function BoardStage({ children }: PropsWithChildren) {
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
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none"
        }}
      />
      {children}
    </div>
  );
}
