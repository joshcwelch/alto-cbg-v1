/**
 * PROFILE V1 (FROZEN)
 * Layout/classes are locked. Only allow: bug fixes, wiring, data binding.
 * Do NOT change positioning, wrappers, or classNames without explicit approval.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useUIStore } from "../ui/state/useUIStore";
import { profileData } from "../ui/data/profileData";

const ProfileScreen = () => {
  const setScene = useUIStore((state) => state.setScene);
  const {
    heroLevel,
    heroLevelProgress,
    winCount,
    friendsCount,
    username,
    title,
    achievements,
  } = profileData;
  const [baseAchievement, top1Achievement, top2Achievement, bottom1Achievement] = achievements;
  const achievementProgressDelays = ["0s", "0.6s", "1.1s", "1.6s"];
  const [refreshNonce, setRefreshNonce] = useState(0);
  const heroProgressRef = useRef<HTMLDivElement | null>(null);
  const rankRef = useRef<HTMLImageElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const safeFrame = document.querySelector(".ui-safe-frame");
    safeFrame?.classList.add("ui-safe-frame--profile");
    return () => {
      safeFrame?.classList.remove("ui-safe-frame--profile");
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
      const fadeMs = 1400;
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

    const startAudio = () => {
      ambience.play().catch(() => undefined);
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
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rafId = window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("ui-animations-ready"));
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rank = rankRef.current;
    if (!rank) return;
    const root = document.querySelector(".profile-screen__content") as HTMLElement | null;
    if (!root) return;
    const canvas = document.createElement("canvas");
    canvas.className = "profile-screen__rank-rays";
    root.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => canvas.remove();

    let rafId = 0;

    const resize = () => {
      const rankRect = rank.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const pad = 80;
      const width = rankRect.width + pad * 2;
      const height = rankRect.height + pad * 2;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.left = `${rankRect.left - rootRect.left - pad}px`;
      canvas.style.top = `${rankRect.top - rootRect.top - pad}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.45);
      core.addColorStop(0, "rgba(255, 210, 140, 0.35)");
      core.addColorStop(0.4, "rgba(255, 190, 120, 0.18)");
      core.addColorStop(1, "rgba(255, 190, 120, 0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(cx, cy);
      const rays = 12;
      const angleStep = (Math.PI * 2) / rays;
      const baseAngle = time * 0.25;
      for (let i = 0; i < rays; i += 1) {
        const angle = baseAngle + i * angleStep;
        ctx.save();
        ctx.rotate(angle);
        const gradient = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        gradient.addColorStop(0, "rgba(255, 220, 160, 0.28)");
        gradient.addColorStop(1, "rgba(255, 200, 120, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-16, h * 0.45);
        ctx.lineTo(16, h * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      // Ensure hover state is reflected immediately on mount; do not rely solely on mouseenter
      const hovered = rank.matches(":hover, :focus-visible");
      if (hovered) {
        if (!canvas.classList.contains("profile-screen__rank-rays--active")) {
          canvas.classList.add("profile-screen__rank-rays--active");
        }
      } else {
        if (canvas.classList.contains("profile-screen__rank-rays--active")) {
          canvas.classList.remove("profile-screen__rank-rays--active");
        }
      }
      draw(now / 1000);
      rafId = window.requestAnimationFrame(frame);
    };

    const onEnter = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      canvas.classList.add("profile-screen__rank-rays--active");
    };

    const onLeave = () => {
      canvas.classList.remove("profile-screen__rank-rays--active");
    };

    resize();
    // Recompute once the rank art has its real size.
    const onLoad = () => resize();
    if (!rank.complete) {
      rank.addEventListener("load", onLoad, { once: true });
    }
    // Also observe size changes in case layout/fonts shift later.
    const ro = new ResizeObserver(() => resize());
    ro.observe(rank);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      draw(window.performance.now() / 1000);
    }
    rank.addEventListener("mouseenter", onEnter);
    rank.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      rank.removeEventListener("load", onLoad);
      rank.removeEventListener("mouseenter", onEnter);
      rank.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      window.cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(".profile-screen") as HTMLElement | null;
    if (!root) return;

    const flameCanvas = document.createElement("canvas");
    flameCanvas.className = "profile-screen__lantern-flames";
    root.appendChild(flameCanvas);
    const ctx = flameCanvas.getContext("2d");
    if (!ctx) return () => flameCanvas.remove();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = window.devicePixelRatio || 1;
    let rafId = 0;

    const flames = [
      { anchorX: 185, anchorY: 762, scale: 1.0, seed: 1.3 },
      { anchorX: 1731, anchorY: 763, scale: 1.0, seed: 3.7 },
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
      const baseW = size * 0.44;
      const baseH = size * 0.55;
      const flicker = 0.9 + 0.08 * Math.sin(time * 3.2 + seed * 2.1);
      const wobble = 0.08 * Math.sin(time * 6.1 + seed * 1.7);
      const sway = 0.12 * Math.sin(time * 1.8 + seed * 3.4);
      const width = baseW * (0.9 + 0.15 * Math.sin(time * 4.1 + seed));
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
        const size = baseSize * flame.scale;
        const height = size * 1.25;
        const baseX =
          typeof flame.anchorX === "number"
            ? flame.anchorX
            : flame.x * window.innerWidth + (flame.offsetX ?? 0);
        const baseY =
          typeof flame.anchorY === "number"
            ? flame.anchorY
            : flame.y * window.innerHeight + (flame.offsetY ?? 0);
        drawFlame(
          baseX,
          baseY - height * 0.35,
          size,
          time,
          flame.seed
        );
      });
    };

    const frame = (now: number) => {
      draw(now / 1000);
      rafId = window.requestAnimationFrame(frame);
    };

    resize();
    if (!prefersReducedMotion) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      draw(window.performance.now() / 1000);
    }
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
      flameCanvas.remove();
    };
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".profile-screen") as HTMLElement | null;
    if (!root) return;

    const boxes = ["profile-screen__pip-box", "profile-screen__pip-box profile-screen__pip-box--right"].map(
      (className) => {
        const box = document.createElement("div");
        box.className = className;
        root.appendChild(box);
        return box;
      }
    );

    const spawnPip = () => {
      const pip = document.createElement("span");
      pip.className = "profile-screen__pip";
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
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".profile-screen") as HTMLElement | null;
    if (!root) return;
    const boxes = [
      "profile-screen__smoke-box",
      "profile-screen__smoke-box profile-screen__smoke-box--right",
    ].map((className) => {
      const box = document.createElement("div");
      box.className = className;
      root.appendChild(box);
      return box;
    });

    const spawnSmoke = () => {
      const puff = document.createElement("span");
      puff.className = "profile-screen__smoke";
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
  }, [refreshNonce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(".profile-screen") as HTMLElement | null;
    if (!root) return;
    const readout = document.createElement("div");
    readout.className = "profile-screen__cursor-readout";
    root.appendChild(readout);
    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "profile-screen__refresh-button";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bar = heroProgressRef.current;
    if (!bar) return;

    const spawnPip = () => {
      const pip = document.createElement("span");
      pip.className = "profile-screen__hero-level-pip";
      const x = 5 + Math.random() * 90;
      const y = 20 + Math.random() * 60;
      const size = 3 + Math.random() * 4;
      const driftX = (Math.random() * 40 - 20).toFixed(2);
      const driftY = (Math.random() * 30 - 15).toFixed(2);
      const duration = (2200 + Math.random() * 1800).toFixed(0);
      pip.style.left = `${x}%`;
      pip.style.top = `${y}%`;
      pip.style.width = `${size}px`;
      pip.style.height = `${size}px`;
      pip.style.setProperty("--dx", `${driftX}px`);
      pip.style.setProperty("--dy", `${driftY}px`);
      pip.style.setProperty("--dur", `${duration}ms`);
      bar.appendChild(pip);
      pip.addEventListener("animationend", () => {
        pip.remove();
      });
    };

    const intervalId = window.setInterval(() => {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        spawnPip();
      }
    }, 380);

    return () => window.clearInterval(intervalId);
  }, [refreshNonce]);

  return (
    <div className="profile-screen">
      <div className="profile-screen__bg" aria-hidden="true" />
      <img className="profile-screen__portrait" src="/assets/heroes/tharos.png" alt="" />
      <div className="profile-screen__content">
        <div className="profile-screen__title">ACHIEVMENTS</div>
        <div className="profile-screen__hero-level-frame" aria-hidden="true">
          <div className="profile-screen__hero-level-frame-rotor">
            <img
              className="profile-screen__hero-level-frame-img"
              src="/assets/ui/profile/hero-level_frame.png"
              alt=""
            />
          </div>
          <div className="profile-screen__hero-level-value">{heroLevel}</div>
        </div>
        <div
          className="profile-screen__hero-level-progress"
          style={{ "--hero-progress": `${Math.round(heroLevelProgress * 100)}%` } as CSSProperties}
          aria-hidden="true"
        >
          <div className="profile-screen__hero-level-progress-fill" ref={heroProgressRef}>
            <img
              className="profile-screen__hero-level-progress-img"
              src="/assets/ui/profile/hero-level-progress_fill_blue.png"
              alt=""
            />
          </div>
        </div>
        <div className="profile-screen__title profile-screen__title--hero-level">HERO LEVEL</div>
        <div className="profile-screen__title profile-screen__title--win-count">WIN COUNT:</div>
        <div className="profile-screen__win-count-value">{winCount}</div>
        <div className="profile-screen__title profile-screen__title--season-rank">
          HIGHEST
          <br />
          SEASON RANK:
        </div>
        <div className="profile-screen__title profile-screen__title--friends">FRIENDS:</div>
        <div className="profile-screen__friends-value">{friendsCount}</div>
        <div className="profile-screen__label profile-screen__label--showcase">SHOWCASE</div>
        <div className="profile-screen__placeholder profile-screen__placeholder--showcase">--empty--</div>
        <img
          className="profile-screen__achievement-icon"
          src="/assets/ui/profile/profile-achievment-icon_fallback.png"
          alt=""
        />
        <img
          className="profile-screen__achievement-icon profile-screen__achievement-icon--top-1"
          src="/assets/ui/profile/profile-achievment-icon_fallback.png"
          alt=""
        />
        <img
          className="profile-screen__achievement-icon profile-screen__achievement-icon--top-2"
          src="/assets/ui/profile/profile-achievment-icon_fallback.png"
          alt=""
        />
        <img
          className="profile-screen__achievement-icon profile-screen__achievement-icon--bottom-1"
          src="/assets/ui/profile/profile-achievment-icon_fallback.png"
          alt=""
        />
        <div className="profile-screen__achievement-text profile-screen__achievement-text--top-2">
          {top2Achievement?.title}
        </div>
        <div className="profile-screen__achievement-text profile-screen__achievement-text--top-1">
          {top1Achievement?.title}
        </div>
        <div className="profile-screen__achievement-text profile-screen__achievement-text--base">
          {baseAchievement?.title}
        </div>
        <div className="profile-screen__achievement-text profile-screen__achievement-text--bottom-1">
          {bottom1Achievement?.title}
        </div>
        <div className="profile-screen__achievement-progress" aria-hidden="true">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`achievement-progress achievement-progress--${achievement.theme}`}
              style={
                {
                  "--progress": `${achievement.progress}%`,
                  "--delay": achievementProgressDelays[index] ?? "0s",
                  "--value": `"${achievement.progress}%"`,
                } as CSSProperties
              }
            >
              <span className="achievement-progress__fill" />
              <span className="achievement-progress__pip" />
            </div>
          ))}
        </div>
        <img
          ref={rankRef}
          className="profile-screen__rank"
          src="/assets/ui/profile/player-rank_gold.png"
          alt=""
        />
        <button
          type="button"
          className="profile-screen__label profile-screen__label--achievements"
          onClick={() => {
            setScene("ACHIEVEMENTS");
          }}
          aria-label="View achievements"
        >
          VIEW ACHIEVMENTS
        </button>
        <svg className="profile-screen__username" viewBox="0 0 320 120" aria-hidden="true">
          <defs>
            <path id="profile-username-arc" d="M 20 90 Q 160 65 300 90" />
          </defs>
          <text className="profile-screen__username-text">
            <textPath href="#profile-username-arc" startOffset="50%" textAnchor="middle">
              {username}
            </textPath>
          </text>
        </svg>
        <div className="profile-screen__subtitle">{title}</div>
        <button
          type="button"
          className="profile-screen__label profile-screen__label--customize"
          onClick={() => {
            setScene("CUSTOMIZE");
          }}
          aria-label="Customize profile"
        >
          CUSTOMIZE
        </button>
        <button
          type="button"
          className="profile-screen__label profile-screen__label--skills"
          onClick={() => {
            setScene("HERO_PROFILE");
          }}
          aria-label="View hero profile"
        >
          HERO PROFILE
        </button>
        <button
          type="button"
          className="profile-screen__label profile-screen__label--masques"
          onClick={() => {
            setScene("MASQUES");
          }}
          aria-label="View masques"
        >
          MASQUES
        </button>
        <img
          className="profile-screen__skill-art profile-screen__skill-art--left"
          src="/assets/ui/profile/profile-tharos-skill_1.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="profile-screen__skill-art profile-screen__skill-art--right"
          src="/assets/ui/profile/profile-tharos-skill_2.png"
          alt=""
          aria-hidden="true"
        />
        <div className="profile-screen__nav">
          <button
            type="button"
            className="main-menu-nav-button"
            onClick={() => setScene("MAIN_MENU")}
            aria-label="Back to main menu"
          >
            <span className="main-menu-nav-button__art" aria-hidden="true">
              <img
                className="main-menu-nav-button__img main-menu-nav-button__img--inactive"
                src="/assets/ui/profile/profile-main-btn_inactive.png"
                alt=""
              />
              <img
                className="main-menu-nav-button__img main-menu-nav-button__img--active"
                src="/assets/ui/profile/profile-main-btn_active.png"
                alt=""
              />
            </span>
            <span className="main-menu-nav-button__label">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;


