import Panel from "../components/common/Panel";

const DeckBuilderScreen = () => {
  return (
    <div className="screen screen--decks">
      <div className="hub-screen">
        <header className="hero-header">
          <img className="hero-header__frame" src="/ui/collection/hero-panel_frame.png" alt="" />
          <div className="hero-header__content">
            <img className="hero-header__portrait" src="/assets/heroes/lyra.png" alt="Lyra" />
            <div>
              <p className="hero-header__eyebrow">Forge</p>
              <h1>Deck Builder</h1>
            </div>
          </div>
        </header>
        <div className="hub-grid hub-grid--wide">
          <Panel title="Deck List" frameSrc="/ui/deck-builder/deck-list-panel_frame.png">
            <p>Manage decks, import codes, and tune your curve.</p>
          </Panel>
          <Panel title="Work Surface" frameSrc="/ui/deck-builder/deck-work-surface_frame.png">
            <p>Drag cards to craft and refine your build.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilderScreen;
