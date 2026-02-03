import type { Inventory, PackOpenResponse, Player, Quest, Session } from "../api/types";

type MockUser = {
  id: string;
  username: string;
  displayName: string;
  createdAtISO: string;
  passwordSalt: string;
  passwordHash: string;
};

const nowISO = () => new Date().toISOString();
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(16).slice(2);

function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const KEY_USERS = "mock_users";
const KEY_SESSION = "mock_session";

const keyPlayer = (userId: string) => `mock_user_${userId}_player`;
const keyInventory = (userId: string) => `mock_user_${userId}_inventory`;
const keyQuests = (userId: string) => `mock_user_${userId}_quests`;

const toHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
};

const simpleHash = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `fallback_${Math.abs(hash).toString(16)}`;
};

const randomSalt = (): string => {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
};

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const input = `${password}${salt}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return toHex(digest);
  }
  return simpleHash(input);
};

const DEFAULT_USERS = [
  { username: "JoshDoubleYou", displayName: "Josh", password: "1234" },
  { username: "Admin", displayName: "Admin", password: "2468" },
] as const;

export const db = {
  listUsers(): MockUser[] {
    return load<MockUser[]>(KEY_USERS, []);
  },

  listSafeUsers(): Array<{ id: string; username: string; displayName: string }> {
    return this.listUsers().map(({ id, username, displayName }) => ({ id, username, displayName }));
  },

  findUserByUsername(username: string): MockUser | null {
    const cleaned = username.trim().toLowerCase();
    if (!cleaned) return null;
    return this.listUsers().find((u) => u.username.toLowerCase() === cleaned) ?? null;
  },

  async ensureDefaultUsers(): Promise<void> {
    const users = this.listUsers();
    if (users.length > 0) return;
    const createdAtISO = nowISO();
    const seeded = await Promise.all(
      DEFAULT_USERS.map(async (entry) => {
        const passwordSalt = randomSalt();
        const passwordHash = await hashPassword(entry.password, passwordSalt);
        return {
          id: uid(),
          username: entry.username,
          displayName: entry.displayName,
          createdAtISO,
          passwordSalt,
          passwordHash,
        };
      })
    );
    save(KEY_USERS, seeded);
  },

  async verifyPassword(user: MockUser, password: string): Promise<boolean> {
    const nextHash = await hashPassword(password, user.passwordSalt);
    return nextHash === user.passwordHash;
  },

  setSession(userId: string): Session {
    const session: Session = { accessToken: uid(), userId };
    save(KEY_SESSION, session);
    return session;
  },

  clearSession() {
    localStorage.removeItem(KEY_SESSION);
  },

  getSession(): Session | null {
    return load<Session | null>(KEY_SESSION, null);
  },

  getUserIdFromAuthHeader(request: Request): string | null {
    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const session = this.getSession();
    return session?.userId ?? null;
  },

  ensureSeeded(userId: string) {
    const player = this.getPlayer(userId);
    if (!player) {
      const user = this.listUsers().find((u) => u.id === userId);
      const displayName = user?.displayName ?? "Player";
      this.setPlayer(userId, { id: userId, displayName, createdAtISO: user?.createdAtISO ?? nowISO() });
    }

    const inventory = this.getInventory(userId);
    if (!inventory) {
      this.setInventory(userId, { currency: { gold: 1234, shards: 50 }, cards: [] });
    }

    const quests = this.getQuests(userId);
    if (!quests || quests.length === 0) {
      this.setQuests(userId, [
        { questId: "d1", title: "Play 3 matches", progress: 1, goal: 3, isClaimable: false },
        { questId: "d2", title: "Play 3 games as Lyra", progress: 0, goal: 3, isClaimable: false },
        { questId: "d3", title: "Deal 100 damage", progress: 100, goal: 100, isClaimable: true },
        { questId: "w1", title: "Win 7 matches", progress: 0, goal: 7, isClaimable: false },
      ]);
    }
  },

  getPlayer(userId: string): Player | null {
    return load<Player | null>(keyPlayer(userId), null);
  },
  setPlayer(userId: string, p: Player) {
    save(keyPlayer(userId), p);
  },

  getInventory(userId: string): Inventory | null {
    return load<Inventory | null>(keyInventory(userId), null);
  },
  setInventory(userId: string, inv: Inventory) {
    save(keyInventory(userId), inv);
  },

  getQuests(userId: string): Quest[] {
    return load<Quest[]>(keyQuests(userId), []);
  },
  setQuests(userId: string, quests: Quest[]) {
    save(keyQuests(userId), quests);
  },

  openPack(userId: string): PackOpenResponse {
    const rollRarity = (): PackOpenResponse["results"][number]["rarity"] => {
      const r = Math.random();
      if (r < 0.75) return "common";
      if (r < 0.93) return "rare";
      if (r < 0.99) return "epic";
      return "legendary";
    };

    const results = Array.from({ length: 5 }).map(() => ({ cardId: uid(), rarity: rollRarity() }));

    const inv = this.getInventory(userId) ?? { currency: { gold: 0, shards: 0 }, cards: [] };
    for (const c of results) {
      const found = inv.cards.find((x) => x.cardId === c.cardId);
      if (found) found.qty += 1;
      else inv.cards.push({ cardId: c.cardId, qty: 1 });
    }
    this.setInventory(userId, inv);

    return { results, requestId: uid(), serverTimeISO: nowISO() };
  },

  claimQuest(userId: string, questId: string): Quest[] {
    const quests = this.getQuests(userId);
    const inventory = this.getInventory(userId) ?? { currency: { gold: 0, shards: 0 }, cards: [] };

    const nextQuests = quests.map((quest) => {
      if (quest.questId !== questId) return quest;
      if (!quest.isClaimable && quest.progress < quest.goal) return quest;
      const progress = Math.max(quest.progress, quest.goal);
      return { ...quest, progress, isClaimable: false };
    });

    const claimed = quests.find((quest) => quest.questId === questId);
    if (claimed && (claimed.isClaimable || claimed.progress >= claimed.goal)) {
      inventory.currency = {
        ...inventory.currency,
        gold: (inventory.currency?.gold ?? 0) + 50,
      };
      this.setInventory(userId, inventory);
    }

    this.setQuests(userId, nextQuests);
    return nextQuests;
  },
};
