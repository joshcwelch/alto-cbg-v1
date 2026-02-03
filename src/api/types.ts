export type ID = string;

export type Session = {
  accessToken: string;
  userId: ID;
};

export type Player = {
  id: ID;
  displayName: string;
  createdAtISO: string;
};

export type Currency = {
  gold: number;
  shards: number;
};

export type InventoryCard = {
  cardId: ID;
  qty: number;
};

export type Inventory = {
  currency: Currency;
  cards: InventoryCard[];
};

export type PackOpenRequest = {
  packTypeId: ID;
};

export type PackCardResult = {
  cardId: ID;
  rarity: "common" | "rare" | "epic" | "legendary";
};

export type PackOpenResponse = {
  results: PackCardResult[];
  requestId: ID;
  serverTimeISO: string;
};

export type Quest = {
  questId: ID;
  title: string;
  progress: number;
  goal: number;
  isClaimable: boolean;
};
