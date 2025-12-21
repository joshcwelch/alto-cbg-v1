import { useState } from "react";
import type { BoardPoint } from "./BoardSlots";
import { useGameContext } from "../GameRoot";

type EndTurnButtonProps = {
  slot: BoardPoint;
  isActive: boolean;
  onEndTurn: () => void;
};

const EndTurnButton = ({ slot, isActive, onEndTurn }: EndTurnButtonProps) => {
  const { setCursorState } = useGameContext();
  const [pressed, setPressed] = useState(false);

  return (
    <button
      className={`end-turn-button${isActive ? "" : " is-disabled"}`}
      type="button"
      style={{ left: slot.x, top: slot.y }}
      disabled={!isActive}
      onClick={() => {
        if (!isActive) return;
        onEndTurn();
      }}
      onPointerEnter={() => setCursorState("default")}
      onPointerLeave={() => {
        setCursorState("default");
        setPressed(false);
      }}
      onPointerDown={() => {
        if (!isActive) return;
        setCursorState("default");
        setPressed(true);
      }}
      onPointerUp={() => {
        setCursorState("default");
        setPressed(false);
      }}
    >
      <img
        className={`end-turn-button__art ${pressed ? "is-hidden" : ""}`}
        src={isActive ? "/assets/ui/end-turn-active.png" : "/assets/ui/end-turn-inactive.png"}
        alt=""
      />
      <img
        className={`end-turn-button__art ${pressed ? "" : "is-hidden"}${isActive ? "" : " is-hidden"}`}
        src="/assets/ui/end-turn-inactive.png"
        alt=""
      />
      <span className="sr-only">End Turn</span>
    </button>
  );
};

export default EndTurnButton;
