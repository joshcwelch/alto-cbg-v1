export type PlayerId = "player" | "enemy";

export type SlamProfile = "LIGHT" | "HEAVY" | "LETHAL";

export type CardInstance = {
  id: string;
  cardId: string;
};

export type MinionInstance = {
  id: string;
  cardId: string;
  owner: PlayerId;
  attack: number;
  health: number;
  maxHealth: number;
  canAttack: boolean;
  summoningSick: boolean;
  taunt: boolean;
  lifesteal: boolean;
  stealth: boolean;
  shield: boolean;
  resilient: boolean;
  cloaked: boolean;
  berserkerBuffedThisTurn: boolean;
  deathrattle: "DRAW_CARD" | null;
  onAttackDrainHero: boolean;
};

export type HeroState = {
  id: "LYRA" | "THAROS";
  name: string;
  health: number;
  maxHealth: number;
  fatigue: number;
  heroPowerUsed: boolean;
};

export type PlayerState = {
  hero: HeroState;
  deck: string[];
  deckIndex: number;
  hand: CardInstance[];
  board: MinionInstance[];
  mana: number;
  maxMana: number;
};

export type TargetSpec =
  | { type: "HERO"; player: PlayerId }
  | { type: "MINION"; id: string; owner: PlayerId };

export type GameEvent =
  | { id: number; type: "TURN_STARTED"; payload: { player: PlayerId; turn: number } }
  | { id: number; type: "TURN_ENDED"; payload: { player: PlayerId; turn: number } }
  | { id: number; type: "CARD_DRAWN"; payload: { player: PlayerId; cardId: string } }
  | { id: number; type: "CARD_BURNED"; payload: { player: PlayerId; cardId: string } }
  | { id: number; type: "CARD_PLAYED"; payload: { player: PlayerId; cardId: string } }
  | {
      id: number;
      type: "ATTACK_DECLARED";
      payload: { player: PlayerId; attackerId: string; target: TargetSpec; slam: SlamProfile };
    }
  | {
      id: number;
      type: "DAMAGE_DEALT";
      payload: {
        source: { type: "ATTACK" | "SPELL" | "HERO_POWER" | "FATIGUE" | "OTHER" };
        target: TargetSpec;
        amount: number;
        slam?: SlamProfile;
      };
    }
  | { id: number; type: "MINION_DIED"; payload: { minionId: string; owner: PlayerId; slam?: SlamProfile } }
  | { id: number; type: "COMBAT_RESOLVED"; payload: { slam: SlamProfile } }
  | { id: number; type: "HERO_POWER_USED"; payload: { player: PlayerId; powerId: string } }
  | {
      id: number;
      type: "FATIGUE";
      payload: { player: PlayerId; amount: number };
    };

export type GameState = {
  turn: PlayerId;
  turnCounter: number;
  players: Record<PlayerId, PlayerState>;
  winner: PlayerId | null;
  log: GameEvent[];
  rngState: number;
  nextId: number;
  nextEventId: number;
};

export type Intent =
  | { type: "END_TURN"; player: PlayerId }
  | { type: "PLAY_CARD"; player: PlayerId; handId: string; target?: TargetSpec }
  | { type: "USE_HERO_POWER"; player: PlayerId; target?: TargetSpec }
  | { type: "DECLARE_ATTACK"; player: PlayerId; attackerId: string; target: TargetSpec };
