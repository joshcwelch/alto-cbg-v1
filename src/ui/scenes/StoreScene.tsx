import { useEffect, useRef, useState } from "react";
import { useUIStore } from "../state/useUIStore";

const StoreScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const countdownTargetRef = useRef(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const msInHour = 1000 * 60 * 60;
    const msInDay = msInHour * 24;

    const tick = () => {
      const diff = Math.max(0, countdownTargetRef.current - Date.now());
      const days = Math.floor(diff / msInDay);
      const hours = Math.floor((diff % msInDay) / msInHour);
      setTimeLeft({ days, hours });
    };

    tick();
    const intervalId = window.setInterval(tick, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ambience = new Audio("/assets/sounds/ui/market-67442.mp3");
    ambience.loop = true;
    const ambienceVolume = 0.6;
    ambience.volume = ambienceVolume;

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

    const bellCtx = new AudioContext();
    let bellBuffer: AudioBuffer | null = null;
    let bellCanceled = false;
    let bellLoading: Promise<void> | null = null;

    const loadBell = async () => {
      if (bellBuffer || bellLoading) {
        return bellLoading;
      }
      bellLoading = fetch("/assets/sounds/church-bells-194653.mp3")
        .then((response) => response.arrayBuffer())
        .then((data) => bellCtx.decodeAudioData(data))
        .then((buffer) => {
          bellBuffer = buffer;
        })
        .catch(() => undefined);
      return bellLoading;
    };

    const playBellOnce = async () => {
      if (bellCanceled) return;
      await loadBell();
      if (!bellBuffer || bellCanceled) return;
      if (bellCtx.state === "suspended") {
        await bellCtx.resume().catch(() => undefined);
      }
      const source = bellCtx.createBufferSource();
      source.buffer = bellBuffer;
      const dryGain = bellCtx.createGain();
      const wetGain = bellCtx.createGain();
      const mainGain = bellCtx.createGain();
      const delay = bellCtx.createDelay(0.4);
      const feedback = bellCtx.createGain();

      mainGain.gain.value = 0.5;
      dryGain.gain.value = 1;
      wetGain.gain.value = 0.4;
      delay.delayTime.value = 0.18;
      feedback.gain.value = 0.18;

      source.connect(mainGain);
      mainGain.connect(dryGain);
      mainGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);
      dryGain.connect(bellCtx.destination);
      wetGain.connect(bellCtx.destination);

      const now = bellCtx.currentTime;
      const fadeStart = Math.max(0, bellBuffer.duration - 0.8);
      mainGain.gain.setValueAtTime(0.5, now);
      mainGain.gain.setValueAtTime(0.5, now + fadeStart);
      mainGain.gain.linearRampToValueAtTime(0.0, now + bellBuffer.duration);

      source.start(0);
      source.onended = () => {
        source.disconnect();
        mainGain.disconnect();
        dryGain.disconnect();
        wetGain.disconnect();
        delay.disconnect();
        feedback.disconnect();
      };

      await new Promise<void>((resolve) => {
        source.addEventListener("ended", () => resolve(), { once: true });
      });
    };

    const playBell = async () => {
      if (bellCanceled) return;
      await playBellOnce();
      if (bellCanceled) return;
      await playBellOnce();
    };

    const bellInterval = window.setInterval(() => {
      void playBell();
    }, 30000);

    const resumeOnGesture = () => {
      startAudio();
      if (bellCtx.state === "suspended") {
        bellCtx.resume().catch(() => undefined);
      }
      void loadBell();
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
      window.clearInterval(bellInterval);
      bellCanceled = true;
      bellCtx.close().catch(() => undefined);
    };
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".store-scene") as HTMLElement | null;
    if (!root) return;

    const pipBoxes = ["store-scene__pip-box", "store-scene__pip-box store-scene__pip-box--right"].map(
      (className) => {
        const box = document.createElement("div");
        box.className = className;
        root.appendChild(box);
        return box;
      }
    );

    const gemParticleBox = document.createElement("div");
    gemParticleBox.className = "store-scene__gem-particle-box";
    root.appendChild(gemParticleBox);

    const smokeBoxes = ["store-scene__smoke-box", "store-scene__smoke-box store-scene__smoke-box--right"].map(
      (className) => {
        const box = document.createElement("div");
        box.className = className;
        root.appendChild(box);
        return box;
      }
    );

    const atmosphereBox = document.createElement("div");
    atmosphereBox.className = "store-scene__atmosphere-box";
    root.appendChild(atmosphereBox);

    const sparkleBoxes = [
      "store-scene__sparkle-box",
      "store-scene__sparkle-box store-scene__sparkle-box--right",
      "store-scene__sparkle-box store-scene__sparkle-box--far-right",
    ].map((className) => {
      const box = document.createElement("div");
      box.className = className;
      root.appendChild(box);
      return box;
    });

    const flameCanvas = document.createElement("canvas");
    flameCanvas.className = "store-scene__lantern-flames";
    root.appendChild(flameCanvas);
    const ctx = flameCanvas.getContext("2d");
    if (!ctx) {
      pipBoxes.forEach((box) => box.remove());
      smokeBoxes.forEach((box) => box.remove());
      flameCanvas.remove();
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    let rafId = 0;
    const anchors = pipBoxes.map(() => ({ x: 0, y: 0 }));
    const flameOffsetX = 5;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      flameCanvas.width = Math.max(1, Math.floor(width * dpr));
      flameCanvas.height = Math.max(1, Math.floor(height * dpr));
      flameCanvas.style.width = `${width}px`;
      flameCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pipBoxes.forEach((box, index) => {
        const rect = box.getBoundingClientRect();
        anchors[index].x = rect.left + rect.width / 2;
        anchors[index].y = rect.top + rect.height;
      });
    };

    const drawFlame = (cx: number, cy: number, size: number, time: number, seed: number) => {
      const baseW = size * 0.58;
      const baseH = size * 0.9;
      const flicker = 0.9 + 0.08 * Math.sin(time * 3.2 + seed * 2.1);
      const wobble = 0.08 * Math.sin(time * 6.1 + seed * 1.7);
      const sway = 0.12 * Math.sin(time * 1.8 + seed * 3.4);
      const width = baseW * (0.9 + 0.15 * Math.sin(time * 4.1 + seed));
      const height = baseH * (0.95 + 0.12 * Math.sin(time * 3.6 + seed * 2.5));
      const tilt = width * wobble;

      ctx.globalCompositeOperation = "screen";

      const outer = ctx.createLinearGradient(cx, cy - height, cx, cy + height * 0.35);
      outer.addColorStop(0, "rgba(255, 230, 160, 0.95)");
      outer.addColorStop(0.55, "rgba(235, 170, 80, 0.75)");
      outer.addColorStop(1, "rgba(120, 70, 20, 0.1)");

      ctx.fillStyle = outer;
      ctx.globalAlpha = 0.82 * flicker;
      ctx.shadowColor = "rgba(255, 200, 120, 0.45)";
      ctx.shadowBlur = size * 0.4;
      const edgeJitter = size * 0.03 * Math.sin(time * 7.3 + seed * 4.1);
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.55, cy + height * 0.35);
      ctx.bezierCurveTo(
        cx - width * 0.75 + tilt - edgeJitter,
        cy - height * 0.1 + edgeJitter,
        cx - width * 0.2 + tilt + edgeJitter,
        cy - height * 0.8,
        cx + tilt,
        cy - height - edgeJitter
      );
      ctx.bezierCurveTo(
        cx + width * 0.2 + tilt - edgeJitter,
        cy - height * 0.8,
        cx + width * 0.75 + tilt + edgeJitter,
        cy - height * 0.1 + edgeJitter,
        cx + width * 0.55 + edgeJitter,
        cy + height * 0.35
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      const inner = ctx.createLinearGradient(cx, cy - height, cx, cy + height * 0.2);
      inner.addColorStop(0, "rgba(255, 245, 210, 0.98)");
      inner.addColorStop(0.55, "rgba(255, 200, 130, 0.85)");
      inner.addColorStop(1, "rgba(140, 90, 30, 0)");

      ctx.fillStyle = inner;
      ctx.globalAlpha = 0.78 * flicker;
      ctx.shadowColor = "rgba(255, 220, 160, 0.35)";
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
      ctx.fillStyle = "rgba(255, 230, 170, 0.9)";
      ctx.beginPath();
      ctx.ellipse(cx + sway * size * 0.12, cy - height * 0.1, size * 0.12, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const spawnPip = () => {
      const pip = document.createElement("span");
      pip.className = "store-scene__pip";
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

    const spawnSmoke = () => {
      const puff = document.createElement("span");
      puff.className = "store-scene__smoke";
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

    const pipInterval = window.setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        spawnPip();
      }
    }, 420);

    const spawnGemParticle = () => {
      const rect = gemParticleBox.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const particle = document.createElement("span");
      const palette = ["store-scene__gem-particle--white", "store-scene__gem-particle--blue", "store-scene__gem-particle--gold"];
      particle.className = `store-scene__gem-particle ${palette[Math.floor(Math.random() * palette.length)]}`;
      const size = 2 + Math.random() * 3.5;
      const startX = rect.width * 0.5 + (Math.random() * 2 - 1) * rect.width * 0.18;
      const startY = rect.height * (0.72 + Math.random() * 0.22);
      const dx = (Math.random() * 2 - 1) * rect.width * (0.28 + Math.random() * 0.18);
      const dy = -(rect.height * (0.45 + Math.random() * 0.4));
      const duration = 5200 + Math.random() * 2400;
      const delay = Math.random() * 800;
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty("--dx", `${dx}px`);
      particle.style.setProperty("--dy", `${dy}px`);
      particle.style.setProperty("--dur", `${duration}ms`);
      particle.style.setProperty("--delay", `${delay}ms`);
      gemParticleBox.appendChild(particle);
      particle.addEventListener("animationend", () => {
        particle.remove();
      });
    };

    const gemParticleInterval = window.setInterval(() => {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        spawnGemParticle();
      }
    }, 800);

    const smokeInterval = window.setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        spawnSmoke();
      }
    }, 520);

    const spawnSparkle = () => {
      const sparkle = document.createElement("span");
      const isGold = Math.random() > 0.45;
      sparkle.className = `store-scene__sparkle ${isGold ? "store-scene__sparkle--gold" : "store-scene__sparkle--white"}`;
      const x = 8 + Math.random() * 84;
      const y = 10 + Math.random() * 80;
      const size = 2 + Math.random() * 2.6;
      const drift = Math.round(Math.random() * 12 - 6);
      const rise = 24 + Math.random() * 26;
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
      const count = 10 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        spawnSparkle();
      }
    }, 260);

    const spawnAtmosphereParticle = () => {
      const particle = document.createElement("span");
      const isGold = Math.random() > 0.6;
      particle.className = `store-scene__atmosphere-particle ${
        isGold ? "store-scene__atmosphere-particle--gold" : "store-scene__atmosphere-particle--white"
      }`;
      const size = 1 + Math.random() * 2.2;
      const drift = Math.round(Math.random() * 16 - 8);
      const rise = 30 + Math.random() * 70;
      const duration = 4200 + Math.random() * 2200;
      const delay = Math.random() * 600;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty("--drift", `${drift}px`);
      particle.style.setProperty("--rise", `${rise}px`);
      particle.style.setProperty("--dur", `${duration}ms`);
      particle.style.setProperty("--delay", `${delay}ms`);
      atmosphereBox.appendChild(particle);
      particle.addEventListener("animationend", () => {
        particle.remove();
      });
    };

    const atmosphereInterval = window.setInterval(() => {
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        spawnAtmosphereParticle();
      }
    }, 900);

    const frame = (now: number) => {
      const time = now / 1000;
      ctx.clearRect(0, 0, flameCanvas.clientWidth, flameCanvas.clientHeight);
      const baseSize = Math.min(window.innerWidth, window.innerHeight) * 0.065;
      anchors.forEach((anchor, index) => {
        drawFlame(
          anchor.x + flameOffsetX,
          anchor.y - baseSize * 0.35,
          baseSize,
          time,
          1.4 + index * 0.9
        );
      });
      rafId = window.requestAnimationFrame(frame);
    };

    resize();
    rafId = window.requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.clearInterval(pipInterval);
      window.clearInterval(gemParticleInterval);
      window.clearInterval(smokeInterval);
      window.clearInterval(sparkleInterval);
      window.clearInterval(atmosphereInterval);
      window.cancelAnimationFrame(rafId);
      pipBoxes.forEach((box) => box.remove());
      gemParticleBox.remove();
      smokeBoxes.forEach((box) => box.remove());
      sparkleBoxes.forEach((box) => box.remove());
      atmosphereBox.remove();
      flameCanvas.remove();
    };
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(".store-scene") as HTMLElement | null;
    if (!root) return;
    const readout = document.createElement("div");
    readout.className = "store-scene__cursor-readout";
    root.appendChild(readout);
    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "store-scene__refresh-button";
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
    <div className="store-scene">
      <div className="store-scene__bg" aria-hidden="true" />
      <div className="store-scene__content">
        <button
          type="button"
          className="store-scene__featured-hitbox"
          onClick={() => window.alert("TODO: Buy Magistrate Bundle.")}
          aria-label="Buy Magistrate Bundle"
        />
        <div className="store-scene__featured-wrap" aria-hidden="true">
          <img
            className="store-scene__featured-art"
            src="/assets/ui/store/store-featured-bundle_lora.png"
            alt="Featured bundle"
          />
        </div>
        <div className="store-scene__dialog-box" aria-hidden="true">
          <div className="store-scene__dialog-frame" />
        </div>
        <div className="store-scene__featured-label">FEATURED</div>
        <div className="store-scene__featured-cta" aria-hidden="true">
          <img src="/assets/ui/store/store-featured-bundle-btn.png" alt="" />
        </div>
        <div className="store-scene__featured-label store-scene__featured-title">
          MAGISTRATE BUNDLE
        </div>
        <div className="store-scene__featured-subtitle">
          INCLUDES LORA CALDAIR, THE MAGISTRATE
        </div>
        <div className="store-scene__featured-meta">
          <div className="store-scene__featured-includes">
            <span>- 2000 GOLD</span>
            <span>- 1000 SHARDS</span>
            <span className="store-scene__featured-includes-title">- "The Magistrate" Title</span>
          </div>
          <div className="store-scene__featured-countdown" aria-label="Time left in store rotation">
            <span className="store-scene__featured-countdown-label">TIME LEFT</span>
            <span className="store-scene__featured-countdown-value">
              {String(timeLeft.days).padStart(2, "0")}
              <span className="store-scene__featured-countdown-unit">D</span>{" "}
              {String(timeLeft.hours).padStart(2, "0")}
              <span className="store-scene__featured-countdown-unit">H</span>
            </span>
          </div>
        </div>
        <div className="store-scene__lantern-flicker" aria-hidden="true" />
        <div className="store-scene__lantern-flicker store-scene__lantern-flicker--left" aria-hidden="true" />
        <div className="store-scene__lantern-flicker store-scene__lantern-flicker--mid" aria-hidden="true" />
        <div className="store-scene__lantern-flicker store-scene__lantern-flicker--mid-right" aria-hidden="true" />
        <div className="store-scene__lantern-flicker store-scene__lantern-flicker--right" aria-hidden="true" />
        <div className="store-scene__lantern-flicker store-scene__lantern-flicker--far-right" aria-hidden="true" />
        <div className="store-scene__gem-pip" aria-hidden="true" />
        <div className="store-scene__gem-pip store-scene__gem-pip--orange" aria-hidden="true" />
        <div className="store-scene__gem-pip store-scene__gem-pip--blue-low" aria-hidden="true" />
        <div className="store-scene__gem-pip store-scene__gem-pip--blue-low store-scene__gem-pip--blue-bottom" aria-hidden="true" />
        <div className="store-scene__count-pip" aria-hidden="true">1</div>
        <div className="store-scene__pack-label">1 PACK</div>
        <div className="store-scene__pack-label store-scene__pack-label--right">3 PACKS</div>
        <div className="store-scene__pack-label store-scene__pack-label--far-right">5 PACKS</div>
        <button
          type="button"
          className="store-scene__inventory-button"
          onClick={() => setScene("INVENTORY")}
          aria-label="Open inventory"
        >
          <span className="store-scene__inventory-radiance" aria-hidden="true" />
          <img src="/assets/ui/store/store-inventory-button.png" alt="" />
        </button>
        <img
          className="store-scene__pack-icon store-scene__pack-icon--one"
          src="/assets/ui/store/store-pack-icon_one.png"
          alt=""
        />
        <img
          className="store-scene__pack-icon store-scene__pack-icon--three"
          src="/assets/ui/store/store-pack-icon_three.png"
          alt=""
        />
        <img
          className="store-scene__pack-icon store-scene__pack-icon--five"
          src="/assets/ui/store/store-pack-icon_five.png"
          alt=""
        />
        <button
          type="button"
          className="store-scene__pack-value"
          onClick={() => window.alert("TODO: Purchase 1 Pack.")}
        >
          <img
            className="store-scene__pack-value-icon"
            src="/assets/ui/store/store-gold_icon.png"
            alt=""
          />
          <span>100</span>
        </button>
        <button
          type="button"
          className="store-scene__pack-value store-scene__pack-value--right"
          onClick={() => window.alert("TODO: Purchase 3 Packs.")}
        >
          <img
            className="store-scene__pack-value-icon"
            src="/assets/ui/store/store-gold_icon.png"
            alt=""
          />
          <span>250</span>
        </button>
        <button
          type="button"
          className="store-scene__pack-value store-scene__pack-value--far-right"
          onClick={() => window.alert("TODO: Purchase 5 Packs.")}
        >
          <img
            className="store-scene__pack-value-icon"
            src="/assets/ui/store/store-gold_icon.png"
            alt=""
          />
          <span>400</span>
        </button>
        <button
          type="button"
          className="store-scene__shards-button"
          onClick={() => window.alert("TODO: Buy more shards.")}
          aria-label="Buy more shards"
        >
          <img src="/assets/ui/store/store-gold-button_add.png" alt="" />
        </button>
        <button
          type="button"
          className="store-scene__shards-button store-scene__shards-button--right"
          onClick={() => window.alert("TODO: Buy more gold.")}
          aria-label="Buy more gold"
        >
          <img src="/assets/ui/store/store-gold-button_add.png" alt="" />
        </button>
        <span className="store-scene__currency-label store-scene__currency-label--left" aria-hidden="true">
          <img src="/assets/ui/store/store-shard_icon.png" alt="" />
          <span>350</span>
        </span>
        <span className="store-scene__currency-label store-scene__currency-label--right" aria-hidden="true">
          <img src="/assets/ui/store/store-gold_icon.png" alt="" />
          <span>1250</span>
        </span>
        <button
          type="button"
          className="main-menu-nav-button store-scene__back"
          onClick={() => setScene("MAIN_MENU")}
        >
          <span className="main-menu-nav-button__art" aria-hidden="true">
            <img
              className="main-menu-nav-button__img main-menu-nav-button__img--inactive"
              src="/assets/ui/store/store-main-btn_inactive.png"
              alt=""
            />
            <img
              className="main-menu-nav-button__img main-menu-nav-button__img--active"
              src="/assets/ui/store/store-main-btn_active.png"
              alt=""
            />
          </span>
          <span className="main-menu-nav-button__label">Exit</span>
        </button>
      </div>
    </div>
  );
};

export default StoreScene;
