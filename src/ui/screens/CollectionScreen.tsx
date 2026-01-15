import Panel from "../components/common/Panel";

const CollectionScreen = () => {
  return (
    <div className="screen screen--collection">
      <div className="hub-screen">
        <header className="hero-header">
          <img className="hero-header__frame" src="/ui/collection/hero-panel_frame.png" alt="" />
          <div className="hero-header__content">
            <img className="hero-header__portrait" src="/assets/heroes/tharos.png" alt="Tharos" />
            <div>
              <p className="hero-header__eyebrow">Archive</p>
              <h1>Collection</h1>
            </div>
          </div>
        </header>
        <div className="hub-grid">
          <Panel title="Archive" frameSrc="/ui/collection/archive-table_frame.png">
            <p>Browse the card archive and filter by faction, rarity, and cost.</p>
          </Panel>
          <Panel title="Inspect" frameSrc="/ui/collection/inspect-panel_frame.png">
            <p>Preview cards and hero powers with detailed tooltips.</p>
          </Panel>
          <Panel title="Utility" frameSrc="/ui/collection/utility-strip_frame.png">
            <p>Sort, search, and manage favorites.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default CollectionScreen;
