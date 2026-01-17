import { useAstraStore } from "../state/useAstraStore";
import ArtSlot from "../components/ArtSlot";

const AstraOrbButton = () => {
  const open = useAstraStore((state) => state.open);
  const isOpen = useAstraStore((state) => state.isOpen);

  return (
    <button
      className="astra-orb"
      type="button"
      aria-label="Open Astra Assistant"
      onClick={open}
      disabled={isOpen}
    >
      <ArtSlot assetKey="astraOrb" className="astra-orb__art" alt="" />
    </button>
  );
};

export default AstraOrbButton;
