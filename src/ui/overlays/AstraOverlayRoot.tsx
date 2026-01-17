import { useAstraStore } from "../state/useAstraStore";
import AstraCoachmark from "./AstraCoachmark";
import AstraModal from "./AstraModal";
import AstraOrbButton from "./AstraOrbButton";

const AstraOverlayRoot = () => {
  const isOpen = useAstraStore((state) => state.isOpen);
  const coachmark = useAstraStore((state) => state.coachmark);
  const close = useAstraStore((state) => state.close);

  return (
    <div className="astra-overlay-root" aria-hidden={false}>
      {isOpen ? (
        <button
          className="astra-backdrop"
          type="button"
          aria-label="Close Astra Assistant"
          tabIndex={-1}
          onClick={close}
        />
      ) : null}
      <div className="astra-safe-frame">
        <AstraOrbButton />
        {isOpen ? <AstraModal /> : null}
        {coachmark ? <AstraCoachmark /> : null}
      </div>
    </div>
  );
};

export default AstraOverlayRoot;
