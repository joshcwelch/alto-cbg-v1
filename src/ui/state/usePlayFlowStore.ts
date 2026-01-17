import { create } from "zustand";

export type MatchmakingState = "idle" | "searching" | "found";

type PlayFlowState = {
  selectedFactionId: string | null;
  selectedCityId: string | null;
  selectedHeroId: string | null;
  selectedDeckId: string | null;
  matchmakingState: MatchmakingState;
  enemyHeroId: string | null;
  setSelectedFactionId: (factionId: string | null) => void;
  clearSelectedFactionId: () => void;
  setSelectedCityId: (cityId: string | null) => void;
  clearSelectedCityId: () => void;
  setSelectedHeroId: (heroId: string | null) => void;
  clearSelectedHeroId: () => void;
  setSelectedDeckId: (deckId: string | null) => void;
  clearSelectedDeckId: () => void;
  setMatchmakingState: (state: MatchmakingState) => void;
  setEnemyHeroId: (heroId: string | null) => void;
  clearEnemyHeroId: () => void;
  resetAll: () => void;
};

const initialState = {
  selectedFactionId: null,
  selectedCityId: null,
  selectedHeroId: null,
  selectedDeckId: null,
  matchmakingState: "idle" as MatchmakingState,
  enemyHeroId: null,
};

export const usePlayFlowStore = create<PlayFlowState>((set) => ({
  ...initialState,
  setSelectedFactionId: (selectedFactionId) => set({ selectedFactionId }),
  clearSelectedFactionId: () => set({ selectedFactionId: null }),
  setSelectedCityId: (selectedCityId) => set({ selectedCityId }),
  clearSelectedCityId: () => set({ selectedCityId: null }),
  setSelectedHeroId: (selectedHeroId) => set({ selectedHeroId }),
  clearSelectedHeroId: () => set({ selectedHeroId: null }),
  setSelectedDeckId: (selectedDeckId) => set({ selectedDeckId }),
  clearSelectedDeckId: () => set({ selectedDeckId: null }),
  setMatchmakingState: (matchmakingState) => set({ matchmakingState }),
  setEnemyHeroId: (enemyHeroId) => set({ enemyHeroId }),
  clearEnemyHeroId: () => set({ enemyHeroId: null }),
  resetAll: () => set({ ...initialState }),
}));
