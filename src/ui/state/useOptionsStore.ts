import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LanguageOption = "English" | "Spanish" | "French";

type OptionsState = {
  language: LanguageOption;
  screenShake: boolean;
  masterVolume: number;
  musicVolume: number;
  highQualityEffects: boolean;
  showAstraAssistant: boolean;
  setLanguage: (language: LanguageOption) => void;
  setScreenShake: (value: boolean) => void;
  setMasterVolume: (value: number) => void;
  setMusicVolume: (value: number) => void;
  setHighQualityEffects: (value: boolean) => void;
  setShowAstraAssistant: (value: boolean) => void;
};

const clampVolume = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set) => ({
      language: "English",
      screenShake: true,
      masterVolume: 85,
      musicVolume: 70,
      highQualityEffects: true,
      showAstraAssistant: true,
      setLanguage: (language) => set({ language }),
      setScreenShake: (value) => set({ screenShake: value }),
      setMasterVolume: (value) => set({ masterVolume: clampVolume(value) }),
      setMusicVolume: (value) => set({ musicVolume: clampVolume(value) }),
      setHighQualityEffects: (value) => set({ highQualityEffects: value }),
      setShowAstraAssistant: (value) => set({ showAstraAssistant: value }),
    }),
    {
      name: "alto-options",
    },
  ),
);
