import { useAstraStore } from "../state/useAstraStore";
import ArtSlot from "../components/ArtSlot";

const AstraCoachmark = () => {
  const coachmark = useAstraStore((state) => state.coachmark);
  const dismissCoachmark = useAstraStore((state) => state.dismissCoachmark);

  if (!coachmark) return null;

  return (
    <div className="astra-coachmark" role="status" aria-live="polite">
      <ArtSlot assetKey="astraCoachmark" className="astra-coachmark__portrait" alt="" />
      <div className="astra-coachmark__content">
        <p>{coachmark.text}</p>
        <button type="button" className="ui-button ui-button--secondary" onClick={dismissCoachmark}>
          {coachmark.ctaLabel ?? "Got it!"}
        </button>
      </div>
    </div>
  );
};

export default AstraCoachmark;
