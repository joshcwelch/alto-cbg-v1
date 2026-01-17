import { useAstraStore } from "../state/useAstraStore";

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
    />
  );
};

export default AstraOrbButton;
