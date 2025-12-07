import Hand from "./Hand";
import Battlefield from "./Battlefield";
import ManaBar from "./ManaBar";
import EndTurnButton from "./EndTurnButton";
// import board from "../assets/board/board.png"; // use when you have an image
import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export default function Board() {
  const newGame = useGameStore(s => s.newGame);

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        // backgroundImage: `url(${board})`,
        // backgroundSize: "cover",
        background: "linear-gradient(#1b2130, #0d111a)",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <Battlefield />
      <Hand />
      <ManaBar />
      <EndTurnButton />
    </div>
  );
}
