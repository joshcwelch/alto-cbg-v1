import { useEffect, useRef, useState, type MouseEvent } from "react";
import InventoryFoundationFX from "../components/InventoryFoundationFX";
import InventoryInteractionFX from "../components/InventoryInteractionFX";
import { useUIStore } from "../state/useUIStore";
import { useAccountStore } from "../state/useAccountStore";
import type { PackCardResult } from "../../api/types";

type OpenPhase = "idle" | "shaking" | "burst" | "spawning" | "revealing" | "claiming" | "resetting";

type ExitVector = {
  x: number;
  y: number;
  rot: number;
  delay: number;
};

type DebrisChunk = {
  id: string;
  x: number;
  y: number;
  xFast: number;
  yFast: number;
  rot: number;
  delay: number;
  duration: number;
  scale: number;
};

const InventoryScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const debrisRef = useRef<DebrisChunk[]>([]);
  const poofBoxRef = useRef<HTMLDivElement | null>(null);
  const packs = [{ id: "standard", name: "ALTO STANDARD PACK - SINGLE (1)" }];
  const openPack = useAccountStore((s) => s.openPack);
  const [packResults, setPackResults] = useState<PackCardResult[] | null>(null);
  const [packError, setPackError] = useState<string | null>(null);
  const [openPhase, setOpenPhase] = useState<OpenPhase>("idle");
  const [revealedCount, setRevealedCount] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>(() => Array.from({ length: 5 }, () => false));
  const [cardExitVectors, setCardExitVectors] = useState<ExitVector[]>([]);
  const [vfxActive, setVfxActive] = useState(false);
  const [vfxKey, setVfxKey] = useState(0);
  const mouseDebugRef = useRef<HTMLDivElement | null>(null);
  const glowOverlayHidden = false;
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openPhaseRef = useRef(openPhase);
  const [glowHovered, setGlowHovered] = useState(false);
  const [glowPinned, setGlowPinned] = useState(false);
  const isPackUiHidden = openPhase !== "idle" && openPhase !== "shaking";
  const cardsVisible = openPhase === "spawning" || openPhase === "revealing" || openPhase === "claiming";

  const setTimeoutSafe = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const createDebrisChunks = () => {
    const count = 6 + Math.floor(Math.random() * 7);
    return Array.from({ length: count }, (_, index) => {
      const x = Math.round(Math.random() * 900 - 450);
      const y = Math.random() > 0.5 ? Math.round(650 + Math.random() * 450) : Math.round(-1100 + Math.random() * 450);
      return {
        id: `debris-${index}-${Math.random().toString(36).slice(2)}`,
        x,
        y,
        xFast: Math.round(x * 0.45),
        yFast: Math.round(y * 0.45),
        rot: Math.round(Math.random() * 70 - 35),
        delay: Math.round(Math.random() * 184),
        duration: Math.round(1035 + Math.random() * 345),
        scale: 0.6 + Math.random() * 0.5,
      };
    });
  };

  useEffect(
    () => () => {
      clearTimers();
    },
    []
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (openPhase !== "idle") {
      document.body.classList.add("inventory-opening");
    } else {
      document.body.classList.remove("inventory-opening");
    }
    return () => {
      document.body.classList.remove("inventory-opening");
    };
  }, [openPhase]);

  useEffect(() => {
    openPhaseRef.current = openPhase;
    if (openPhase !== "idle") {
      setGlowHovered(false);
    }
  }, [openPhase]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("inventory-scene-active");
    return () => {
      document.body.classList.remove("inventory-scene-active");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = mouseDebugRef.current;
    if (!target) return;
    const onMove = (event: MouseEvent) => {
      target.textContent = `${event.clientX}, ${event.clientY}`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;

    const flameCanvas = document.createElement("canvas");
    flameCanvas.className = "inventory__lantern-flames";
    root.appendChild(flameCanvas);
    const ctx = flameCanvas.getContext("2d");
    if (!ctx) return () => flameCanvas.remove();

    const dpr = window.devicePixelRatio || 1;
    let rafId = 0;

    const flames = [
      { anchorX: 236, anchorY: 512, scale: 1.0, seed: 1.4 },
      { anchorX: 1682, anchorY: 518, scale: 1.0, seed: 1.4 },
    ];

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      flameCanvas.width = Math.max(1, Math.floor(width * dpr));
      flameCanvas.height = Math.max(1, Math.floor(height * dpr));
      flameCanvas.style.width = `${width}px`;
      flameCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFlame = (cx: number, cy: number, size: number, time: number, seed: number) => {
      const baseW = size * 0.33;
      const baseH = size * 1.04;
      const flicker = 0.9 + 0.08 * Math.sin(time * 3.2 + seed * 2.1);
      const wobble = 0.08 * Math.sin(time * 6.1 + seed * 1.7);
      const sway = 0.12 * Math.sin(time * 1.8 + seed * 3.4);
      const width = baseW * (0.9 + 0.05 * Math.sin(time * 4.1 + seed));
      const height = baseH * (0.95 + 0.12 * Math.sin(time * 3.6 + seed * 2.5));
      const tilt = width * wobble;

      ctx.globalCompositeOperation = "screen";

      const outer = ctx.createLinearGradient(cx, cy - height, cx, cy + height * 0.35);
      outer.addColorStop(0, "rgba(190, 245, 255, 0.95)");
      outer.addColorStop(0.55, "rgba(70, 180, 255, 0.75)");
      outer.addColorStop(1, "rgba(20, 70, 120, 0.1)");

      ctx.fillStyle = outer;
      ctx.globalAlpha = 0.82 * flicker;
      ctx.shadowColor = "rgba(120, 210, 255, 0.45)";
      ctx.shadowBlur = size * 0.4;
      const edgeJitter = size * 0.02 * Math.sin(time * 7.3 + seed * 4.1);
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.72, cy + height * 0.35);
      ctx.bezierCurveTo(
        cx - width * 0.85 + tilt - edgeJitter,
        cy - height * 0.05 + edgeJitter,
        cx - width * 0.35 + tilt + edgeJitter,
        cy - height * 0.8,
        cx + tilt,
        cy - height - edgeJitter
      );
      ctx.bezierCurveTo(
        cx + width * 0.35 + tilt - edgeJitter,
        cy - height * 0.8,
        cx + width * 0.85 + tilt + edgeJitter,
        cy - height * 0.05 + edgeJitter,
        cx + width * 0.72 + edgeJitter,
        cy + height * 0.35
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      const inner = ctx.createLinearGradient(cx, cy - height, cx, cy + height * 0.2);
      inner.addColorStop(0, "rgba(230, 255, 255, 0.98)");
      inner.addColorStop(0.55, "rgba(120, 210, 255, 0.85)");
      inner.addColorStop(1, "rgba(30, 90, 140, 0)");

      ctx.fillStyle = inner;
      ctx.globalAlpha = 0.78 * flicker;
      ctx.shadowColor = "rgba(210, 250, 255, 0.35)";
      ctx.shadowBlur = size * 0.22;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.3, cy + height * 0.2);
      ctx.bezierCurveTo(
        cx - width * 0.35 + tilt * 1.1,
        cy - height * 0.15,
        cx - width * 0.1 + tilt * 0.8,
        cy - height * 0.72,
        cx + tilt * 0.8,
        cy - height * 0.88
      );
      ctx.bezierCurveTo(
        cx + width * 0.1 + tilt * 0.8,
        cy - height * 0.7,
        cx + width * 0.35 + tilt * 1.1,
        cy - height * 0.1,
        cx + width * 0.3,
        cy + height * 0.2
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 0.5 * flicker;
      ctx.fillStyle = "rgba(200, 245, 255, 0.9)";
      ctx.beginPath();
      ctx.ellipse(cx + sway * size * 0.12, cy - height * 0.1, size * 0.12, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const getBaseSize = () => Math.min(window.innerWidth, window.innerHeight) * 0.065;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, flameCanvas.clientWidth, flameCanvas.clientHeight);
      const baseSize = getBaseSize();
      flames.forEach((flame) => {
        const baseX = flame.anchorX;
        const baseY = flame.anchorY;
        const layers = [
          { scale: flame.scale, offsetX: 0, offsetY: 0, seedOffset: 0, angleBase: 0, stretch: 1.2 },
          { scale: flame.scale * 0.7, offsetX: -6, offsetY: -10, seedOffset: 0.8, angleBase: -0.16, stretch: 0.95 },
          { scale: flame.scale * 0.55, offsetX: 8, offsetY: -14, seedOffset: 1.6, angleBase: 0.16, stretch: 0.9 },
        ];
        const size = baseSize * flame.scale;
        const height = size * 1.1;
        layers.forEach((layer) => {
          const angle = layer.angleBase + Math.sin(time * 1.6 + flame.seed * 2.2) * 0.03;
          ctx.save();
          ctx.translate(baseX + layer.offsetX, baseY - height * 0.35 + layer.offsetY);
          ctx.rotate(angle);
          ctx.scale(1, layer.stretch);
          drawFlame(0, 0, baseSize * layer.scale, time, flame.seed + layer.seedOffset);
          ctx.restore();
        });
      });
    };

    const frame = (now: number) => {
      draw(now / 1000);
      rafId = window.requestAnimationFrame(frame);
    };

    resize();
    rafId = window.requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
      flameCanvas.remove();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ambience = new Audio("/assets/sounds/ambience-roomtone-22-404098.mp3");
    ambience.loop = true;
    const ambienceVolume = 0.6;
    ambience.volume = ambienceVolume;
    ambienceRef.current = ambience;

    const startLoopFade = () => {
      const fadeMs = 4200;
      const intervalId = window.setInterval(() => {
        if (!ambience.duration || Number.isNaN(ambience.duration)) return;
        const remaining = ambience.duration - ambience.currentTime;
        if (remaining <= fadeMs / 1000) {
          const t = Math.max(0, remaining / (fadeMs / 1000));
          ambience.volume = ambienceVolume * t;
        } else if (ambience.volume !== ambienceVolume) {
          ambience.volume = ambienceVolume;
        }
      }, 200);
      return () => window.clearInterval(intervalId);
    };

    const fadeIn = () => {
      const fadeMs = 4200;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / fadeMs);
        ambience.volume = ambienceVolume * t;
        if (t < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    const startAudio = () => {
      ambience.volume = 0;
      ambience.play().catch(() => undefined);
      fadeIn();
    };

    startAudio();
    const stopLoopFade = startLoopFade();

    const resumeOnGesture = () => {
      startAudio();
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };

    window.addEventListener("pointerdown", resumeOnGesture);
    window.addEventListener("keydown", resumeOnGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      stopLoopFade();
      ambience.pause();
      ambience.currentTime = 0;
      ambienceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;

    const pipBoxes = ["inventory__pip-box", "inventory__pip-box inventory__pip-box--right"].map((className) => {
      const box = document.createElement("div");
      box.className = className;
      root.appendChild(box);
      return box;
    });

    const spawnPip = () => {
      const gate = document.querySelector(".inventory-pack-ui__particle-gate") as HTMLElement | null;
      if (!gate) return;
      const pip = document.createElement("span");
      pip.className = "inventory__pip";
      const x = 15 + Math.random() * 70;
      const size = 1.2 + Math.random() * 1.6;
      const rise = 80 + Math.random() * 110;
      const drift = Math.round(Math.random() * 16 - 8);
      const duration = 2200 + Math.random() * 1400;
      pip.style.left = `${x}%`;
      pip.style.bottom = `${Math.random() * 10}%`;
      pip.style.width = `${size}px`;
      pip.style.height = `${size}px`;
      pip.style.setProperty("--rise", `${rise}px`);
      pip.style.setProperty("--drift", `${drift}px`);
      pip.style.setProperty("--dur", `${duration}ms`);
      const target = pipBoxes[Math.floor(Math.random() * pipBoxes.length)];
      target.appendChild(pip);
      pip.addEventListener("animationend", () => {
        pip.remove();
      });
    };

    const intervalId = window.setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        spawnPip();
      }
    }, 420);

    return () => {
      window.clearInterval(intervalId);
      pipBoxes.forEach((box) => box.remove());
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;
    const smokeBoxes = ["inventory__smoke-box", "inventory__smoke-box inventory__smoke-box--right"].map(
      (className) => {
        const box = document.createElement("div");
        box.className = className;
        root.appendChild(box);
        return box;
      }
    );

    const spawnSmoke = () => {
      const puff = document.createElement("span");
      puff.className = "inventory__smoke";
      const x = 10 + Math.random() * 80;
      const size = 28 + Math.random() * 24;
      const drift = Math.round(Math.random() * 20 - 10);
      const rise = 40 + Math.random() * 50;
      const duration = 3200 + Math.random() * 2000;
      const delay = Math.random() * 300;
      puff.style.left = `${x}%`;
      puff.style.bottom = `${Math.random() * 15}%`;
      puff.style.width = `${size}px`;
      puff.style.height = `${size}px`;
      puff.style.setProperty("--drift", `${drift}px`);
      puff.style.setProperty("--rise", `${rise}px`);
      puff.style.setProperty("--dur", `${duration}ms`);
      puff.style.setProperty("--delay", `${delay}ms`);
      const target = smokeBoxes[Math.floor(Math.random() * smokeBoxes.length)];
      target.appendChild(puff);
      puff.addEventListener("animationend", () => {
        puff.remove();
      });
    };

    const intervalId = window.setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        spawnSmoke();
      }
    }, 520);

    return () => {
      window.clearInterval(intervalId);
      smokeBoxes.forEach((box) => box.remove());
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;

    const sparkleBoxes = [
      { className: "inventory__sparkle-box inventory__sparkle-box--left", isPack: false },
      { className: "inventory__sparkle-box inventory__sparkle-box--right", isPack: false },
      { className: "inventory__sparkle-box inventory__sparkle-box--pack", isPack: true },
    ].map((entry) => {
      const box = document.createElement("div");
      box.className = entry.className;
      root.appendChild(box);
      return { ...entry, el: box };
    });

    const spawnSparkle = (target: HTMLDivElement, options?: { fast?: boolean }) => {
      const sparkle = document.createElement("span");
      const isGold = Math.random() > 0.5;
      sparkle.className = `inventory__sparkle ${isGold ? "inventory__sparkle--gold" : "inventory__sparkle--white"}`;
      const x = 8 + Math.random() * 84;
      const y = 10 + Math.random() * 80;
      const size = (options?.fast ? 2.4 : 2) + Math.random() * (options?.fast ? 2.8 : 2.4);
      const drift = Math.round(Math.random() * (options?.fast ? 14 : 10) - (options?.fast ? 7 : 5));
      const rise = (options?.fast ? 28 : 20) + Math.random() * (options?.fast ? 28 : 20);
      const duration = (options?.fast ? 1200 : 1800) + Math.random() * (options?.fast ? 900 : 1200);
      sparkle.style.left = `${x}%`;
      sparkle.style.top = `${y}%`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.setProperty("--drift", `${drift}px`);
      sparkle.style.setProperty("--rise", `${rise}px`);
      sparkle.style.setProperty("--dur", `${duration}ms`);
      target.appendChild(sparkle);
      sparkle.addEventListener("animationend", () => {
        sparkle.remove();
      });
    };

    const sparkleInterval = window.setInterval(() => {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        const target = sparkleBoxes[Math.floor(Math.random() * sparkleBoxes.length)].el;
        spawnSparkle(target);
      }
    }, 360);

    const packBox = sparkleBoxes.find((box) => box.isPack)?.el ?? null;
    const packSparkleInterval = window.setInterval(() => {
      if (!packBox || openPhaseRef.current !== "idle") return;
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        spawnSparkle(packBox, { fast: true });
      }
    }, 160);

    return () => {
      window.clearInterval(sparkleInterval);
      window.clearInterval(packSparkleInterval);
      sparkleBoxes.forEach((box) => box.el.remove());
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;
    const poofBox = document.createElement("div");
    poofBox.className = "inventory__claim-poof-box";
    root.appendChild(poofBox);
    poofBoxRef.current = poofBox;
    return () => {
      poofBoxRef.current = null;
      poofBox.remove();
    };
  }, []);

  const spawnClaimPoof = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = poofBoxRef.current;
    if (!box) return;
    const row = document.querySelector(".inventory-cardrow") as HTMLElement | null;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const count = 48 + Math.floor(Math.random() * 18);
    for (let i = 0; i < count; i += 1) {
      const pip = document.createElement("span");
      pip.className = "inventory__claim-pip";
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      const size = 1.6 + Math.random() * 2.8;
      const rise = 80 + Math.random() * 120;
      const drift = Math.round(Math.random() * 50 - 25);
      const duration = 1200 + Math.random() * 1200;
      const delay = Math.random() * 200;
      pip.style.left = `${x}px`;
      pip.style.top = `${y}px`;
      pip.style.width = `${size}px`;
      pip.style.height = `${size}px`;
      pip.style.setProperty("--rise", `${rise}px`);
      pip.style.setProperty("--drift", `${drift}px`);
      pip.style.setProperty("--dur", `${duration}ms`);
      pip.style.setProperty("--delay", `${delay}ms`);
      box.appendChild(pip);
      pip.addEventListener("animationend", () => {
        pip.remove();
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;

    const burstBox = document.createElement("div");
    burstBox.className = "inventory__burst-box";
    root.appendChild(burstBox);

    let rafId = 0;

    const spawnParticle = (kind: "spark" | "streak" | "dust") => {
      const span = document.createElement("span");
      span.className = `inventory__burst-${kind}`;
      const dx = Math.round(Math.random() * 840 - 420);
      const isDown = Math.random() < 0.15;
      const dy = isDown ? Math.round(240 + Math.random() * 180) : -Math.round(160 + Math.random() * 460);
      const delay = Math.round(Math.random() * 140);
      const alpha = 0.65 + Math.random() * 0.35;
      const size =
        kind === "dust"
          ? Math.round(12 + Math.random() * 10)
          : Math.round(kind === "spark" ? 3 + Math.random() * 3 : 4 + Math.random() * 3);
      const dur =
        kind === "spark"
          ? Math.round(420 + Math.random() * 340)
          : kind === "streak"
            ? Math.round(520 + Math.random() * 460)
            : Math.round(900 + Math.random() * 600);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const rot = kind === "streak" ? Math.round(angle + (Math.random() * 24 - 12)) : 0;

      span.style.setProperty("--x", "50%");
      span.style.setProperty("--y", "44%");
      span.style.setProperty("--dx", `${dx}px`);
      span.style.setProperty("--dy", `${dy}px`);
      span.style.setProperty("--dur", `${dur}ms`);
      span.style.setProperty("--delay", `${delay}ms`);
      span.style.setProperty("--sz", `${size}px`);
      span.style.setProperty("--rot", `${rot}deg`);
      span.style.setProperty("--a", `${alpha}`);

      burstBox.appendChild(span);
      span.addEventListener("animationend", () => {
        span.remove();
      });
    };

    const spawnBurst = () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const count = elapsed < 240 ? 3 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i += 1) {
          const roll = Math.random();
          const kind = roll < 0.45 ? "spark" : roll < 0.75 ? "streak" : "dust";
          spawnParticle(kind);
        }
        if (elapsed < 520) {
          rafId = window.requestAnimationFrame(tick);
        } else {
          rafId = 0;
        }
      };
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("alto:openpack:burst", spawnBurst);

    return () => {
      window.removeEventListener("alto:openpack:burst", spawnBurst);
      if (rafId) window.cancelAnimationFrame(rafId);
      burstBox.remove();
    };
  }, []);

  const handleOpenPackClick = () => {
    if (openPhase !== "idle") return;
    clearTimers();
    setRevealedCount(0);
    setFlipped(Array.from({ length: 5 }, () => false));
    setCardExitVectors([]);
    setGlowPinned(true);
    setPackResults(null);
    setPackError(null);

    // Kick the "server truth" request immediately so results are ready by reveal time.
    openPack(packs[0]?.id ?? "standard")
      .then((resp) => setPackResults(resp.results))
      .catch((err) => setPackError(err instanceof Error ? err.message : "Failed to open pack"));
    window.dispatchEvent(new CustomEvent("alto:openpack:commit"));

    if (prefersReducedMotion) {
      setOpenPhase("revealing");
      window.dispatchEvent(new CustomEvent("alto:openpack:reveal-ready"));
      return;
    }

    setOpenPhase("shaking");

    setTimeoutSafe(() => {
      setOpenPhase("burst");
      window.dispatchEvent(new CustomEvent("alto:openpack:shake-start"));
      window.dispatchEvent(new CustomEvent("alto:openpack:burst"));
      debrisRef.current = createDebrisChunks();
      setVfxKey((prev) => prev + 1);
      setVfxActive(true);
      setTimeoutSafe(() => setVfxActive(false), 1725);
    }, 748);

    setTimeoutSafe(() => {
      setOpenPhase("spawning");
    }, 748);

    setTimeoutSafe(() => {
      setOpenPhase("revealing");
      window.dispatchEvent(new CustomEvent("alto:openpack:reveal-ready"));
    }, 1518);
  };

  const handleCardFlip = (index: number, event?: MouseEvent<HTMLButtonElement>) => {
    if (openPhase !== "revealing") return;
    if (flipped[index]) return;
    setFlipped((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setRevealedCount((prev) => Math.min(5, prev + 1));
    if (typeof window !== "undefined") {
      const fallbackCard = document.querySelectorAll(".inventory-card")[index] as HTMLElement | undefined;
      const rect = event?.currentTarget?.getBoundingClientRect() ?? fallbackCard?.getBoundingClientRect() ?? null;
      window.dispatchEvent(new CustomEvent("alto:openpack:card-flip", { detail: { index, rect } }));
    }
  };

  const handleClaim = () => {
    if (openPhase !== "revealing" || revealedCount < 5) return;
    spawnClaimPoof();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("alto:openpack:claim"));
    }
    setGlowPinned(false);
    const downwardSlots = new Set<number>();
    while (downwardSlots.size < (Math.random() > 0.5 ? 1 : 2)) {
      downwardSlots.add(Math.floor(Math.random() * 5));
    }
    const vectors = Array.from({ length: 5 }, (_, index) => {
      const baseX = 900 + Math.random() * 500;
      const sway = Math.random() * 120 - 60;
      const dir = index % 2 === 0 ? 1 : -1;
      const y = downwardSlots.has(index)
        ? Math.round(650 + Math.random() * 300)
        : Math.round(-1200 + Math.random() * 550);
      return {
        x: Math.round(dir * baseX + sway),
        y,
        rot: Math.round(Math.random() * 36 - 18),
        delay: Math.round(index * 63 + Math.random() * 40),
      };
    });
    setCardExitVectors(vectors);
    setOpenPhase("claiming");
    setTimeoutSafe(() => setOpenPhase("resetting"), 2580);
    setTimeoutSafe(() => {
      setOpenPhase("idle");
      setRevealedCount(0);
      setFlipped(Array.from({ length: 5 }, () => false));
      setCardExitVectors([]);
    }, 2600);
  };

  return (
    <div
      className={`inventory-scene${openPhase === "burst" ? " is-burst" : ""}${openPhase !== "idle" ? " is-dim" : ""}${openPhase === "idle" ? " is-idle" : ""}`}
    >
      <div ref={mouseDebugRef} className="inventory-mouse-debug">
        0, 0
      </div>
      <div className="inventory-scene__bg" aria-hidden="true" />
      <div
        className={`inventory-scene__glow phase-${openPhase}${glowHovered ? " is-hovered" : ""}${glowPinned ? " is-pinned" : ""}`}
        aria-hidden="true"
      />
      <div className={`inventory-scene__glow-active${openPhase === "idle" ? " is-hidden" : ""}`} aria-hidden="true" />
      <div className={`inventory-scene__glow-overlay${glowOverlayHidden ? " is-hidden" : ""}`} aria-hidden="true" />
      <InventoryFoundationFX />
      <InventoryInteractionFX />
      <div className="inventory-scene__content">
        <div className="inventory-scene__pack-title">{packs[0]?.name}</div>
        <div className="inventory-scene__lantern-flicker" aria-hidden="true" />
        <div className="inventory-scene__lantern-flicker inventory-scene__lantern-flicker--right" aria-hidden="true" />
        <div className="inventory-scene__lantern-flicker inventory-scene__lantern-flicker--orange" aria-hidden="true" />
        <div className="inventory-scene__lantern-flicker inventory-scene__lantern-flicker--orange inventory-scene__lantern-flicker--orange-right" aria-hidden="true" />
        <div className="inventory-scene__crystal-glow" aria-hidden="true" />
        <div className={`inventory-pack-ui${isPackUiHidden ? " inventory-pack-ui--hidden" : ""}`}>
          <button
            type="button"
            className="inventory-scene__nav-icon inventory-scene__nav-icon--left"
            onClick={() => window.alert("TODO: Inventory nav left.")}
            aria-label="Inventory previous"
            disabled={openPhase !== "idle"}
          >
            <img src="/assets/ui/inventory/inventory-next_icon_left.png" alt="" />
          </button>
          <button
            type="button"
            className="inventory-scene__nav-icon inventory-scene__nav-icon--right"
            onClick={() => window.alert("TODO: Inventory nav right.")}
            aria-label="Inventory next"
            disabled={openPhase !== "idle"}
          >
            <img src="/assets/ui/inventory/inventory-next_icon_right.png" alt="" />
          </button>
          <div
            className={`inventory-scene__pack-icon${openPhase === "shaking" ? " is-shaking" : ""}`}
            aria-hidden="true"
          >
            <div className="inventory-pack-shadow" />
            <div className="inventory-pack-float">
              <div className="inventory-pack-roll">
                <div className="inventory-pack-mask">
                  <div className="inventory-pack-art" />
                  <div className="inventory-pack-glint" />
                  <div className="inventory-pack-rim" />
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className={`inventory-scene__openpack-button phase-${openPhase}`}
            onClick={handleOpenPackClick}
            onMouseEnter={() => {
              if (openPhase === "idle") setGlowHovered(true);
            }}
            onMouseLeave={() => {
              if (openPhase === "idle") setGlowHovered(false);
            }}
            onFocus={() => {
              if (openPhase === "idle") setGlowHovered(true);
            }}
            onBlur={() => {
              if (openPhase === "idle") setGlowHovered(false);
            }}
            disabled={openPhase !== "idle"}
          >
            <img src="/assets/ui/inventory/inventory-button_openpack.png" alt="Open pack" />
          </button>
          <div className="inventory-packui-overlay" aria-hidden="true">
            <button type="button" className={`inventory-openpack phase-${openPhase}`} tabIndex={-1} disabled>
              <img
                className="inventory-openpack__textmask"
                src="/assets/ui/inventory/open-pack_text_mask.png"
                alt=""
                aria-hidden="true"
              />
              <span className="inventory-openpack__fallbacktext">OPEN PACK</span>
              <span className="inventory-openpack__sr">Open pack</span>
            </button>
          </div>
        </div>
        {openPhase === "idle" && <div className="inventory-pack-ui__particle-gate" aria-hidden="true" />}
        <button type="button" className="main-menu-nav-button inventory-scene__back" onClick={() => setScene("STORE")}>
          <span className="main-menu-nav-button__art" aria-hidden="true">
            <img
              className="main-menu-nav-button__img main-menu-nav-button__img--inactive"
              src="/assets/ui/inventory/inventory-main-btn_inactive.png"
              alt=""
            />
            <img
              className="main-menu-nav-button__img main-menu-nav-button__img--active"
              src="/assets/ui/inventory/inventory-main-btn_active.png"
              alt=""
            />
          </span>
          <span className="main-menu-nav-button__label">Back</span>
        </button>
        <button
          type="button"
          className="main-menu-nav-button inventory-scene__exit"
          onClick={() => setScene("MAIN_MENU")}
        >
          <span className="main-menu-nav-button__art" aria-hidden="true">
            <img
              className="main-menu-nav-button__img main-menu-nav-button__img--inactive"
              src="/assets/ui/inventory/inventory-main-btn_inactive.png"
              alt=""
            />
            <img
              className="main-menu-nav-button__img main-menu-nav-button__img--active"
              src="/assets/ui/inventory/inventory-main-btn_active.png"
              alt=""
            />
          </span>
          <span className="main-menu-nav-button__label">EXIT</span>
        </button>
      </div>
      {vfxActive && (
        <div key={vfxKey} className="inventory-pack-vfx" aria-hidden="true">
          <div className="inventory-pack-vfx__bloom" />
          <div className="inventory-pack-vfx__rays" />
          <img
            className="inventory-pack-vfx__shockwave"
            src="/assets/ui/inventory/vfx/vfx_pack_shockwave.png"
            alt=""
          />
          <img
            className="inventory-pack-vfx__coreflash"
            src="/assets/ui/inventory/vfx/vfx_pack_core_flash.png"
            alt=""
          />
          <img
            className="inventory-pack-vfx__runering"
            src="/assets/ui/inventory/vfx/vfx_pack_rune_ring.png"
            alt=""
          />
          <img
            className="inventory-pack-vfx__wisps"
            src="/assets/ui/inventory/vfx/vfx_pack_energy_wisps.png"
            alt=""
          />
          <div className="inventory-pack-vfx__debris">
            {debrisRef.current.map((chunk) => (
              <span
                key={chunk.id}
                className="inventory-pack-vfx__debris-chunk"
                style={{
                  ["--dx" as any]: `${chunk.x}px`,
                  ["--dy" as any]: `${chunk.y}px`,
                  ["--dx-fast" as any]: `${chunk.xFast}px`,
                  ["--dy-fast" as any]: `${chunk.yFast}px`,
                  ["--rot" as any]: `${chunk.rot}deg`,
                  ["--delay" as any]: `${chunk.delay}ms`,
                  ["--dur" as any]: `${chunk.duration}ms`,
                  ["--scale" as any]: chunk.scale,
                }}
              />
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        className={`inventory-button_claim${
          openPhase === "spawning" || openPhase === "revealing" ? "" : " is-hidden"
        }`}
        onClick={handleClaim}
        disabled={openPhase !== "revealing" || revealedCount < 5}
        aria-label="Claim pack"
      >
        <img src="/assets/ui/inventory/inventory-button_claimpack.png" alt="Claim pack" />
      </button>
      {cardsVisible && (
        <div className={`inventory-cardrow phase-${openPhase}`}>
          {Array.from({ length: 5 }, (_, index) => {
            const vector = cardExitVectors[index];
            const rarity = packResults?.[index]?.rarity ?? "common";
            return (
              <button
                key={`card-${index}`}
                type="button"
                className={`inventory-card rarity-${rarity}${flipped[index] ? " is-flipped" : ""}${
                  openPhase === "claiming" ? " is-exiting" : ""
                }`}
                data-rarity={rarity}
                style={{
                  ["--i" as any]: index,
                  ["--exit-x" as any]: vector ? `${vector.x}px` : "0px",
                  ["--exit-y" as any]: vector ? `${vector.y}px` : "0px",
                  ["--exit-rot" as any]: vector ? `${vector.rot}deg` : "0deg",
                  ["--exit-delay" as any]: vector ? `${vector.delay}ms` : "0ms",
                }}
                onClick={(event) => handleCardFlip(index, event)}
                disabled={flipped[index] || openPhase !== "revealing"}
                aria-label={
                  flipped[index]
                    ? `Card ${index + 1} revealed (${rarity})`
                    : `Reveal card ${index + 1}`
                }
              >
                <div className="inventory-card__inner">
                  <div
                    className="inventory-card__face inventory-card__back"
                    style={{ backgroundImage: "url(/assets/ui/inventory/card_back.png)" }}
                  />
                  <div className="inventory-card__face inventory-card__front" aria-hidden="true">
                    <span className="inventory-card__frontGlow" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryScene;
