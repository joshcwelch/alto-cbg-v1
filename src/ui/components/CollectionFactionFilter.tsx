import type { FC } from "react";

export type FactionId = "embercrown" | "celestialorder" | "sylvankin" | "gearcograiders" | "voidborn";

type FactionOption = {
  id: FactionId;
  label: string;
  icon: string;
};

type CollectionFactionFilterProps = {
  selectedFaction: FactionId | null;
  onFactionChange: (faction: FactionId | null) => void;
};

const FACTIONS: FactionOption[] = [
  {
    id: "embercrown",
    label: "Ember Crown",
    icon: "/assets/ui/collection/collection-faction-icon_embercrown.png",
  },
  {
    id: "celestialorder",
    label: "Celestial Order",
    icon: "/assets/ui/collection/collection-faction-icon_celestialorder.png",
  },
  {
    id: "sylvankin",
    label: "Sylvan Kin",
    icon: "/assets/ui/collection/collection-faction-icon_sylvankin.png",
  },
  {
    id: "gearcograiders",
    label: "Gearcog Raiders",
    icon: "/assets/ui/collection/collection-faction-icon_gearcograiders.png",
  },
  {
    id: "voidborn",
    label: "Voidborn",
    icon: "/assets/ui/collection/collection-faction-icon_voidborn.png",
  },
];

const CollectionFactionFilter: FC<CollectionFactionFilterProps> = ({
  selectedFaction,
  onFactionChange,
}) => {
  const handleClick = (faction: FactionId) => {
    if (selectedFaction === faction) {
      onFactionChange(null);
      return;
    }
    onFactionChange(faction);
  };

  return (
    <div className="collection-scene__faction-filter" aria-label="Faction filters" role="group">
      {FACTIONS.map((faction) => {
        const isSelected = selectedFaction === faction.id;
        const isInactive = selectedFaction !== null && !isSelected;
        const stateClass = isSelected ? "is-selected" : isInactive ? "is-inactive" : "";

        return (
          <button
            key={faction.id}
            type="button"
            className={`collection-scene__faction-filter-button ${stateClass}`.trim()}
            aria-pressed={isSelected}
            aria-label={`Filter by ${faction.label}`}
            onClick={() => handleClick(faction.id)}
          >
            <img src={faction.icon} alt="" />
          </button>
        );
      })}
    </div>
  );
};

export default CollectionFactionFilter;
