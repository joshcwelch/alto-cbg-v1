import { create } from "zustand";
import { api } from "../../api";
import type { Inventory, PackOpenResponse, Player, Quest, Session } from "../../api/types";

const STORAGE_SESSION_KEY = "mock_session";
const STORAGE_ACCESS_TOKEN_KEY = "accessToken";
const STORAGE_USER_ID_KEY = "userId";

type AuthStatus = "checking" | "logged_out" | "logged_in";

type AccountState = {
  authStatus: AuthStatus;
  session: Session | null;
  player: Player | null;
  inventory: Inventory | null;
  quests: Quest[];
  questsStatus: "idle" | "loading" | "error";
  questsError?: string;
  authError?: string;
  claimQuestId?: string;

  hydrateSession: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  claimQuest: (questId: string) => Promise<void>;
  openPack: (packTypeId: string) => Promise<PackOpenResponse>;
};

const readStoredSession = (): Session | null => {
  const raw = localStorage.getItem(STORAGE_SESSION_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }
  const accessToken = localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY);
  const userId = localStorage.getItem(STORAGE_USER_ID_KEY);
  if (accessToken && userId) {
    return { accessToken, userId };
  }
  return null;
};

const writeStoredSession = (session: Session) => {
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(STORAGE_USER_ID_KEY, session.userId);
};

const clearStoredSession = () => {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_ID_KEY);
};

export const useAccountStore = create<AccountState>((set, get) => ({
  authStatus: "checking",
  session: null,
  player: null,
  inventory: null,
  quests: [],
  questsStatus: "idle",
  questsError: undefined,
  authError: undefined,
  claimQuestId: undefined,

  hydrateSession: async () => {
    const session = readStoredSession();
    if (!session) {
      set({ authStatus: "logged_out", session: null });
      return;
    }
    writeStoredSession(session);
    set({ authStatus: "logged_in", session });
    await get().refreshAll();
  },

  login: async (username, password) => {
    set({ authError: undefined });
    try {
      const session = await api.auth.login(username, password);
      writeStoredSession(session);
      set({ authStatus: "logged_in", session, authError: undefined });
      await get().refreshAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      if (message.includes("API 401")) {
        set({ authStatus: "logged_out", authError: "Invalid username or password" });
        return;
      }
      set({ authStatus: "logged_out", authError: message });
    }
  },

  logout: async () => {
    await api.auth.logout();
    clearStoredSession();
    set({
      authStatus: "logged_out",
      session: null,
      player: null,
      inventory: null,
      quests: [],
      questsStatus: "idle",
      questsError: undefined,
      authError: undefined,
      claimQuestId: undefined,
    });
  },

  refreshAll: async () => {
    try {
      set({ questsStatus: "loading", questsError: undefined });
      const [player, inventory, quests] = await Promise.all([
        api.player.getMe(),
        api.inventory.getInventory(),
        api.quests.getQuests(),
      ]);
      set({ player, inventory, quests, questsStatus: "idle", questsError: undefined });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      set({ questsStatus: "error", questsError: message });
    }
  },

  refreshQuests: async () => {
    try {
      set({ questsStatus: "loading", questsError: undefined });
      const quests = await api.quests.getQuests();
      set({ quests, questsStatus: "idle", questsError: undefined });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      set({ questsStatus: "error", questsError: message });
    }
  },

  claimQuest: async (questId) => {
    set({ claimQuestId: questId });
    try {
      await api.quests.claimQuest(questId);
      await get().refreshAll();
    } finally {
      set({ claimQuestId: undefined });
    }
  },

  openPack: async (packTypeId) => {
    const resp = await api.packs.openPack({ packTypeId });
    await get().refreshAll();
    return resp;
  },
}));
