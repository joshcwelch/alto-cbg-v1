import { useEffect, useRef, useState } from "react";

const FX_INTENSITY = {
  impact: 1,
  chroma: 0.85,
  dust: 0.7,
  lens: 0.9,
};

const DEBUG_EXAGGERATE_FX = false;
const ENABLE_PLACEHOLDER_RARE_STREAK = false;

const InventoryInteractionFX = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [impactKey, setImpactKey] = useState(0);
  const [chromaKey, setChromaKey] = useState(0);
  const [lensKey, setLensKey] = useState(0);
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) return;
    const root = rootRef.current;
    const onImpact = () => {
      setImpactKey((prev) => prev + 1);
      setChromaKey((prev) => prev + 1);
    };

    const onCardFlip = (event: Event) => {
      onImpact();
      const detail = (event as CustomEvent<{ rarity?: string }>).detail;
      const rarity = detail?.rarity?.toLowerCase();
      const isRare = rarity ? ["rare", "epic", "legendary", "mythic"].includes(rarity) : false;
      const rect = (detail as { rect?: DOMRect | null })?.rect ?? null;
      if (root && rect) {
        const x = rect.left + rect.width * 0.5;
        const y = rect.top - Math.max(24, rect.height * 0.15);
        root.style.setProperty("--fx-lens-x", `${x}px`);
        root.style.setProperty("--fx-lens-y", `${y}px`);
        root.style.setProperty("--fx-lens-w", `${Math.max(220, rect.width * 1.1)}px`);
      }
      if (isRare || ENABLE_PLACEHOLDER_RARE_STREAK) {
        setLensKey((prev) => prev + 1);
      }
    };

    window.addEventListener("alto:openpack:burst", onImpact);
    window.addEventListener("alto:openpack:claim", onImpact);
    window.addEventListener("alto:openpack:card-flip", onCardFlip);

    return () => {
      window.removeEventListener("alto:openpack:burst", onImpact);
      window.removeEventListener("alto:openpack:claim", onImpact);
      window.removeEventListener("alto:openpack:card-flip", onCardFlip);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion) {
      root.style.setProperty("--fx-parallax-x", "0px");
      root.style.setProperty("--fx-parallax-y", "0px");
      return;
    }

    let rafId = 0;
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      root.style.setProperty("--fx-parallax-x", `${current.x * 12}px`);
      root.style.setProperty("--fx-parallax-y", `${current.y * 10}px`);
      if (Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const updateTarget = (event?: MouseEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      const x = event?.clientX ?? width * 0.5;
      const y = event?.clientY ?? height * 0.5;
      target.x = (x / width - 0.5) * 2;
      target.y = (y / height - 0.5) * 2;
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => updateTarget(event);
    const onLeave = () => updateTarget();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    updateTarget();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  const debugScale = DEBUG_EXAGGERATE_FX ? 1.5 : 1;

  return (
    <div
      ref={rootRef}
      className="inventory-interaction-fx"
      aria-hidden="true"
      style={{
        ["--fx-impact" as any]: `${FX_INTENSITY.impact * debugScale}`,
        ["--fx-chroma" as any]: `${FX_INTENSITY.chroma * debugScale}`,
        ["--fx-dust" as any]: `${FX_INTENSITY.dust * debugScale}`,
        ["--fx-lens" as any]: `${FX_INTENSITY.lens * debugScale}`,
      }}
    >
      <div className="inventory-juice__dust">
        <div className="inventory-juice__dust-layer inventory-juice__dust-layer--far" />
        <div className="inventory-juice__dust-layer inventory-juice__dust-layer--near" />
      </div>
      {impactKey > 0 && <div key={impactKey} className="inventory-juice__impact" />}
      {chromaKey > 0 && <div key={chromaKey} className="inventory-juice__chroma" />}
      {lensKey > 0 && <div key={lensKey} className="inventory-juice__lens" />}
    </div>
  );
};

export default InventoryInteractionFX;
