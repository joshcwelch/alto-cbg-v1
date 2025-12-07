import { motion } from "framer-motion";
import { useGameStore } from "../state/useGameStore";
import type { CardDef } from "../core/cardTypes";

export default function Card({ card, index }: { card: CardDef; index: number }) {
  const playCard = useGameStore(s => s.playCard);
  const mana = useGameStore(s => s.playerMana);
  const canPlay = mana >= card.mana;

  return (
    <motion.div
      layout
      onClick={() => canPlay && playCard(card.id)}
      whileHover={{ y: -16, scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: 120,
        height: 170,
        background: canPlay ? "#ffffff" : "#d9dde6",
        borderRadius: 12,
        padding: 8,
        position: "absolute",
        left: `${index * 140}px`,
        bottom: 0,
        boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
        cursor: canPlay ? "pointer" : "not-allowed",
        border: "2px solid #2a2f45"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: "#3ea6ff",
          color: "white", fontWeight: 800, display: "grid", placeItems: "center"
        }}>{card.mana}</div>
        <div style={{ fontWeight: 800 }}>{card.name}</div>
      </div>
      <div style={{ fontSize: 12, color: "#333", minHeight: 60 }}>{card.text ?? "\u00A0"}</div>
      <div style={{ position: "absolute", bottom: 8, left: 8, fontWeight: 800 }}>⚔ {card.attack}</div>
      <div style={{ position: "absolute", bottom: 8, right: 8, fontWeight: 800 }}>❤ {card.health}</div>
    </motion.div>
  );
}
