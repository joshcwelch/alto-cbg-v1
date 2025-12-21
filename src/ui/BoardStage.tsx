import { BoardSlots } from "./BoardSlots";
import AbilityFrame from "./AbilityFrame";
import BoardCursor from "./BoardCursor";
import BoardMinion from "./BoardMinion";
import CardBack from "./CardBack";
import CursorCoords from "./CursorCoords";
import EndTurnButton from "./EndTurnButton";
import GraveyardPortal from "./GraveyardPortal";
import HandCard from "./HandCard";
import HeroSlot from "./HeroSlot";
import ManaBar from "./ManaBar";
import MenuStamp from "./MenuStamp";

const BoardStage = () => {
  return (
    <div className="board-stage">
      <MenuStamp slot={{ x: 24, y: 24 }} src="/assets/ui/menus/menuBackground.png" alt="Menu background" width={1} height={1} />
      <MenuStamp slot={{ x: 48, y: 24 }} src="/assets/ui/menus/map.png" alt="Map panel" width={1} height={1} />
      <MenuStamp slot={{ x: 72, y: 24 }} src="/assets/ui/menus/heroPanel.png" alt="Hero panel" width={1} height={1} />
      <HeroSlot
        slot={{ x: BoardSlots.HeroBottom.x + 58, y: BoardSlots.HeroTop.y + 80 }}
        portraitSrc="/assets/heroes/tharos.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Enemy hero"
      />
      <HeroSlot
        slot={{ x: BoardSlots.HeroBottom.x + 58, y: BoardSlots.HeroBottom.y - 45 }}
        portraitSrc="/assets/heroes/lyra.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Player hero"
      />
      <ManaBar slot={BoardSlots.ManaBar} />
      <EndTurnButton slot={BoardSlots.EndTurn} />
      <AbilityFrame slot={BoardSlots.AbilityFrame} />
      <AbilityFrame slot={BoardSlots.EnemyAbilityFrame} />
      <div className="combat-lane combat-lane--enemy" />
      <div className="combat-lane combat-lane--player" />
      <HandCard slot={{ x: BoardSlots.Hand.x, y: BoardSlots.Hand.y + 12 }} artSrc="/assets/cards/sunlance-champion.png" alt="Sunlance Champion" rotation={-12} />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 120, y: BoardSlots.Hand.y + 6 }}
        artSrc="/assets/cards/sunlance-scout.png"
        alt="Sunlance Scout"
        rotation={-6}
      />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 240, y: BoardSlots.Hand.y }}
        artSrc="/assets/cards/beacon-monk.png"
        alt="Beacon Monk"
        rotation={0}
      />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 360, y: BoardSlots.Hand.y + 6 }}
        artSrc="/assets/cards/crystal-acolyte.png"
        alt="Crystal Acolyte"
        rotation={6}
      />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 480, y: BoardSlots.Hand.y + 12 }}
        artSrc="/assets/cards/seraphic-warden.png"
        alt="Seraphic Warden"
        rotation={12}
      />
      <CardBack slot={{ x: BoardSlots.EnemyHand.x, y: BoardSlots.EnemyHand.y }} rotation={180} />
      <CardBack slot={{ x: BoardSlots.EnemyHand.x + 105, y: BoardSlots.EnemyHand.y }} rotation={180} />
      <CardBack slot={{ x: BoardSlots.EnemyHand.x + 210, y: BoardSlots.EnemyHand.y }} rotation={180} />
      <CardBack slot={{ x: BoardSlots.EnemyHand.x + 315, y: BoardSlots.EnemyHand.y }} rotation={180} />
      <CardBack slot={{ x: BoardSlots.EnemyHand.x + 420, y: BoardSlots.EnemyHand.y }} rotation={180} />
      <GraveyardPortal center={BoardSlots.Graveyard} />
      <BoardMinion slot={{ x: 268, y: 275 }} artSrc="/assets/cards/sunlance-champion.png" alt="Sunlance Champion" />
      <BoardMinion slot={{ x: 413, y: 275 }} artSrc="/assets/cards/sunlance-scout.png" alt="Sunlance Scout" />
      <BoardMinion slot={{ x: 558, y: 275 }} artSrc="/assets/cards/beacon-monk.png" alt="Beacon Monk" />
      <BoardMinion slot={{ x: 703, y: 275 }} artSrc="/assets/cards/crystal-acolyte.png" alt="Crystal Acolyte" />
      <BoardMinion slot={{ x: 848, y: 275 }} artSrc="/assets/cards/seraphic-warden.png" alt="Seraphic Warden" />
      <BoardMinion slot={{ x: 993, y: 275 }} artSrc="/assets/cards/sunlance-champion.png" alt="Sunlance Champion" />
      <BoardMinion slot={{ x: 1138, y: 275 }} artSrc="/assets/cards/sunlance-scout.png" alt="Sunlance Scout" />

      <BoardMinion slot={{ x: 268, y: 615 }} artSrc="/assets/cards/sunlance-scout.png" alt="Sunlance Scout" />
      <BoardMinion slot={{ x: 413, y: 615 }} artSrc="/assets/cards/beacon-monk.png" alt="Beacon Monk" />
      <BoardMinion slot={{ x: 558, y: 615 }} artSrc="/assets/cards/crystal-acolyte.png" alt="Crystal Acolyte" />
      <BoardMinion slot={{ x: 703, y: 615 }} artSrc="/assets/cards/seraphic-warden.png" alt="Seraphic Warden" />
      <BoardMinion slot={{ x: 848, y: 615 }} artSrc="/assets/cards/sunlance-champion.png" alt="Sunlance Champion" />
      <BoardMinion slot={{ x: 993, y: 615 }} artSrc="/assets/cards/sunlance-scout.png" alt="Sunlance Scout" />
      <BoardMinion slot={{ x: 1138, y: 615 }} artSrc="/assets/cards/beacon-monk.png" alt="Beacon Monk" />
      <CursorCoords />
      <BoardCursor />
    </div>
  );
};

export default BoardStage;
