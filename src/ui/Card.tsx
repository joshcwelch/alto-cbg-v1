import { motion } from "framer-motion";
import { useGameStore } from "../state/useGameStore";
import type { CardDef } from "../core/cardTypes";

const CARD_WIDTH = "clamp(120px, 12.5vw, 180px)";
const CARD_ASPECT_RATIO = "5 / 8"; // matches 160x256 base
const CARD_PADDING = "clamp(10px, 1vw, 14px)";

export default function Card({ card }: { card: CardDef }) {
  const playCard = useGameStore(s => s.playCard);
  const mana = useGameStore(s => s.playerMana);
  const canPlay = mana >= card.cost;

  return (
    <motion.div
      layout
      onClick={() => canPlay && playCard(card.id)}
      style={{
        width: CARD_WIDTH,
        aspectRatio: CARD_ASPECT_RATIO,
        background: canPlay ? "#ffffff" : "#d9dde6",
        borderRadius: 12,
        padding: CARD_PADDING,
        position: "relative",
        boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
        cursor: canPlay ? "pointer" : "not-allowed",
        border: "2px solid #2a2f45",
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: "#3ea6ff",
          color: "white", fontWeight: 800, display: "grid", placeItems: "center"
        }}>{card.cost}</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{card.name}</div>
      </div>
      <div style={{ flex: 1, fontSize: 13, color: "#333" }}>{card.description ?? "\u00A0"}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
        <span>ATK {card.attack}</span>
        <span>HP {card.health}</span>
      </div>
    </motion.div>
  );
}
