import { useUIStore } from "../state/useUIStore";

type PlaceholderSceneProps = {
  title: string;
};

const PlaceholderScene = ({ title }: PlaceholderSceneProps) => {
  const setScene = useUIStore((state) => state.setScene);

  return (
    <div className="scene-placeholder">
      <header className="scene-placeholder__header">
        <h1>{title}</h1>
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("MAIN_MENU")}>
          Back
        </button>
      </header>
      <div className="scene-placeholder__content">
        <div>{title} screen placeholder.</div>
      </div>
    </div>
  );
};

export default PlaceholderScene;
