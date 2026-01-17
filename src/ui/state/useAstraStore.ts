import { create } from "zustand";
import type { UIScene } from "./useUIStore";

type CoachmarkPayload = {
  id: string;
  text: string;
  ctaLabel?: string;
};

type AstraContext = {
  scene: UIScene;
  routeMeta?: unknown;
};

type AstraState = {
  isOpen: boolean;
  coachmark: CoachmarkPayload | null;
  context: AstraContext | null;
  lastSeenCoachmarks: string[];
  open: () => void;
  close: () => void;
  showCoachmark: (payload: CoachmarkPayload) => void;
  dismissCoachmark: () => void;
  setContext: (context: AstraContext) => void;
};

const STORAGE_KEY = "astra:lastSeenCoachmarks";

const loadSeenCoachmarks = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
};

const persistSeenCoachmarks = (ids: string[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore localStorage failures.
  }
};

export const useAstraStore = create<AstraState>((set, get) => ({
  isOpen: false,
  coachmark: null,
  context: null,
  lastSeenCoachmarks: loadSeenCoachmarks(),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  showCoachmark: (payload) => {
    const { lastSeenCoachmarks } = get();
    if (lastSeenCoachmarks.includes(payload.id)) return;
    set({ coachmark: payload });
  },
  dismissCoachmark: () => {
    const current = get().coachmark;
    if (!current) return set({ coachmark: null });
    const nextSeen = Array.from(new Set([...get().lastSeenCoachmarks, current.id]));
    persistSeenCoachmarks(nextSeen);
    set({ coachmark: null, lastSeenCoachmarks: nextSeen });
  },
  setContext: (context) => set({ context }),
}));
