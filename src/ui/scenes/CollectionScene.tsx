import { useEffect, useMemo, useState } from "react";
import { useUIStore } from "../state/useUIStore";

type CollectionTab = "DECK_BUILDER" | "COLLECTION";

type CardRarity = "Legendary" | "Common";

type Card = {
  id: number;
  mana: number;
  name: string;
  rarity?: CardRarity;
};

type DeckEntry = {
  cardId: number;
  count: number;
};

type Deck = {
  id: number;
  name: string;
  heroClass: string;
  cards: DeckEntry[];
};

const deckMax = 30;
const storageKey = "collection:lastTab";

const cardCatalog: Card[] = [
  { id: 1, mana: 1, name: "Lightning Bolt" },
  { id: 2, mana: 2, name: "Chain Lightning" },
  { id: 3, mana: 3, name: "Call the Storm" },
  { id: 4, mana: 1, name: "Gale Courier" },
  { id: 5, mana: 4, name: "Tempest Guard" },
  { id: 6, mana: 2, name: "Storm Totem" },
  { id: 7, mana: 3, name: "Raincaller" },
  { id: 8, mana: 5, name: "Thunder Drake" },
  { id: 9, mana: 6, name: "Skybound Sage" },
  { id: 10, mana: 7, name: "Eye of the Storm", rarity: "Legendary" },
  { id: 11, mana: 4, name: "Arc Surge" },
  { id: 12, mana: 3, name: "Wind Lash" },
];

const mockDecks: Deck[] = [
  {
    id: 101,
    name: "Stormcaller",
    heroClass: "Stormcaller",
    cards: [
      { cardId: 1, count: 2 },
      { cardId: 2, count: 2 },
      { cardId: 3, count: 2 },
      { cardId: 4, count: 2 },
      { cardId: 5, count: 2 },
      { cardId: 6, count: 2 },
      { cardId: 7, count: 2 },
      { cardId: 8, count: 2 },
      { cardId: 9, count: 2 },
      { cardId: 10, count: 1 },
      { cardId: 11, count: 1 },
      { cardId: 12, count: 2 },
    ],
  },
  {
    id: 102,
    name: "Tempest Vanguard",
    heroClass: "Stormcaller",
    cards: [
      { cardId: 1, count: 2 },
      { cardId: 6, count: 2 },
      { cardId: 7, count: 2 },
      { cardId: 8, count: 2 },
      { cardId: 9, count: 1 },
      { cardId: 12, count: 2 },
    ],
  },
];

const getStoredTab = (): CollectionTab => {
  if (typeof window === "undefined") {
    return "DECK_BUILDER";
  }
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "DECK_BUILDER" || stored === "COLLECTION") {
    return stored;
  }
  return "DECK_BUILDER";
};

const CollectionScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const [activeTab, setActiveTab] = useState<CollectionTab>(getStoredTab);
  const [deckView, setDeckView] = useState<"overview" | "edit">("overview");
  const [decks, setDecks] = useState<Deck[]>(mockDecks);
  const [activeDeckId, setActiveDeckId] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [deckWarning, setDeckWarning] = useState<string | null>(null);

  const isDeckView = activeTab === "DECK_BUILDER";
  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId) ?? null,
    [activeDeckId, decks],
  );
  const deckEntries = activeDeck?.cards ?? [];
  const deckCount = useMemo(() => deckEntries.reduce((total, entry) => total + entry.count, 0), [deckEntries]);
  const deckCards = useMemo(
    () =>
      deckEntries
        .map((entry) => {
          const card = cardCatalog.find((item) => item.id === entry.cardId);
          if (!card) {
            return null;
          }
          return { ...card, count: entry.count };
        })
        .filter((entry): entry is Card & { count: number } => entry !== null)
        .sort((a, b) => (a.mana === b.mana ? a.name.localeCompare(b.name) : a.mana - b.mana)),
    [deckEntries],
  );
  const deckIsFull = deckCount >= deckMax;
  const selectedCard = selectedCardId
    ? cardCatalog.find((card) => card.id === selectedCardId) ?? null
    : null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, activeTab);
    }
  }, [activeTab]);

  const handleTabChange = (tab: CollectionTab) => {
    setActiveTab(tab);
    if (tab === "COLLECTION") {
      setDeckWarning(null);
      return;
    }
    if (!activeDeckId) {
      setDeckView("overview");
    }
  };

  const handleAddCard = (card: Card) => {
    if (!isDeckView) {
      setSelectedCardId(card.id);
      return;
    }
    if (deckView !== "edit" || !activeDeckId) {
      return;
    }
    if (deckIsFull) {
      setDeckWarning("Deck is full.");
      return;
    }
    const maxCopies = card.rarity === "Legendary" ? 1 : 2;
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== activeDeckId) {
          return deck;
        }
        const existing = deck.cards.find((entry) => entry.cardId === card.id);
        if (existing && existing.count >= maxCopies) {
          return deck;
        }
        setDeckWarning(null);
        if (existing) {
          return {
            ...deck,
            cards: deck.cards.map((entry) =>
              entry.cardId === card.id ? { ...entry, count: entry.count + 1 } : entry,
            ),
          };
        }
        return { ...deck, cards: [...deck.cards, { cardId: card.id, count: 1 }] };
      }),
    );
  };

  const handleRemoveCard = (cardId: number) => {
    setDeckWarning(null);
    if (!activeDeckId) {
      return;
    }
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== activeDeckId) {
          return deck;
        }
        const updatedCards = deck.cards
          .map((entry) =>
            entry.cardId === cardId ? { ...entry, count: entry.count - 1 } : entry,
          )
          .filter((entry) => entry.count > 0);
        return { ...deck, cards: updatedCards };
      }),
    );
  };

  const handleSelectDeck = (deckId: number) => {
    setActiveDeckId(deckId);
    setDeckView("edit");
    setDeckWarning(null);
  };

  const handleBackToDecks = () => {
    setDeckView("overview");
    setDeckWarning(null);
  };

  return (
    <div className="collection-scene">
      <header className="collection-header">
        <div className="collection-tabs" role="tablist" aria-label="Collection views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "DECK_BUILDER"}
            className={`collection-tab ${activeTab === "DECK_BUILDER" ? "collection-tab--active" : ""}`}
            onClick={() => handleTabChange("DECK_BUILDER")}
          >
            Deck Builder
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "COLLECTION"}
            className={`collection-tab ${activeTab === "COLLECTION" ? "collection-tab--active" : ""}`}
            onClick={() => handleTabChange("COLLECTION")}
          >
            Collection
          </button>
        </div>
      </header>

      <div className="collection-toolbar">
        <div className="collection-filters">
          <button type="button" className="collection-chip">
            All
          </button>
          <button type="button" className="collection-chip">
            10
          </button>
          <button type="button" className="collection-chip">
            Filter
          </button>
        </div>
        <div className="collection-tools">
          <input
            type="search"
            className="collection-search"
            placeholder="All cards..."
            aria-label="Search cards"
          />
          <div className="collection-currency" aria-label="Currency">
            <span>Shards</span>
            <strong>50</strong>
          </div>
        </div>
      </div>

      <div className="collection-body">
        <aside className="collection-sidebar">
          {isDeckView && deckView === "edit" ? (
            <>
              <div className="collection-panel">
                <div className="collection-deck-header">
                  <div>
                    <div className="collection-deck-title">{activeDeck?.name ?? "Deck"}</div>
                    <div className="collection-deck-meta">{activeDeck?.heroClass ?? "Hero"}</div>
                  </div>
                  <div className="collection-hero-portrait" aria-hidden="true" />
                </div>
                <div className="collection-deck-icons">
                  <span className="collection-deck-icon" aria-hidden="true" />
                  <span className="collection-deck-icon" aria-hidden="true" />
                  <span className="collection-deck-icon" aria-hidden="true" />
                </div>
              </div>

              <div className="collection-deck-list" role="list">
                {deckCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className="collection-deck-row"
                    role="listitem"
                    onClick={() => handleRemoveCard(card.id)}
                  >
                    <span className="collection-deck-mana">{card.mana}</span>
                    <span className="collection-deck-name">{card.name}</span>
                    <span className="collection-deck-count">{card.count}x</span>
                  </button>
                ))}
              </div>

              <div className="collection-deck-footer">
                <button type="button" className="ui-button ui-button--secondary">
                  Edit Deck
                </button>
                <div className="collection-deck-total">
                  {deckCount}/{deckMax}
                </div>
              </div>
              {deckWarning ? <div className="collection-deck-warning">{deckWarning}</div> : null}
            </>
          ) : isDeckView ? (
            <div className="collection-panel collection-deck-overview">
              <div className="collection-deck-title">Your Decks</div>
              <div className="collection-deck-list collection-deck-list--overview" role="list">
                {decks.map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    className="collection-deck-overview-row"
                    role="listitem"
                    onClick={() => handleSelectDeck(deck.id)}
                  >
                    <div className="collection-deck-overview-name">{deck.name}</div>
                    <div className="collection-deck-overview-meta">{deck.heroClass}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="collection-panel collection-info">
              <div className="collection-deck-title">Collection Overview</div>
              <div className="collection-info-row">
                <span>Total Cards</span>
                <strong>110/120</strong>
              </div>
              <div className="collection-info-row">
                <span>Selected</span>
                <strong>{selectedCard ? selectedCard.name : "None"}</strong>
              </div>
            </div>
          )}
        </aside>

        <section className="collection-content">
          <div className="collection-content-header">
            <div>
              <div className="collection-content-title">
                {isDeckView
                  ? deckView === "edit"
                    ? "Deck Builder"
                    : "Deck Overview"
                  : "Card Collection"}
              </div>
              <div className="collection-content-subtitle">
                {isDeckView
                  ? deckView === "edit"
                    ? "Click a card to add it to your deck."
                    : "Select a deck to begin editing."
                  : "Select a card to inspect details."}
              </div>
            </div>
            {isDeckView && deckView === "edit" ? (
              <div className="collection-deck-status">
                <button type="button" className="ui-button ui-button--ghost" onClick={handleBackToDecks}>
                  Back to Decks
                </button>
                <div className="collection-deck-total">
                  {deckCount}/{deckMax}
                </div>
                <div className="collection-content-subtitle">
                  {deckIsFull ? "Deck size limit reached." : "Add up to 2 copies per card."}
                </div>
              </div>
            ) : !isDeckView ? (
              <div className="collection-actions">
                <button type="button" className="ui-button ui-button--primary">
                  Create Card
                </button>
                <button type="button" className="ui-button ui-button--secondary">
                  Disenchant
                </button>
              </div>
            ) : null}
          </div>

          {!isDeckView ? (
            <div className="collection-inspect" role="status" aria-live="polite">
              {selectedCard ? (
                <>
                  <div className="collection-inspect__title">Selected Card</div>
                  <div className="collection-inspect__name">{selectedCard.name}</div>
                  <div className="collection-inspect__meta">Mana {selectedCard.mana}</div>
                </>
              ) : (
                <>
                  <div className="collection-inspect__title">Selected Card</div>
                  <div className="collection-inspect__meta">Choose a card to preview details.</div>
                </>
              )}
            </div>
          ) : null}

          {isDeckView && deckView === "overview" ? (
            <div className="collection-overview-panel">
              <div className="collection-content-subtitle">Choose a deck to enter the editor.</div>
            </div>
          ) : (
            <div className="collection-grid">
              {cardCatalog.map((card) => (
                <button type="button" key={card.id} className="collection-card" onClick={() => handleAddCard(card)}>
                  <div className="collection-card__mana">{card.mana}</div>
                  <div className="collection-card__art" aria-hidden="true" />
                  <div className="collection-card__name">{card.name}</div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="collection-footer">
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("MAIN_MENU")}>
          Back
        </button>
        <div className="collection-categories" role="group" aria-label="Card categories">
          <button type="button" className="collection-category collection-category--active">
            All Cards
          </button>
          <button type="button" className="collection-category">
            Neutral
          </button>
          <button type="button" className="collection-category">
            Stormcaller
          </button>
        </div>
        <div className="collection-footer-count">110/120 cards</div>
      </footer>
    </div>
  );
};

export default CollectionScene;
