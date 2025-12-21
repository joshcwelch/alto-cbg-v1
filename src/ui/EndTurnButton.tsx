import { useState } from "react";
import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type EndTurnButtonProps = {
  slot: BoardPoint;
};

const EndTurnButton = ({ slot }: EndTurnButtonProps) => {
  const { setCursorState } = useGameContext();
  const [pressed, setPressed] = useState(false);

  return (
    <button
      className="end-turn-button"
      type="button"
      style={{ left: slot.x, top: slot.y }}
      onPointerEnter={() => setCursorState("hover")}
      onPointerLeave={() => {
        setCursorState("default");
        setPressed(false);
      }}
      onPointerDown={() => {
        setCursorState("dragging");
        setPressed(true);
      }}
      onPointerUp={() => {
        setCursorState("hover");
        setPressed(false);
      }}
    >
      <img
        className={`end-turn-button__art ${pressed ? "is-hidden" : ""}`}
        src="/assets/ui/end-turn-active.png"
        alt=""
      />
      <img
        className={`end-turn-button__art ${pressed ? "" : "is-hidden"}`}
        src="/assets/ui/end-turn-inactive.png"
        alt=""
      />
      <span className="sr-only">End Turn</span>
    </button>
  );
};

export default EndTurnButton;
