import { useUIStore } from "../state/useUIStore";
import ArtSlot from "../components/ArtSlot";

const StoreScene = () => {
  const setScene = useUIStore((state) => state.setScene);

  const packs = [
    { id: "pack-1", label: "1 Pack", price: "200 gold" },
    { id: "pack-5", label: "5 Packs", price: "900 gold" },
    { id: "pack-10", label: "10 Packs", price: "1,700 gold" },
  ];

  const featured = {
    title: "Magister Hero Bundle",
    subtext: "Unlock a new hero and bonus cosmetics.",
    price: "1,250 gold",
  };

  return (
    <div className="store-scene">
      <header className="store-header">
        <div className="store-header__title">
          <h1>Store</h1>
        </div>
        <div className="store-header__currency">
          <div className="store-currency">
            <span>Gold</span>
            <strong>1,750</strong>
            <button type="button" className="store-currency__add" onClick={() => window.alert("TODO: Add gold.")}>
              +
            </button>
          </div>
          <div className="store-currency">
            <span>Shards</span>
            <strong>400</strong>
            <button type="button" className="store-currency__add" onClick={() => window.alert("TODO: Add shards.")}>
              +
            </button>
          </div>
        </div>
      </header>

      <div className="store-content">
        <section className="store-packs">
          <div className="store-pack-grid">
            {packs.map((pack) => (
              <button
                key={pack.id}
                type="button"
                className="store-pack"
                onClick={() => window.alert(`TODO: Purchase ${pack.label}.`)}
              >
                <ArtSlot assetKey="storePackArt" className="store-pack__art" alt="" />
                <div className="store-pack__label">{pack.label}</div>
                <div className="store-pack__price">{pack.price}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="store-featured">
          <div className="store-featured__header">Featured Items</div>
          <ArtSlot assetKey="storeFeaturedArt" className="store-featured__art" alt="" />
          <div className="store-featured__name">{featured.title}</div>
          <div className="store-featured__subtext">{featured.subtext}</div>
          <button
            type="button"
            className="ui-button ui-button--primary store-featured__price"
            onClick={() => window.alert("TODO: Purchase featured item.")}
          >
            {featured.price}
          </button>
        </section>
      </div>

      <footer className="store-footer">
        <div className="store-current-pack">
          <ArtSlot assetKey="storeCurrentPackPortrait" className="store-current-pack__portrait" alt="" />
          <div className="store-current-pack__text">
            <span className="store-current-pack__label">Current Pack:</span>
            <span className="store-current-pack__name">Arcane Enigma</span>
          </div>
          <ArtSlot assetKey="storeCurrentPackIcon" className="store-current-pack__icon" alt="" />
        </div>
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("MAIN_MENU")}>
          Back
        </button>
      </footer>
    </div>
  );
};

export default StoreScene;
