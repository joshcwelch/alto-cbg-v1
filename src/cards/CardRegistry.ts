/* ==========================================================================

   █████╗ ██╗     ████████╗ ██████╗      ██████╗  █████╗ ██████╗ ██████╗
  ██╔══██╗██║     ╚══██╔══╝██╔═══██╗    ██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
  ███████║██║        ██║   ██║   ██║    ██║   ██║███████║██████╔╝██████╔╝
  ██╔══██║██║        ██║   ██║   ██║    ██║   ██║██╔══██║██╔══██╗██╔══██╗
  ██║  ██║███████╗   ██║   ╚██████╔╝    ╚██████╔╝██║  ██║██║  ██║██║  ██║
  ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝

   ALTO — CARD REGISTRY (Developer Mode Deluxe)
   - Single source of truth for all collectible cards
   - Strongly typed, with helper queries
   - Grouped by Faction with ASCII dividers
   - Comments include design intent & balance notes

   NOTE: StarterDecks will reference these IDs, so keep IDs stable.

   ========================================================================== */

/* ==========================================================================
   1) Types & Enums
   ========================================================================== */

export type Faction =
  | "CELESTIAL"
  | "EMBER"
  | "SYLVAN"
  | "VOIDBORN"
  | "GEARSPIRE"
  | "WILD";

export type Rarity = "BASIC" | "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type CardType = "MINION" | "SPELL"; // (extend later: WEAPON, LOCATION, etc.)

export interface Card {
  id: string;              // STABLE ID (UPPER_SNAKE)
  name: string;
  faction: Faction;
  type: CardType;
  cost: number;
  rarity: Rarity;

  // Minions
  attack?: number;
  health?: number;

  // Rules text (player-facing). Use {X} in text if dynamic later.
  text: string;

  // Optional metadata
  art?: string;            // public path to art asset (if available)
  tribe?: string;          // e.g., Beast, Construct, Spirit
  tags?: string[];         // e.g., ["Heal", "Burn", "Taunt", "Summon"]
  dev?: {
    intent?: string;       // design goals, niche, balance guardrails
    notes?: string;        // implementation reminders
  };
}

/* ==========================================================================
   2) Helpers
   ========================================================================== */

/** Quick factory helpers to reduce boilerplate & help consistency */
function spell(
  id: string,
  name: string,
  faction: Faction,
  cost: number,
  rarity: Rarity,
  text: string,
  extra?: Partial<Card>
): Card {
  return { id, name, faction, type: "SPELL", cost, rarity, text, ...extra };
}

function minion(
  id: string,
  name: string,
  faction: Faction,
  cost: number,
  rarity: Rarity,
  attack: number,
  health: number,
  text: string,
  extra?: Partial<Card>
): Card {
  return {
    id,
    name,
    faction,
    type: "MINION",
    cost,
    rarity,
    attack,
    health,
    text,
    ...extra,
  };
}

/* ==========================================================================
   3) Registry: Cards by ID
   - Keep IDs unique and stable (used in decks, saves, replays).
   - Art paths are placeholders; swap as your assets land.
   ========================================================================== */

export const CardRegistry: Record<string, Card> = {
  /* ------------------------------------------------------------------------
     CELESTIAL ORDER — Radiance, healing, shields, precision beams
     Identity: Sustain, buffs, controlled removal, light-as-resource flavor
     ------------------------------------------------------------------------ */
  CELESTIAL_RADIANT_BARRIER: spell(
    "CELESTIAL_RADIANT_BARRIER",
    "Radiant Barrier",
    "CELESTIAL",
    1,
    "BASIC",
    "Give a friendly unit +2 Health this turn. Draw a card if it survives.",
    {
      tags: ["Buff", "Heal"],
      dev: { intent: "Cheap stabilize; cantrip if used smartly." },
    }
  ),

  CELESTIAL_BLESSING_OF_ALTLIGHT: spell(
    "CELESTIAL_BLESSING_OF_ALTLIGHT",
    "Blessing of Altlight",
    "CELESTIAL",
    2,
    "BASIC",
    "Restore 3 Health. If it overheals, grant +1/+1 to that unit.",
    { tags: ["Heal", "Buff"] }
  ),

  CELESTIAL_CRYSTAL_ACOLYTE: minion(
    "CELESTIAL_CRYSTAL_ACOLYTE",
    "Crystal Acolyte",
    "CELESTIAL",
    2,
    "COMMON",
    2,
    3,
    "Battlecry: Restore 2 Health to your hero.",
    { tags: ["Heal"], tribe: "Acolyte" }
  ),

  CELESTIAL_LIGHTBORN_ADEPT: minion(
    "CELESTIAL_LIGHTBORN_ADEPT",
    "Lightborn Adept",
    "CELESTIAL",
    3,
    "COMMON",
    3,
    3,
    "Whenever you restore Health, gain +1 Attack this turn.",
    { tags: ["Heal", "Tempo"] }
  ),

  CELESTIAL_DAWNWATCH_CLERIC: minion(
    "CELESTIAL_DAWNWATCH_CLERIC",
    "Dawnwatch Cleric",
    "CELESTIAL",
    3,
    "COMMON",
    2,
    4,
    "Your healing effects restore +1 additional Health.",
    { tags: ["Heal", "Aura"], tribe: "Cleric" }
  ),

  CELESTIAL_ALTIGHT_SPARKCASTER: minion(
    "CELESTIAL_ALTIGHT_SPARKCASTER",
    "Altlight Sparkcaster",
    "CELESTIAL",
    4,
    "RARE",
    3,
    5,
    "Spellweave: Your next spell this turn costs (1) less.",
    { tags: ["Spellweave", "Discount"] }
  ),

  CELESTIAL_JUDGMENT_BEAM: spell(
    "CELESTIAL_JUDGMENT_BEAM",
    "Judgment Beam",
    "CELESTIAL",
    4,
    "RARE",
    "Deal 4 damage. If it kills a unit, restore 2 Health to your hero.",
    { tags: ["Removal", "Heal"] }
  ),

  CELESTIAL_COVENANT_SEAL: spell(
    "CELESTIAL_COVENANT_SEAL",
    "Covenant Seal",
    "CELESTIAL",
    5,
    "EPIC",
    "Give a friendly unit +2/+4 and 'Shield: Ignore the next damage instance.'",
    { tags: ["Buff", "Shield"], dev: { intent: "Big midgame stabilizer." } }
  ),

  CELESTIAL_GUARDIAN_OF_PEAKS: minion(
    "CELESTIAL_GUARDIAN_OF_PEAKS",
    "Guardian of Peaks",
    "CELESTIAL",
    6,
    "EPIC",
    5,
    7,
    "Taunt. When this is healed, deal 1 damage to a random enemy.",
    { tags: ["Taunt", "Heal", "Punish"], tribe: "Guardian" }
  ),

  /* ------------------------------------------------------------------------
     EMBER CROWN — Aggression, burn, molten shields, volatile rituals
     Identity: Direct damage, impactful battlecries, fragile high damage units
     ------------------------------------------------------------------------ */
  EMBER_EMBER_BOLT: spell(
    "EMBER_EMBER_BOLT",
    "Ember Bolt",
    "EMBER",
    1,
    "BASIC",
    "Deal 2 damage.",
    { tags: ["Burn"] }
  ),

  EMBER_LAVA_IMP: minion(
    "EMBER_LAVA_IMP",
    "Lava Imp",
    "EMBER",
    1,
    "COMMON",
    2,
    1,
    "Battlecry: Deal 1 damage to your hero.",
    { tags: ["Burn", "Aggro"], tribe: "Demon" }
  ),

  EMBER_EMBERFORGED_BERSERKER: minion(
    "EMBER_EMBERFORGED_BERSERKER",
    "Emberforged Berserker",
    "EMBER",
    3,
    "COMMON",
    4,
    3,
    "After your hero takes damage, gain +1 Attack (once per turn).",
    { tags: ["Aggro", "Self-Burn"], tribe: "Warrior" }
  ),

  EMBER_FIRESTORM_RITUAL: spell(
    "EMBER_FIRESTORM_RITUAL",
    "Firestorm Ritual",
    "EMBER",
    4,
    "RARE",
    "Deal 2 damage to all minions. If any die, refresh (1) Mana.",
    { tags: ["AOE", "Burn", "Ramp"] }
  ),

  EMBER_MOLTEN_SHIELD: spell(
    "EMBER_MOLTEN_SHIELD",
    "Molten Shield",
    "EMBER",
    2,
    "COMMON",
    "Give a unit +2 Health and 'Deal 1 damage to a random enemy when hit.'",
    { tags: ["Buff", "Punish"] }
  ),

  EMBER_CROWN_OF_ASH: spell(
    "EMBER_CROWN_OF_ASH",
    "Crown of Ash",
    "EMBER",
    5,
    "EPIC",
    "Choose a unit. Deal damage to it equal to the number of spells you've cast this game (max 6).",
    { tags: ["Removal", "Scaling"] }
  ),

  EMBER_VOLCANO_TITAN: minion(
    "EMBER_VOLCANO_TITAN",
    "Volcano Titan",
    "EMBER",
    7,
    "LEGENDARY",
    7,
    7,
    "Battlecry: Deal 2 damage to all other minions. Overkill: Repeat once.",
    { tags: ["AOE", "Legendary"], tribe: "Giant" }
  ),

  /* ------------------------------------------------------------------------
     SYLVAN KIN — Beasts, regrowth, board-centric buffs, nature control
     Identity: Wide boards, healing-over-time, efficient taunts
     ------------------------------------------------------------------------ */
  SYLVAN_ELDERWOOD_WOLF: minion(
    "SYLVAN_ELDERWOOD_WOLF",
    "Elderwood Wolf",
    "SYLVAN",
    1,
    "BASIC",
    1,
    2,
    "Pack: If you control another Beast, gain +1/+0.",
    { tags: ["Beast", "Tribal"], tribe: "Beast" }
  ),

  SYLVAN_VERDANT_PROTECTOR: minion(
    "SYLVAN_VERDANT_PROTECTOR",
    "Verdant Protector",
    "SYLVAN",
    3,
    "COMMON",
    2,
    4,
    "Taunt. After you summon a Beast, restore 1 Health to it.",
    { tags: ["Taunt", "Heal"], tribe: "Guardian" }
  ),

  SYLVAN_SILVERFANG: minion(
    "SYLVAN_SILVERFANG",
    "Silverfang",
    "SYLVAN",
    4,
    "RARE",
    3,
    3,
    "Stealth. After this attacks, give another friendly Beast +1/+1.",
    { tags: ["Beast", "Buff"], tribe: "Beast" }
  ),

  SYLVAN_FORESTS_BLESSING: spell(
    "SYLVAN_FORESTS_BLESSING",
    "Forest's Blessing",
    "SYLVAN",
    2,
    "COMMON",
    "Give your units +1 Health. Draw a Beast.",
    { tags: ["Buff", "Tribal"] }
  ),

  SYLVAN_ROOTSNARL_GUARDIAN: minion(
    "SYLVAN_ROOTSNARL_GUARDIAN",
    "Rootsnarl Guardian",
    "SYLVAN",
    5,
    "EPIC",
    3,
    6,
    "Taunt. Deathrattle: Summon a 2/3 Treant with Taunt.",
    { tags: ["Taunt", "Deathrattle"], tribe: "Treant" }
  ),

  /* ------------------------------------------------------------------------
     VOIDBORN — Drains, debuffs, disruptive tempo, corrupting value
     Identity: Lifesteal, discard/sacrifice, void synergies, removal with downsides
     ------------------------------------------------------------------------ */
  VOID_HUSKCALLER: minion(
    "VOID_HUSKCALLER",
    "Huskcaller",
    "VOIDBORN",
    1,
    "BASIC",
    1,
    2,
    "Lifesteal.",
    { tags: ["Lifesteal"], tribe: "Cultist" }
  ),

  VOID_SHARDLANDS_WRAITH: minion(
    "VOID_SHARDLANDS_WRAITH",
    "Shardlands Wraith",
    "VOIDBORN",
    2,
    "COMMON",
    2,
    2,
    "Deathrattle: Give a random friendly unit +1 Health.",
    { tags: ["Deathrattle", "Tempo"], tribe: "Spirit" }
  ),

  VOID_MATRONS_GRIMOIRE: spell(
    "VOID_MATRONS_GRIMOIRE",
    "Matron’s Grimoire",
    "VOIDBORN",
    3,
    "RARE",
    "Draw 2 cards. Then discard the lowest-cost card in your hand.",
    { tags: ["Draw", "Discard"], dev: { intent: "Pushes void-risk, void-reward." } }
  ),

  VOID_ABYSSBOUND_SPECTER: minion(
    "VOID_ABYSSBOUND_SPECTER",
    "Abyssbound Specter",
    "VOIDBORN",
    4,
    "RARE",
    3,
    4,
    "Steal 1 Health from the enemy hero whenever this attacks.",
    { tags: ["Lifesteal", "Chip"], tribe: "Spirit" }
  ),

  VOID_DARK_CONVERSION: spell(
    "VOID_DARK_CONVERSION",
    "Dark Conversion",
    "VOIDBORN",
    5,
    "EPIC",
    "Destroy a damaged unit. Restore 2 Health to your hero.",
    { tags: ["Removal", "Heal"] }
  ),

  /* ------------------------------------------------------------------------
     GEARSPIRE RAIDERS — Mechs, value chains, cog synergies, explosives
     Identity: Token mechs, modular buffs, direct cannon damage
     ------------------------------------------------------------------------ */
  GEAR_SPIRE_STEAM_CLOAK: spell(
    "GEAR_SPIRE_STEAM_CLOAK",
    "Steam Cloak",
    "GEARSPIRE",
    1,
    "BASIC",
    "Give a unit +1 Health and Cloak (untargetable) until your next turn.",
    { tags: ["Buff", "Protection"] }
  ),

  GEAR_SPIRE_SCRAPLING_CREW: minion(
    "GEAR_SPIRE_SCRAPLING_CREW",
    "Scrapling Crew",
    "GEARSPIRE",
    2,
    "COMMON",
    2,
    2,
    "Battlecry: Summon a 1/1 Scrapling.",
    { tags: ["Token"], tribe: "Construct" }
  ),

  GEAR_SPIRE_COGBLADE_MARAUDER: minion(
    "GEAR_SPIRE_COGBLADE_MARAUDER",
    "Cogblade Marauder",
    "GEARSPIRE",
    3,
    "COMMON",
    3,
    3,
    "Whenever a friendly Construct dies, gain +1 Attack this turn.",
    { tags: ["Synergy"], tribe: "Rogue" }
  ),

  GEAR_SPIRE_TECHBURST: spell(
    "GEAR_SPIRE_TECHBURST",
    "Techburst",
    "GEARSPIRE",
    3,
    "RARE",
    "Deal 2 damage. If you control a Construct, deal 3 instead.",
    { tags: ["Removal", "Synergy"] }
  ),

  GEAR_SPIRE_IRONHOWL_CANNONEER: minion(
    "GEAR_SPIRE_IRONHOWL_CANNONEER",
    "Ironhowl Cannoneer",
    "GEARSPIRE",
    4,
    "RARE",
    4,
    4,
    "Battlecry: Deal 1 damage to all enemies.",
    { tags: ["AOE"], tribe: "Pirate" }
  ),

  GEAR_SPIRE_GEARSPIRE_COLOSSUS: minion(
    "GEAR_SPIRE_GEARSPIRE_COLOSSUS",
    "Gearspire Colossus",
    "GEARSPIRE",
    7,
    "LEGENDARY",
    7,
    8,
    "Taunt. Deathrattle: Summon two 2/2 Constructs.",
    { tags: ["Taunt", "Deathrattle"], tribe: "Construct" }
  ),

  /* ------------------------------------------------------------------------
     WILD / NEUTRAL — Flexible tools, light tribal support, utility minions
     ------------------------------------------------------------------------ */
  WILD_NOMAD_TRADER: minion(
    "WILD_NOMAD_TRADER",
    "Nomad Trader",
    "WILD",
    2,
    "COMMON",
    2,
    3,
    "Battlecry: Swap a card in your hand with a random card from your deck.",
    { tags: ["Cycle", "RNG"], tribe: "Trader" }
  ),

  WILD_BATTLEFIELD_MEDIC: minion(
    "WILD_BATTLEFIELD_MEDIC",
    "Battlefield Medic",
    "WILD",
    3,
    "COMMON",
    2,
    4,
    "Battlecry: Restore 2 Health to a unit and 1 to your hero.",
    { tags: ["Heal"], tribe: "Healer" }
  ),

  WILD_SHARDFORGED_GOLEM: minion(
    "WILD_SHARDFORGED_GOLEM",
    "Shardforged Golem",
    "WILD",
    4,
    "RARE",
    4,
    5,
    "If you spent 3+ Mana on spells this turn, gain +1/+1.",
    { tags: ["Synergy", "Spellweave"], tribe: "Construct" }
  ),

  WILD_FLAMEBORN_TRIAL: spell(
    "WILD_FLAMEBORN_TRIAL",
    "Flameborn Trial",
    "WILD",
    4,
    "RARE",
    "Give your units +1 Attack this turn. If you control 3+ units, also give them +1 Health.",
    { tags: ["Buff", "Wide"] }
  ),

  WILD_ASHPIRE_PILGRIM: minion(
    "WILD_ASHPIRE_PILGRIM",
    "Ashspire Pilgrim",
    "WILD",
    2,
    "COMMON",
    2,
    2,
    "Resilient (cannot be reduced below 1 Health during your turn).",
    { tags: ["Resilient"], tribe: "Pilgrim" }
  ),
};

/* ==========================================================================
   3B) Registry: Hero Powers (by ID)
   - These are NOT collectible cards (do not include in decks directly).
   - IDs are referenced by Hero definitions & UI.
   - Keep IDs stable (art, saves, tutorials).
   ========================================================================== */

export type HeroId = "LYRA" | "THAROS";

export interface HeroPower {
  id: string;              // STABLE ID (UPPER_SNAKE)
  heroId: HeroId;
  name: string;            // Keep name stable (art is tied to it)
  faction: Faction;
  cost: number;
  text: string;
  art?: string;
  tags?: string[];
  dev?: {
    intent?: string;
    notes?: string;
  };
}

function heroPower(
  id: string,
  heroId: HeroId,
  name: string,
  faction: Faction,
  cost: number,
  text: string,
  extra?: Partial<HeroPower>
): HeroPower {
  return { id, heroId, name, faction, cost, text, ...extra };
}

export const HeroPowers: Record<string, HeroPower> = {
  /* ------------------------------------------------------------------------
     LYRA (VOIDBORN) — Hero Power: Void Tithe
     Identity: Controlled sacrifice, inevitability, restraint (value at a cost)
     ------------------------------------------------------------------------ */
  LYRA_VOID_TITHE: heroPower(
    "LYRA_VOID_TITHE",
    "LYRA",
    "Void Tithe",
    "VOIDBORN",
    2,
    "Destroy a friendly minion. Draw a card.",
    {
      tags: ["Sacrifice", "Draw"],
      dev: {
        intent:
          "Repeatable card advantage gated behind board investment. Enables Voidborn sacrifice lines without raw tempo.",
        notes:
          "Engine: pick friendly minion target; destroy; then draw 1. If no valid target, hero power cannot be used.",
      },
    }
  ),

  /* ------------------------------------------------------------------------
     THAROS (EMBER) — Hero Power: Ember Command
     Identity: Pressure + tactical burn; rewards precision without free tempo
     ------------------------------------------------------------------------ */
  THAROS_EMBER_COMMAND: heroPower(
    "THAROS_EMBER_COMMAND",
    "THAROS",
    "Ember Command",
    "EMBER",
    2,
    "Deal 1 damage to a minion. If it dies, refresh (1) Mana.",
    {
      tags: ["Damage", "Tempo"],
      dev: {
        intent:
          "A measured, repeatable ping that can convert into small tempo when used as a finisher—without enabling infinite chains.",
        notes:
          "Engine: target must be a minion. If damage causes death, immediately restore 1 current-turn mana (cap at max).",
      },
    }
  ),
};

/* ==========================================================================
   4) Convenient Views: by Faction / by Rarity
   ========================================================================== */

export const CardsByFaction: Record<Faction, Card[]> = {
  CELESTIAL: [],
  EMBER: [],
  SYLVAN: [],
  VOIDBORN: [],
  GEARSPIRE: [],
  WILD: [],
};

// populate views
for (const card of Object.values(CardRegistry)) {
  CardsByFaction[card.faction].push(card);
}

export const CardsByRarity: Record<Rarity, Card[]> = {
  BASIC: [],
  COMMON: [],
  RARE: [],
  EPIC: [],
  LEGENDARY: [],
};

for (const card of Object.values(CardRegistry)) {
  CardsByRarity[card.rarity].push(card);
}

/* ==========================================================================
   5) Query Helpers — keep the rest of the app clean
   ========================================================================== */

export function getCard(id: string): Card | undefined {
  return CardRegistry[id];
}

export function listAllCards(): Card[] {
  return Object.values(CardRegistry);
}

export function listFaction(faction: Faction): Card[] {
  return CardsByFaction[faction] ?? [];
}

export function listByRarity(rarity: Rarity): Card[] {
  return CardsByRarity[rarity] ?? [];
}

/* ==========================================================================
   5B) Hero Power Helpers
   ========================================================================== */

export function getHeroPower(id: string): HeroPower | undefined {
  return HeroPowers[id];
}

export function getHeroPowerFor(heroId: HeroId): HeroPower | undefined {
  return Object.values(HeroPowers).find((p) => p.heroId === heroId);
}

/* ==========================================================================
   6) Dev Notes
   - Keep text short, flavorful, and readable.
   - Balance passes:
       • BASIC/Common = bread & butter; power budget lower
       • Rare = synergy payoff / flexible tools
       • Epic = splashy, board-swinging effects with constraints
       • Legendary = build-arounds or iconic finishers
   - Guardrails:
       • Celestial: healing/buffs + clean removal, limited burst
       • Ember: burn/aggro; careful with unconditional draw
       • Sylvan: beasts & sustain; AOE limited to treant lines
       • Voidborn: drain/discard; removal often requires setup
       • Gearspire: tokens/constructs; explosive but interactable
       • Wild: neutral glue, light synergy; avoid class identity theft
   ========================================================================== */
