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
        slot={BoardSlots.HeroTop}
        portraitSrc="/assets/heroes/tharos.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Enemy hero"
      />
      <HeroSlot
        slot={BoardSlots.HeroBottom}
        portraitSrc="/assets/heroes/lyra.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Player hero"
      />
      <ManaBar slot={BoardSlots.ManaBar} />
      <EndTurnButton slot={BoardSlots.EndTurn} />
      <AbilityFrame slot={BoardSlots.AbilityFrame} />
      <HandCard slot={BoardSlots.Hand} artSrc="/assets/cards/sunlance-champion.png" alt="Sunlance Champion" />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 190, y: BoardSlots.Hand.y }}
        artSrc="/assets/cards/sunlance-scout.png"
        alt="Sunlance Scout"
      />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 380, y: BoardSlots.Hand.y }}
        artSrc="/assets/cards/beacon-monk.png"
        alt="Beacon Monk"
      />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 570, y: BoardSlots.Hand.y }}
        artSrc="/assets/cards/crystal-acolyte.png"
        alt="Crystal Acolyte"
      />
      <HandCard
        slot={{ x: BoardSlots.Hand.x + 760, y: BoardSlots.Hand.y }}
        artSrc="/assets/cards/seraphic-warden.png"
        alt="Seraphic Warden"
      />
      <CardBack slot={{ x: 320, y: 140 }} />
      <CardBack slot={{ x: 460, y: 140 }} />
      <CardBack slot={{ x: 600, y: 140 }} />
      <GraveyardPortal center={BoardSlots.Graveyard} />
      <BoardMinion
        slot={{ x: BoardSlots.BoardCenter.x - 110, y: BoardSlots.BoardCenter.y - 110 }}
        artSrc="/assets/cards/seraphic-warden.png"
        alt="Seraphic Warden"
      />
      <CursorCoords />
      <BoardCursor />
    </div>
  );
};

export default BoardStage;
