import { useCallback, useEffect, useMemo, useState } from "react";

export type ScreenId =
  | "loading"
  | "menu"
  | "board"
  | "collection"
  | "decks"
  | "profile"
  | "settings";

const SCREEN_STORAGE_KEY = "alto:last-screen";
const NON_LOADING_SCREENS: ScreenId[] = ["menu", "board", "collection", "decks", "profile", "settings"];

const isScreenId = (value: string | null): value is ScreenId =>
  !!value && (["loading", ...NON_LOADING_SCREENS] as ScreenId[]).includes(value as ScreenId);

const getStoredScreen = (): ScreenId => {
  if (typeof window === "undefined") return "menu";
  const raw = window.localStorage.getItem(SCREEN_STORAGE_KEY);
  if (!isScreenId(raw)) return "menu";
  return raw === "board" ? "menu" : raw;
};

const persistScreen = (screen: ScreenId) => {
  if (typeof window === "undefined") return;
  const safeScreen = screen === "board" ? "menu" : screen;
  window.localStorage.setItem(SCREEN_STORAGE_KEY, safeScreen);
};

export type ScreenNav = {
  current: ScreenId;
  history: ScreenId[];
  canBack: boolean;
  push: (screen: ScreenId) => void;
  replace: (screen: ScreenId) => void;
  back: () => void;
  lastNonLoading: ScreenId;
  storedScreen: ScreenId;
};

export const useScreenNav = (initialScreen: ScreenId = "loading"): ScreenNav => {
  const [history, setHistory] = useState<ScreenId[]>([initialScreen]);
  const [lastNonLoading, setLastNonLoading] = useState<ScreenId>(getStoredScreen());

  const current = history[history.length - 1];
  const canBack = history.length > 1;
  const storedScreen = useMemo(() => getStoredScreen(), []);

  const push = useCallback((screen: ScreenId) => {
    setHistory((prev) => [...prev, screen]);
  }, []);

  const replace = useCallback((screen: ScreenId) => {
    setHistory((prev) => [...prev.slice(0, -1), screen]);
  }, []);

  const back = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  useEffect(() => {
    if (current !== "loading") {
      setLastNonLoading(current);
      persistScreen(current);
    }
  }, [current]);

  return {
    current,
    history,
    canBack,
    push,
    replace,
    back,
    lastNonLoading,
    storedScreen,
  };
};
