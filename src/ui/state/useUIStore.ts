import { create } from "zustand";

export type UIScene =
  | "MAIN_MENU"
  | "WORLD_MAP"
  | "HERO_SELECT"
  | "DECK_SELECT"
  | "QUESTS"
  | "COLLECTION"
  | "STORE"
  | "OPTIONS"
  | "PROFILE"
  | "HERO_PROFILE"
  | "MATCHMAKING"
  | "BOARD";

export type UIModal = "ASTRA_HELP";

type UIState = {
  scene: UIScene;
  modal: UIModal | null;
  setScene: (scene: UIScene) => void;
  setModal: (modal: UIModal | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  scene: "MAIN_MENU",
  modal: null,
  setScene: (scene) => set({ scene }),
  setModal: (modal) => set({ modal }),
}));
