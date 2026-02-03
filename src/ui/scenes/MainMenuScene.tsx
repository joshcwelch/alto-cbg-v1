import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUIStore } from "../state/useUIStore";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import ArtSlot from "../components/ArtSlot";

const MainMenuScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const resetPlayFlow = usePlayFlowStore((state) => state.resetAll);
  const [bgTarget, setBgTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    setBgTarget(document.querySelector(".ui-shell"));
    const safeFrame = document.querySelector(".ui-safe-frame");
    safeFrame?.classList.add("ui-safe-frame--mainmenu");

    return () => {
      safeFrame?.classList.remove("ui-safe-frame--mainmenu");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const baseW = 1920;
    const baseH = 1080;
    const root = document.documentElement;
    const updateScale = () => {
      const fit = Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
      const scale = Math.max(0.65, Math.min(1.25, fit));
      root.style.setProperty("--mm-structure-scale", String(scale));
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ambience = new Audio("/assets/sounds/forest-ambience-morningspring-localization-poland-4-296923.mp3");
    const nightAmbience = new Audio("/assets/sounds/night-atmosphere-with-crickets-374652.mp3");
    ambience.loop = true;
    nightAmbience.loop = true;
    const ambienceVolume = 0.03;
    const nightVolume = 0.15;
    ambience.volume = ambienceVolume;
    nightAmbience.volume = nightVolume;

    const startLoopFade = (audio: HTMLAudioElement, baseVolume: number) => {
      const fadeMs = 1400;
      const intervalId = window.setInterval(() => {
        if (!audio.duration || Number.isNaN(audio.duration)) return;
        const remaining = audio.duration - audio.currentTime;
        if (remaining <= fadeMs / 1000) {
          const t = Math.max(0, remaining / (fadeMs / 1000));
          audio.volume = baseVolume * t;
        } else if (audio.volume !== baseVolume) {
          audio.volume = baseVolume;
        }
      }, 200);
      return () => window.clearInterval(intervalId);
    };

    const startAudio = () => {
      ambience.play().catch(() => undefined);
      nightAmbience.play().catch(() => undefined);
    };

    startAudio();
    const stopAmbienceFade = startLoopFade(ambience, ambienceVolume);
    const stopNightFade = startLoopFade(nightAmbience, nightVolume);

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
      stopAmbienceFade();
      stopNightFade();
      ambience.pause();
      nightAmbience.pause();
      ambience.currentTime = 0;
      nightAmbience.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".mainmenu-root") as HTMLElement | null;
    if (!root) return;

    const canvas = document.createElement("canvas");
    canvas.className = "mainmenu__fireflies";
    root.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => canvas.remove();

    const dpr = window.devicePixelRatio || 1;
    const spawnFly = (w: number, h: number) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.1 + Math.random() * 1.4,
      vx: (Math.random() * 18 + 6) * (Math.random() < 0.5 ? 1 : -1),
      vy: (Math.random() * 12 + 4) * (Math.random() < 0.5 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
      glow: 0.35 + Math.random() * 0.3,
      age: Math.random() * 4,
      life: 4 + Math.random() * 4,
    });
    let fireflies: Array<ReturnType<typeof spawnFly>> = [];

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number, delta: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      if (fireflies.length === 0) {
        fireflies = Array.from({ length: 22 }).map(() => spawnFly(w, h));
      }
      fireflies.forEach((fly, idx) => {
        fly.age += delta;
        if (fly.age >= fly.life) {
          fireflies[idx] = spawnFly(w, h);
          return;
        }
        fly.phase += delta * (1.2 + Math.random() * 0.2);
        const driftX = Math.sin(fly.phase * 0.7) * 0.12;
        const driftY = Math.cos(fly.phase * 0.6) * 0.1;
        fly.x += (fly.vx + driftX * 20) * delta;
        fly.y += (fly.vy + driftY * 16) * delta;
        if (fly.x < -40 || fly.x > w + 40 || fly.y < -40 || fly.y > h + 40) {
          fireflies[idx] = spawnFly(w, h);
          return;
        }

        const fadeIn = Math.min(1, fly.age / 0.8);
        const fadeOut = Math.min(1, (fly.life - fly.age) / 0.9);
        const alpha = fly.glow * fadeIn * fadeOut;
        const px = fly.x;
        const py = fly.y;
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, fly.r * 6);
        gradient.addColorStop(0, `rgba(255, 230, 160, ${0.6 * alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 200, 120, ${0.25 * alpha})`);
        gradient.addColorStop(1, "rgba(255, 190, 120, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, fly.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 240, 190, ${0.8 * alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, fly.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    };

    let rafId = 0;
    let lastTime = 0;
    const frame = (now: number) => {
      const delta = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 0.016);
      lastTime = now;
      draw(now / 1000, delta);
      rafId = window.requestAnimationFrame(frame);
    };

    resize();
    rafId = window.requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, [bgTarget]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".main-menu-scene") as HTMLElement | null;
    if (!root) return;

    const flameCanvas = document.createElement("canvas");
    flameCanvas.className = "mainmenu__lantern-flames";
    root.appendChild(flameCanvas);
    const ctx = flameCanvas.getContext("2d");
    if (!ctx) return () => flameCanvas.remove();

    const dpr = window.devicePixelRatio || 1;
    let rafId = 0;

    const flames = [
      { anchorX: 247, anchorY: 710, scale: 1.0, seed: 1.4 },
      { anchorX: 1683, anchorY: 710, scale: 1.0, seed: 1.4 },
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
        const height = size * 1.25;
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".main-menu-scene") as HTMLElement | null;
    if (!root) return;

    const boxes = ["mainmenu__pip-box", "mainmenu__pip-box mainmenu__pip-box--right"].map(
      (className) => {
        const box = document.createElement("div");
        box.className = className;
        root.appendChild(box);
        return box;
      }
    );

    const spawnPip = () => {
      const pip = document.createElement("span");
      pip.className = "mainmenu__pip";
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
      const target = boxes[Math.floor(Math.random() * boxes.length)];
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
      boxes.forEach((box) => box.remove());
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".main-menu-scene") as HTMLElement | null;
    if (!root) return;
    const boxes = ["mainmenu__smoke-box", "mainmenu__smoke-box mainmenu__smoke-box--right"].map(
      (className) => {
        const box = document.createElement("div");
        box.className = className;
        root.appendChild(box);
        return box;
      }
    );

    const spawnSmoke = () => {
      const puff = document.createElement("span");
      puff.className = "mainmenu__smoke";
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
      const target = boxes[Math.floor(Math.random() * boxes.length)];
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
      boxes.forEach((box) => box.remove());
    };
  }, []);

  return (
    <>
      {bgTarget
        ? createPortal(
            <div className="mainmenu-root alto-menu--fx" aria-hidden="true">
              <div className="mainmenu-bg">
                <ArtSlot assetKey="mainMenuStoneStructure" className="mm-structure" alt="" />
              </div>
              <div className="mainmenu-fx mainmenu-fx--rays" />
              <div className="mainmenu-fx mainmenu-fx--dust" />
              <div className="mainmenu-fx mainmenu-fx--torch mainmenu-fx--torch-left" />
              <div className="mainmenu-fx mainmenu-fx--torch mainmenu-fx--torch-right" />
            </div>,
            bgTarget,
          )
        : null}
      <div className="main-menu-scene alto-menu alto-menu--polish">
        <button
          type="button"
          className="mainmenu__questsBadge"
          onClick={() => setScene("QUESTS")}
          aria-label="Open quests"
        >
          <ArtSlot assetKey="mainMenuQuestsBadge" className="ui-art" alt="" />
        </button>
        <button
          type="button"
          className="mainmenu__playerPanel"
          onClick={() => setScene("PROFILE")}
          aria-label="Open player profile"
        >
          <ArtSlot
            assetKey="mainMenuProfileAvatar"
            className="mainmenu__playerPanelAvatar mainmenu__playerPanelAvatar--behind"
            alt=""
          />
          <ArtSlot assetKey="mainMenuPlayerPanel" className="ui-art mainmenu__playerPanelFrame" alt="" />
          <div className="mainmenu__playerPanelContent">
            <div className="mainmenu__playerPanelDetails">
              <div className="mainmenu__playerPanelCurrency">
                <span className="mainmenu__playerPanelCurrencyGold">Gold: 1,250</span>
                <span className="mainmenu__playerPanelCurrencyShards">350</span>
              </div>
            </div>
          </div>
        </button>
        <header className="main-menu-header">
          <div className="main-menu-title">
          </div>
        </header>

        <div className="main-menu-body">
          <div className="main-menu-quests" />
          
        </div>

        <nav className="main-menu-nav">
          <div className="main-menu-nav__primary">
            <button
              type="button"
              className="main-menu-nav-button"
              onClick={() => {
                resetPlayFlow();
                setScene("WORLD_MAP");
              }}
            >
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">Play</span>
            </button>
            <button
              type="button"
              className="main-menu-nav-button"
              onClick={() => {
                setScene("COLLECTION");
              }}
            >
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">COLLECTON</span>
            </button>
            <button type="button" className="main-menu-nav-button" onClick={() => setScene("STORE")}>
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">Store</span>
            </button>
            <button type="button" className="main-menu-nav-button" onClick={() => setScene("OPTIONS")}>
              <span className="main-menu-nav-button__art" aria-hidden="true">
                <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
                <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
              </span>
              <span className="main-menu-nav-button__label">Options</span>
            </button>
          </div>
          <button
            type="button"
            className="main-menu-nav-button main-menu-nav__exit"
            onClick={() => {
              const confirmExit = window.confirm("Exit the game and return to the main menu?");
              if (confirmExit) {
                setScene("MAIN_MENU");
                // TODO: Hook into desktop exit flow when available.
              }
            }}
          >
            <span className="main-menu-nav-button__art" aria-hidden="true">
              <ArtSlot assetKey="mainMenuButtonInactive" className="main-menu-nav-button__img main-menu-nav-button__img--inactive" alt="" />
              <ArtSlot assetKey="mainMenuButtonActive" className="main-menu-nav-button__img main-menu-nav-button__img--active" alt="" />
            </span>
            <span className="main-menu-nav-button__label">Exit</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default MainMenuScene;
