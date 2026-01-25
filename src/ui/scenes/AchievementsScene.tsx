import { useUIStore } from "../state/useUIStore";

const AchievementsScene = () => {
  const setScene = useUIStore((state) => state.setScene);

  return (
    <div className="scene-placeholder">
      <header className="scene-placeholder__header">
        <h1>Achievements</h1>
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("PROFILE")}>
          Back
        </button>
      </header>
      <div className="scene-placeholder__content">
        <div>Achievements screen placeholder.</div>
      </div>
    </div>
  );
};

export default AchievementsScene;
