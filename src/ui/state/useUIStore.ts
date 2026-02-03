import { create } from "zustand";

export type UIScene =
  | "MAIN_MENU"
  | "WORLD_MAP"
  | "HERO_SELECT"
  | "DECK_SELECT"
  | "QUESTS"
  | "COLLECTION"
  | "DECK_BUILDER"
  | "STORE"
  | "INVENTORY"
  | "OPTIONS"
  | "PROFILE"
  | "HERO_PROFILE"
  | "ACHIEVEMENTS"
  | "CUSTOMIZE"
  | "MASQUES"
  | "MATCHMAKING"
  | "BOARD";

export type UIModal = "ASTRA_HELP";

type UIState = {
  scene: UIScene;
  modal: UIModal | null;
  transitionActive: boolean;
  pendingScene: UIScene | null;
  transitionKey: number;
  previousScene: UIScene | null;
  setScene: (scene: UIScene) => void;
  goBack: () => void;
  setModal: (modal: UIModal | null) => void;
  endTransition: (key?: number) => void;
};

const TRANSITION_FADE_IN_MS = 300;
let transitionTimer: number | null = null;

export const useUIStore = create<UIState>((set, get) => ({
  scene: "MAIN_MENU",
  modal: null,
  transitionActive: false,
  pendingScene: null,
  transitionKey: 0,
  previousScene: null,
  setScene: (scene) => {
    const { scene: currentScene, transitionKey } = get();
    if (scene === currentScene) return;
    if (transitionTimer) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }
    const nextKey = transitionKey + 1;
    set({
      transitionActive: true,
      pendingScene: scene,
      transitionKey: nextKey,
      previousScene: currentScene,
    });
    if (typeof window === "undefined") {
      set({ scene, pendingScene: null, transitionActive: false, previousScene: currentScene });
      return;
    }
    transitionTimer = window.setTimeout(() => {
      set({ scene, pendingScene: null });
    }, TRANSITION_FADE_IN_MS);
  },
  goBack: () => {
    const { previousScene } = get();
    if (previousScene) {
      get().setScene(previousScene);
      return;
    }
    get().setScene("MAIN_MENU");
  },
  setModal: (modal) => set({ modal }),
  endTransition: (key) =>
    set((state) => {
      if (!state.transitionActive) return state;
      if (typeof key === "number" && key !== state.transitionKey) return state;
      return { ...state, transitionActive: false };
    }),
}));
