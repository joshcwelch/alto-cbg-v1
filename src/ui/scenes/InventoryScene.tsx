import { useEffect, useRef, useState } from "react";
import { useUIStore } from "../state/useUIStore";

const InventoryScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);

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
  }, [refreshNonce]);

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
  }, [refreshNonce]);

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
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;

    const sparkleBoxes = [
      "inventory__sparkle-box inventory__sparkle-box--left",
      "inventory__sparkle-box inventory__sparkle-box--right",
    ].map((className) => {
      const box = document.createElement("div");
      box.className = className;
      root.appendChild(box);
      return box;
    });

    const spawnSparkle = () => {
      const sparkle = document.createElement("span");
      const isGold = Math.random() > 0.5;
      sparkle.className = `inventory__sparkle ${isGold ? "inventory__sparkle--gold" : "inventory__sparkle--white"}`;
      const x = 8 + Math.random() * 84;
      const y = 10 + Math.random() * 80;
      const size = 2 + Math.random() * 2.4;
      const drift = Math.round(Math.random() * 10 - 5);
      const rise = 20 + Math.random() * 20;
      const duration = 1800 + Math.random() * 1200;
      sparkle.style.left = `${x}%`;
      sparkle.style.top = `${y}%`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.setProperty("--drift", `${drift}px`);
      sparkle.style.setProperty("--rise", `${rise}px`);
      sparkle.style.setProperty("--dur", `${duration}ms`);
      const target = sparkleBoxes[Math.floor(Math.random() * sparkleBoxes.length)];
      target.appendChild(sparkle);
      sparkle.addEventListener("animationend", () => {
        sparkle.remove();
      });
    };

    const sparkleInterval = window.setInterval(() => {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        spawnSparkle();
      }
    }, 360);

    return () => {
      window.clearInterval(sparkleInterval);
      sparkleBoxes.forEach((box) => box.remove());
    };
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(".inventory-scene") as HTMLElement | null;
    if (!root) return;
    const readout = document.createElement("div");
    readout.className = "inventory-scene__cursor-readout";
    root.appendChild(readout);
    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "inventory-scene__refresh-button";
    refreshButton.textContent = "Refresh Scene";
    refreshButton.addEventListener("click", () => {
      setRefreshNonce((value) => value + 1);
    });
    root.appendChild(refreshButton);

    const onMove = (event: MouseEvent) => {
      readout.textContent = `x:${Math.round(event.clientX)} y:${Math.round(event.clientY)}`;
    };

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      readout.remove();
      refreshButton.remove();
    };
  }, [refreshNonce]);

  return (
    <div className="inventory-scene">
      <div className="inventory-scene__bg" aria-hidden="true" />
      <div className="inventory-scene__glow" aria-hidden="true" />
      <div className="inventory-scene__content">
        <div className="inventory-scene__pack-title">
          Alto Standard Pack - Single <span>(1)</span>
        </div>
        <div className="inventory-scene__lantern-flicker" aria-hidden="true" />
        <div className="inventory-scene__lantern-flicker inventory-scene__lantern-flicker--right" aria-hidden="true" />
        <div className="inventory-scene__lantern-flicker inventory-scene__lantern-flicker--orange" aria-hidden="true" />
        <div className="inventory-scene__lantern-flicker inventory-scene__lantern-flicker--orange inventory-scene__lantern-flicker--orange-right" aria-hidden="true" />
        <div className="inventory-scene__crystal-glow" aria-hidden="true" />
        <button
          type="button"
          className="inventory-scene__nav-icon inventory-scene__nav-icon--left"
          onClick={() => window.alert("TODO: Inventory nav left.")}
          aria-label="Inventory previous"
        >
          <img src="/assets/ui/inventory/inventory-next_icon_left.png" alt="" />
        </button>
        <button
          type="button"
          className="inventory-scene__nav-icon inventory-scene__nav-icon--right"
          onClick={() => window.alert("TODO: Inventory nav right.")}
          aria-label="Inventory next"
        >
          <img src="/assets/ui/inventory/inventory-next_icon_right.png" alt="" />
        </button>
        <img className="inventory-scene__pack-icon" src="/assets/ui/inventory/inventory-pack_icon.png" alt="" />
        <button
          type="button"
          className="inventory-scene__openpack-button"
          onClick={() => window.alert("TODO: Open pack.")}
        >
          <img src="/assets/ui/inventory/inventory-button_openpack.png" alt="Open pack" />
        </button>
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
      </div>
    </div>
  );
};

export default InventoryScene;
