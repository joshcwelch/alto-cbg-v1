import { useAstraStore } from "../state/useAstraStore";

const AstraCoachmark = () => {
  const coachmark = useAstraStore((state) => state.coachmark);
  const dismissCoachmark = useAstraStore((state) => state.dismissCoachmark);

  if (!coachmark) return null;

  return (
    <div className="astra-coachmark" role="status" aria-live="polite">
      <div
        className="astra-coachmark__portrait"
        aria-hidden="true"
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          border: "1px solid rgba(220, 190, 130, 0.7)",
          background:
            "radial-gradient(circle at 30% 30%, rgba(130, 190, 240, 0.7), rgba(40, 30, 25, 0.9))",
          boxShadow: "0 10px 18px rgba(0, 0, 0, 0.4)",
          flexShrink: 0,
        }}
      />
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
