import { useGameStore } from "../state/useGameStore";

export default function ManaBar() {
  const mana = useGameStore(s => s.playerMana);
  const max = useGameStore(s => s.maxMana);

  return (
    <div style={{
      position: "absolute",
      bottom: 10,
      left: 20,
      color: "white",
      fontSize: 22,
      fontWeight: 800,
      textShadow: "0 2px 4px rgba(0,0,0,0.6)"
    }}>
      Mana: {mana}/{max}
    </div>
  );
}
