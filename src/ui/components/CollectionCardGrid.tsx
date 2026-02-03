import { useEffect, useMemo, useState } from "react";

type FactionId = "embercrown" | "celestialorder" | "sylvankin" | "gearcograiders" | "voidborn";

type CollectionCard = {
  id: string;
  name: string;
  faction: FactionId;
};

type CollectionCardGridProps = {
  selectedFaction?: string | null;
  onCardClick?: (cardId: string) => void;
};

const FACTIONS: FactionId[] = [
  "embercrown",
  "celestialorder",
  "sylvankin",
  "gearcograiders",
  "voidborn",
];

const buildMockCards = (): CollectionCard[] =>
  Array.from({ length: 90 }, (_, index) => {
    const number = String(index + 1).padStart(3, "0");
    return {
      id: `card-${number}`,
      name: `Card ${number}`,
      faction: FACTIONS[index % FACTIONS.length],
    };
  });

const CollectionCardGrid = ({ selectedFaction = null, onCardClick }: CollectionCardGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const cards = useMemo(buildMockCards, []);
  const activeFaction = useMemo(() => {
    if (!selectedFaction) return null;
    return FACTIONS.includes(selectedFaction as FactionId) ? (selectedFaction as FactionId) : null;
  }, [selectedFaction]);

  const filteredCards = useMemo(
    () => (activeFaction ? cards.filter((card) => card.faction === activeFaction) : cards),
    [activeFaction, cards]
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [activeFaction]);

  const cardsPerPage = 6;
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 0) setCurrentPage(0);
      return;
    }
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  const pageIndex = totalPages === 0 ? 0 : Math.min(currentPage, totalPages - 1);
  const startIndex = pageIndex * cardsPerPage;
  const pageCards = totalPages === 0 ? [] : filteredCards.slice(startIndex, startIndex + cardsPerPage);
  const pageLabel = totalPages === 0 ? "Page 0 / 0" : `Page ${pageIndex + 1} / ${totalPages}`;

  return (
    <section className="collection-card-grid" aria-label="Card collection grid">
      <div className="collection-card-grid__viewport">
        <div className="collection-card-grid__grid" role="list">
          {totalPages === 0 ? (
            <div className="collection-card-grid__empty">No cards found for this faction.</div>
          ) : (
            pageCards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="collection-card-grid__card"
                onClick={() => onCardClick?.(card.id)}
                aria-label={`View ${card.name}`}
              >
                <img src="/assets/ui/collection/card_front.png" alt="" />
              </button>
            ))
          )}
        </div>
      </div>
      <div className="collection-card-grid__pagination-dock">
        <div className="collection-card-grid__pagination" aria-label="Pagination">
          <button
            type="button"
            className="collection-card-grid__page-nav"
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
            disabled={pageIndex === 0}
            aria-label="Previous page"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div className="collection-card-grid__page-list" role="list">
            {Array.from({ length: totalPages }, (_, index) => {
              const isActive = index === pageIndex;
              return (
                <button
                  key={`page-${index + 1}`}
                  type="button"
                  className={`collection-card-grid__page-block${isActive ? " is-active" : ""}`}
                  onClick={() => setCurrentPage(index)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="collection-card-grid__page-nav"
            onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
            disabled={totalPages === 0 || pageIndex >= totalPages - 1}
            aria-label="Next page"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
      <div className="collection-card-grid__summary">
        <span className="collection-card-grid__summary-count">80/120</span>
        <span className="collection-card-grid__summary-label">Cards Collected</span>
      </div>
    </section>
  );
};

export default CollectionCardGrid;
