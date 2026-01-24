import { useEffect, useMemo, useRef, useState } from "react";
import { useAstraStore } from "../state/useAstraStore";
import ArtSlot from "../components/ArtSlot";

type OrbSide = "left" | "right";

const STORAGE_KEY = "astra:orbPosition";
const EDGE_MARGIN_PX = 12;
const DRAG_THRESHOLD_PX = 6;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const AstraOrbButton = () => {
  const open = useAstraStore((state) => state.open);
  const isOpen = useAstraStore((state) => state.isOpen);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const [side, setSide] = useState<OrbSide>("right");
  const [top, setTop] = useState(EDGE_MARGIN_PX);
  const [attentionPulse, setAttentionPulse] = useState(false);
  const attentionTimeoutRef = useRef<number | null>(null);

  const resolvedTop = useMemo(() => {
    if (typeof window === "undefined") return top;
    const height = buttonRef.current?.offsetHeight ?? 0;
    const maxTop = Math.max(EDGE_MARGIN_PX, window.innerHeight - height - EDGE_MARGIN_PX);
    return clamp(top, EDGE_MARGIN_PX, maxTop);
  }, [top]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { side?: OrbSide; top?: number };
      if (parsed.side === "left" || parsed.side === "right") {
        setSide(parsed.side);
      }
      if (typeof parsed.top === "number") {
        setTop(parsed.top);
      }
    } catch {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ side, top: resolvedTop }));
    } catch {
      // Ignore storage failures.
    }
  }, [side, top, resolvedTop]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setTop((current) => current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isOpen) return;
    const intervalId = window.setInterval(() => {
      setAttentionPulse(true);
      if (attentionTimeoutRef.current) {
        window.clearTimeout(attentionTimeoutRef.current);
      }
      attentionTimeoutRef.current = window.setTimeout(() => {
        setAttentionPulse(false);
        attentionTimeoutRef.current = null;
      }, 700);
    }, 50000);
    return () => {
      window.clearInterval(intervalId);
      if (attentionTimeoutRef.current) {
        window.clearTimeout(attentionTimeoutRef.current);
        attentionTimeoutRef.current = null;
      }
      setAttentionPulse(false);
    };
  }, [isOpen]);

  const updatePositionFromPointer = (clientX: number, clientY: number) => {
    if (typeof window === "undefined") return;
    const height = buttonRef.current?.offsetHeight ?? 0;
    const maxTop = Math.max(EDGE_MARGIN_PX, window.innerHeight - height - EDGE_MARGIN_PX);
    const nextTop = clamp(clientY - height / 2, EDGE_MARGIN_PX, maxTop);
    const nextSide: OrbSide = clientX <= window.innerWidth / 2 ? "left" : "right";
    setSide(nextSide);
    setTop(nextTop);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    draggingRef.current = true;
    movedRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    if (!movedRef.current && Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
      movedRef.current = true;
    }
    updatePositionFromPointer(event.clientX, event.clientY);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <button
      className={`astra-orb${attentionPulse ? " astra-orb--attention" : ""}${side === "right" ? " astra-orb--right" : ""}`}
      type="button"
      aria-label="Open Astra Assistant"
      onClick={() => {
        if (movedRef.current) return;
        open();
      }}
      disabled={isOpen}
      ref={buttonRef}
      style={{
        top: resolvedTop,
        left: side === "left" ? EDGE_MARGIN_PX : "auto",
        right: side === "right" ? EDGE_MARGIN_PX : "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <ArtSlot assetKey="astraOrb" className="astra-orb__art" alt="" />
    </button>
  );
};

export default AstraOrbButton;
