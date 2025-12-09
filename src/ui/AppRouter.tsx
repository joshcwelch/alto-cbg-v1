import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import Board from "./Board";
import LoadingScene from "./scenes/LoadingScene";
import MainMenuScene from "./scenes/MainMenuScene";
import FactionSelectScene from "./scenes/FactionSelectScene";
import HeroSelectScene from "./scenes/HeroSelectScene";
import HeroMenuScene from "./scenes/HeroMenuScene";
import DeckManagementScene from "./scenes/DeckManagementScene";
import CollectionScene from "./scenes/CollectionScene";
import HeroDeckListScene from "./scenes/HeroDeckListScene";
import { HeroId } from "../game/heroes/heroTypes";
import { HERO_REGISTRY } from "../game/heroes/heroRegistry";
import { getProfile } from "../game/profile/playerProfile";

type RouteMatch =
  | { name: "loading" }
  | { name: "main-menu" }
  | { name: "select-faction" }
  | { name: "select-hero"; params: { id: string } }
  | { name: "hero-menu"; params: { heroId: HeroId } }
  | { name: "manage-decks"; params: { heroId: HeroId } }
  | { name: "collection" }
  | { name: "hero-decks"; params: { heroId: HeroId } }
  | { name: "match" };

type RouterContextValue = {
  path: string;
  navigate: (path: string) => void;
};

const RouterContext = createContext<RouterContextValue>({ path: "/loading", navigate: () => undefined });

export const useAppNavigation = () => useContext(RouterContext);

const parseRoute = (path: string): RouteMatch => {
  const clean = path || "/loading";
  if (clean.startsWith("/hero-menu/")) {
    const heroId = clean.replace("/hero-menu/", "") as HeroId;
    return { name: "hero-menu", params: { heroId } };
  }
  if (clean.startsWith("/manage-decks/")) {
    const heroId = clean.replace("/manage-decks/", "") as HeroId;
    return { name: "manage-decks", params: { heroId } };
  }
  if (clean.startsWith("/hero-decks/")) {
    const heroId = clean.replace("/hero-decks/", "") as HeroId;
    return { name: "hero-decks", params: { heroId } };
  }
  if (clean.startsWith("/select-hero/")) {
    const id = decodeURIComponent(clean.replace("/select-hero/", ""));
    return { name: "select-hero", params: { id } };
  }
  if (clean === "/main-menu") return { name: "main-menu" };
  if (clean === "/select-faction") return { name: "select-faction" };
  if (clean === "/collection") return { name: "collection" };
  if (clean === "/match") return { name: "match" };
  return { name: "loading" };
};

export default function AppRouter() {
  const [path, setPath] = useState<string>(window.location.pathname || "/loading");

  const navigate = useCallback(
    (nextPath: string) => {
      if (nextPath === path) return;
      window.history.pushState({}, "", nextPath);
      setPath(nextPath);
    },
    [path]
  );

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const match = useMemo(() => parseRoute(path), [path]);
  const profile = getProfile();
  const currentHeroId = profile.selectedHeroId ?? HeroId.VOID_LYRA;

  let screen: ReactNode = null;
  switch (match.name) {
    case "loading":
      screen = <LoadingScene onContinue={() => navigate("/main-menu")} />;
      break;
    case "main-menu":
      screen = <MainMenuScene onPlay={() => navigate("/select-faction")} />;
      break;
    case "select-faction":
      screen = <FactionSelectScene onSelect={id => navigate(`/select-hero/${encodeURIComponent(id)}`)} />;
      break;
    case "select-hero":
      screen = (
        <HeroSelectScene
          factionId={match.params.id}
          onSelectHero={heroId => navigate(`/hero-menu/${heroId}`)}
          onBack={() => navigate("/select-faction")}
        />
      );
      break;
    case "hero-menu":
      screen = (
        <HeroMenuScene
          heroId={match.params.heroId}
          onManageDecks={heroId => navigate(`/manage-decks/${heroId}`)}
          onViewCollection={() => navigate("/collection")}
          onViewDecks={heroId => navigate(`/hero-decks/${heroId}`)}
          onFindMatch={() => navigate("/match")}
          onBack={() => navigate(`/select-hero/${HERO_REGISTRY[match.params.heroId]?.faction ?? "Voidborn"}`)}
        />
      );
      break;
    case "manage-decks":
      screen = <DeckManagementScene heroId={match.params.heroId} onBack={() => navigate(`/hero-menu/${match.params.heroId}`)} />;
      break;
    case "collection":
      screen = <CollectionScene onBack={() => navigate(`/hero-menu/${currentHeroId}`)} />;
      break;
    case "hero-decks":
      screen = <HeroDeckListScene heroId={match.params.heroId} onBack={() => navigate(`/hero-menu/${match.params.heroId}`)} />;
      break;
    case "match":
      screen = <Board />;
      break;
  }

  return <RouterContext.Provider value={{ path, navigate }}>{screen}</RouterContext.Provider>;
}
