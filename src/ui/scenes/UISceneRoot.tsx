import { useEffect } from "react";
import { useAstraStore } from "../state/useAstraStore";
import { useUIStore } from "../state/useUIStore";
import CollectionScene from "./CollectionScene";
import DeckSelectScene from "./DeckSelectScene";
import AchievementsScene from "./AchievementsScene";
import CustomizeScene from "./CustomizeScene";
import HeroProfileScene from "./HeroProfileScene";
import HeroSelectScene from "./HeroSelectScene";
import InventoryScene from "./InventoryScene";
import MainMenuScene from "./MainMenuScene";
import MasquesScene from "./MasquesScene";
import MatchmakingScene from "./MatchmakingScene";
import OptionsScene from "./OptionsScene";
import ProfileScreen from "../../screens/ProfileScreen";
import QuestsScene from "./QuestsScene";
import StoreScene from "./StoreScene";
import WorldMapScene from "./WorldMapScene";
import BoardScene from "./BoardScene";

const UISceneRoot = () => {
  const scene = useUIStore((state) => state.scene);
  const setContext = useAstraStore((state) => state.setContext);
  const showCoachmark = useAstraStore((state) => state.showCoachmark);

  useEffect(() => {
    setContext({ scene });
    if (scene === "COLLECTION") {
      showCoachmark({
        id: "collection-edit-deck",
        text: "If you need to make changes, click 'EDIT DECK' to modify your Stormcaller.",
        ctaLabel: "Got it!",
      });
    }
  }, [scene, setContext, showCoachmark]);

  switch (scene) {
    case "MAIN_MENU":
      return <MainMenuScene />;
    case "QUESTS":
      return <QuestsScene />;
    case "COLLECTION":
      return <CollectionScene />;
    case "WORLD_MAP":
      return <WorldMapScene />;
    case "HERO_SELECT":
      return <HeroSelectScene />;
    case "DECK_SELECT":
      return <DeckSelectScene />;
    case "STORE":
      return <StoreScene />;
    case "INVENTORY":
      return <InventoryScene />;
    case "OPTIONS":
      return <OptionsScene />;
    case "PROFILE":
      return <ProfileScreen />;
    case "HERO_PROFILE":
      return <HeroProfileScene />;
    case "ACHIEVEMENTS":
      return <AchievementsScene />;
    case "CUSTOMIZE":
      return <CustomizeScene />;
    case "MASQUES":
      return <MasquesScene />;
    case "MATCHMAKING":
      return <MatchmakingScene />;
    case "BOARD":
      return <BoardScene />;
    default:
      return null;
  }
};

export default UISceneRoot;
