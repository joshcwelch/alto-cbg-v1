export type PlayFlowFaction = {
  id: string;
  name: string;
  capitalId: string;
  capitalName: string;
};

export type PlayFlowHero = {
  id: string;
  name: string;
  epithet: string;
  powerName: string;
  factionId: string;
  portraitSrc?: string;
};

export type PlayFlowDeck = {
  id: string;
  name: string;
  heroId: string;
  cardCount: number;
};

export const playFlowFactions: PlayFlowFaction[] = [
  {
    id: "STORMCALLER",
    name: "Stormcaller",
    capitalId: "tempest-haven",
    capitalName: "Tempest Haven",
  },
  {
    id: "DAWNLIGHT",
    name: "Dawnlight",
    capitalId: "solspire",
    capitalName: "Solspire",
  },
  {
    id: "EMBER",
    name: "Ember",
    capitalId: "ashgate",
    capitalName: "Ashgate",
  },
  {
    id: "VOID",
    name: "Void",
    capitalId: "umbral-reach",
    capitalName: "Umbral Reach",
  },
];

export const playFlowHeroes: PlayFlowHero[] = [
  {
    id: "AERIA",
    name: "Aeria",
    epithet: "Stormweaver Adept",
    powerName: "Call the Tempest",
    factionId: "STORMCALLER",
  },
  {
    id: "KAEL",
    name: "Kael",
    epithet: "Skybreaker",
    powerName: "Stormbound Surge",
    factionId: "STORMCALLER",
  },
  {
    id: "SOLENE",
    name: "Solene",
    epithet: "Light of Dawn",
    powerName: "Radiant Guard",
    factionId: "DAWNLIGHT",
  },
  {
    id: "LYRA",
    name: "Lyra",
    epithet: "Voidbound Oracle",
    powerName: "Void Tithe",
    factionId: "VOID",
    portraitSrc: "/assets/heroes/lyra.png",
  },
  {
    id: "THAROS",
    name: "Tharos",
    epithet: "Ashbound Warlord",
    powerName: "Ember Command",
    factionId: "EMBER",
    portraitSrc: "/assets/heroes/tharos.png",
  },
  {
    id: "VARYA",
    name: "Varya",
    epithet: "Ember Vanguard",
    powerName: "Scorching Oath",
    factionId: "EMBER",
  },
];

export const playFlowDecks: PlayFlowDeck[] = [
  { id: "AERIA_SKYBORN", name: "Skyborn Charge", heroId: "AERIA", cardCount: 30 },
  { id: "AERIA_TEMPEST", name: "Tempest Chorus", heroId: "AERIA", cardCount: 30 },
  { id: "KAEL_HOWLING", name: "Howling Front", heroId: "KAEL", cardCount: 30 },
  { id: "KAEL_THUNDER", name: "Thunder Vow", heroId: "KAEL", cardCount: 30 },
  { id: "SOLENE_RADIANT", name: "Radiant Oath", heroId: "SOLENE", cardCount: 30 },
  { id: "SOLENE_SIGIL", name: "Sigil of Morning", heroId: "SOLENE", cardCount: 30 },
  { id: "LYRA_VOID_TIDE", name: "Void Tide", heroId: "LYRA", cardCount: 30 },
  { id: "LYRA_TITHE", name: "Tithe of Shadows", heroId: "LYRA", cardCount: 30 },
  { id: "THAROS_ASHEN", name: "Ashen Vanguard", heroId: "THAROS", cardCount: 30 },
  { id: "THAROS_CINDER", name: "Cinderborne", heroId: "THAROS", cardCount: 30 },
  { id: "VARYA_PYRE", name: "Pyre Covenant", heroId: "VARYA", cardCount: 30 },
  { id: "VARYA_FORGE", name: "Forgebound", heroId: "VARYA", cardCount: 30 },
];
