import type { PlayerId } from "../../core/cardTypes";
import { HERO_REGISTRY } from "../../game/heroes/heroRegistry";
import { HeroId } from "../../game/heroes/heroTypes";
import { useGameStore } from "../../state/useGameStore";

type HeroPanelProps = {
  playerId: PlayerId;
  align?: "top" | "bottom";
};

const FRAME_IMAGE_URL = "/assets/ui/frames/player-frame.png";

export default function HeroPanel({ playerId, align = "bottom" }: HeroPanelProps) {
  const heroStates = useGameStore(s => s.heroStates);
  const health = useGameStore(s => (playerId === "player" ? s.playerHealth : s.enemyHealth));
  const heroState = heroStates[playerId];
  const heroId = heroState?.heroId ?? HeroId.EMBER_THAROS;
  const hero = HERO_REGISTRY[heroId];

  return (
    <div
      style={{
        width: 192,
        aspectRatio: "675 / 935",
        pointerEvents: "auto",
        position: "relative",
        overflow: "hidden",
        filter: align === "top" ? "brightness(0.95)" : "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8.5%",
          left: "11%",
          width: "78%",
          height: "74%",
          clipPath: "ellipse(49% 52% at 50% 50%)",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0
        }}
      >
        <img
          src={hero?.portraitPath}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block"
          }}
        />
      </div>
      <img
        src={FRAME_IMAGE_URL}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "calc(50% - 2px)",
          transform: "translateX(-50%) translateY(6px)",
          minWidth: 36,
          padding: "2px 6px",
          color: "#e7f6ff",
          fontWeight: 900,
          fontSize: 27,
          textAlign: "center",
          textShadow:
            "0 0 6px rgba(90, 210, 255, 0.9), 0 0 14px rgba(70, 190, 255, 0.75), 0 0 22px rgba(40, 150, 255, 0.55)",
          pointerEvents: "none",
          zIndex: 2
        }}
      >
        {health}
      </div>
    </div>
  );
}
