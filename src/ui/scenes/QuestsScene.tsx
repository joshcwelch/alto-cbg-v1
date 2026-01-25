import { useEffect, useRef, useState } from "react";
import { useUIStore } from "../state/useUIStore";
import QuestStoreCrestButton from "../components/QuestStoreCrestButton";

const QuestsScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "0" });
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const ambientRef = useRef<HTMLDivElement | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const remainingMs = Math.max(0, endOfDay.getTime() - now.getTime());
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const padHours = (value: number) => value.toString().padStart(2, "0");
      setTimeLeft({ hours: padHours(hours), minutes: String(minutes) });

      const day = now.getDay();
      let daysUntil = (8 - day) % 7;
      if (daysUntil === 0) daysUntil = 7;
      const nextMonday = new Date(now);
      nextMonday.setHours(0, 0, 0, 0);
      nextMonday.setDate(nextMonday.getDate() + daysUntil);
      const weeklyRemainingMs = Math.max(0, nextMonday.getTime() - now.getTime());
      const totalSecondsWeekly = Math.floor(weeklyRemainingMs / 1000);
      const days = Math.floor(totalSecondsWeekly / (60 * 60 * 24));
      const hoursLeft = Math.floor((totalSecondsWeekly % (60 * 60 * 24)) / (60 * 60));
      const minutesLeft = Math.floor((totalSecondsWeekly % (60 * 60)) / 60);
      const secondsLeft = totalSecondsWeekly % 60;
      const pad2 = (value: number) => value.toString().padStart(2, "0");
      setWeeklyTimeLeft({
        days: pad2(days),
        hours: pad2(hoursLeft),
        minutes: pad2(minutesLeft),
        seconds: pad2(secondsLeft),
      });
    };

    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const puffs: Array<{
      x: number;
      y: number;
      r: number;
      alpha: number;
      dx: number;
      dy: number;
      phase: number;
      speed: number;
    }> = [];

    const getSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      return { width, height };
    };

    const resize = () => {
      const { width, height } = getSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnPuff = (width: number, height: number) => {
      let x = 0;
      let y = 0;
      const edgePadX = width * 0.18;
      const overshootX = width * 0.06;
      if (Math.random() < 0.5) {
        x = -overshootX + Math.random() * edgePadX;
      } else {
        x = width - Math.random() * edgePadX + overshootX;
      }
      y = -height * 0.05 + Math.random() * height * 1.1;
      return {
        x,
        y,
        r: 110 + Math.random() * 200,
        alpha: 0.06 + Math.random() * 0.06,
        dx: (Math.random() * 10 - 5) * 0.09,
        dy: -(Math.random() * 10 + 6) * 0.07,
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.2,
      };
    };

    const resetPuffs = () => {
      puffs.length = 0;
      const { width, height } = getSize();
      for (let i = 0; i < 22; i += 1) {
        puffs.push(spawnPuff(width, height));
      }
    };

    const smoothstep = (edge0: number, edge1: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    const draw = (time: number, delta: number) => {
      const { width, height } = getSize();
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const innerRadius = Math.min(width, height) * 0.3;
      const falloff = Math.min(width, height) * 0.22;

      puffs.forEach((puff) => {
        puff.life = (puff.life ?? 0) + delta;
        if (!prefersReduced) {
          puff.x += puff.dx * delta * 60;
          puff.y += puff.dy * delta * 60;
        }
        const dist = Math.hypot(puff.x - cx, puff.y - cy);
        const edgeFactor = smoothstep(innerRadius, innerRadius + falloff, dist);
        const pulse = 0.85 + Math.sin(time * puff.speed + puff.phase) * 0.15;
        const fadeIn = Math.min(1, (puff.life ?? 0) / 1.2);
        const alpha = puff.alpha * edgeFactor * pulse * fadeIn;
        const gradient = ctx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.r);
        gradient.addColorStop(0, `rgba(210, 220, 230, ${alpha})`);
        gradient.addColorStop(1, "rgba(210, 220, 230, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
        ctx.fill();

        if (puff.x < -puff.r || puff.x > width + puff.r || puff.y < -puff.r || puff.y > height + puff.r) {
          Object.assign(puff, spawnPuff(width, height));
          puff.life = 0;
        }
      });
    };

    resize();
    resetPuffs();

    let rafId = 0;
    let last = window.performance.now();

    const frame = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      draw(now / 1000, delta);
      rafId = window.requestAnimationFrame(frame);
    };

    if (!prefersReduced) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      draw(window.performance.now() / 1000, 0);
    }

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        resize();
        resetPuffs();
      });
      if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", resize);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = ambientRef.current;
    if (!layer) return;

    const spawnParticle = () => {
      const particle = document.createElement("span");
      particle.className = "quests-ambient__particle";
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = 3 + Math.random() * 6;
      const driftX = (Math.random() * 40 - 20).toFixed(2);
      const driftY = (-12 - Math.random() * 28).toFixed(2);
      const duration = (1800 + Math.random() * 2000).toFixed(0);
      const delay = (Math.random() * 400).toFixed(0);
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty("--dx", `${driftX}px`);
      particle.style.setProperty("--dy", `${driftY}px`);
      particle.style.setProperty("--dur", `${duration}ms`);
      particle.style.setProperty("--delay", `${delay}ms`);
      layer.appendChild(particle);
      particle.addEventListener("animationend", () => {
        particle.remove();
      });
    };

    const spawnEmber = () => {
      const ember = document.createElement("span");
      ember.className = "quests-ambient__particle quests-ambient__particle--ember";
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = 3 + Math.random() * 5;
      const driftX = (Math.random() * 32 - 16).toFixed(2);
      const driftY = (-10 - Math.random() * 24).toFixed(2);
      const duration = (1500 + Math.random() * 1800).toFixed(0);
      const delay = (Math.random() * 400).toFixed(0);
      ember.style.left = `${x}%`;
      ember.style.top = `${y}%`;
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.setProperty("--dx", `${driftX}px`);
      ember.style.setProperty("--dy", `${driftY}px`);
      ember.style.setProperty("--dur", `${duration}ms`);
      ember.style.setProperty("--delay", `${delay}ms`);
      layer.appendChild(ember);
      ember.addEventListener("animationend", () => {
        ember.remove();
      });
    };

    const intervalId = window.setInterval(() => {
      const count = 10 + Math.floor(Math.random() * 7);
      for (let i = 0; i < count; i += 1) {
        spawnParticle();
      }
      if (Math.random() > 0.4) {
        const emberCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < emberCount; i += 1) {
          spawnEmber();
        }
      }
    }, 150);

    return () => window.clearInterval(intervalId);
  }, [ambientRef]);

  const quest1Progress = { current: 1, total: 3 };
  const quest2Progress = { current: 0, total: 3 };
  const quest3Progress = { current: 100, total: 100 };

  const getProgressPercent = (current: number, total: number) =>
    total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="quests-scene">
      <div className="quests-scene__bg" aria-hidden="true" />
      <div className="quests-scene__content">
        <canvas className="quests-scene__fog" ref={fogCanvasRef} aria-hidden="true" />
        <div className="quests-scene__ambient" ref={ambientRef} aria-hidden="true" />
        <div className="quests-scene__timer quests-scene__timer--1">
          <span className="quests-scene__timer-value">
            <span className="quests-scene__timer-num">{timeLeft.hours}</span>
            <span className="quests-scene__timer-unit">h</span>{" "}
            <span className="quests-scene__timer-num">{timeLeft.minutes}</span>
            <span className="quests-scene__timer-unit">m</span>
          </span>
        </div>
        <div className="quests-scene__timer quests-scene__timer--2">
          <span className="quests-scene__timer-value">
            <span className="quests-scene__timer-num">{timeLeft.hours}</span>
            <span className="quests-scene__timer-unit">h</span>{" "}
            <span className="quests-scene__timer-num">{timeLeft.minutes}</span>
            <span className="quests-scene__timer-unit">m</span>
          </span>
        </div>
        <div className="quests-scene__timer quests-scene__timer--3">
          <span className="quests-scene__timer-value">
            <span className="quests-scene__timer-num">{timeLeft.hours}</span>
            <span className="quests-scene__timer-unit">h</span>{" "}
            <span className="quests-scene__timer-num">{timeLeft.minutes}</span>
            <span className="quests-scene__timer-unit">m</span>
          </span>
        </div>
        <div className="quests-scene__weekly-timer">
          <span className="quests-scene__weekly-timer-label">Time Left</span>
          <span className="quests-scene__weekly-timer-value">
            <span className="quests-scene__weekly-timer-num">{weeklyTimeLeft.days}</span>
            <span className="quests-scene__weekly-timer-sep">:</span>
            <span className="quests-scene__weekly-timer-num">{weeklyTimeLeft.hours}</span>
            <span className="quests-scene__weekly-timer-sep">:</span>
            <span className="quests-scene__weekly-timer-num">{weeklyTimeLeft.minutes}</span>
            <span className="quests-scene__weekly-timer-sep">:</span>
            <span className="quests-scene__weekly-timer-num">{weeklyTimeLeft.seconds}</span>
          </span>
        </div>
        <div className="quests-scene__weekly-label">WEEKLY CHALLENGE</div>
        <div className="quests-scene__weekly-title">Win 7 Matches</div>
        <div className="quests-scene__weekly-progress">PROGRESS: 0/7 MATCHES WON</div>
        <div className="quests-scene__weekly-reward">
          <div className="quests-scene__weekly-reward-value">500</div>
        </div>
        <div className="quests-scene__weekly-reward quests-scene__weekly-reward--minor">
          <div className="quests-scene__weekly-reward-value quests-scene__weekly-reward-value--minor">10</div>
        </div>
        <div className="quests-scene__daily-reward-1">
          <img className="quests-scene__daily-reward-icon" src="/assets/ui/quests/quest-gold_icon.png" alt="" />
          <span className="quests-scene__daily-reward-value">100</span>
        </div>
        <div className="quests-scene__daily-reward-2">
          <img className="quests-scene__daily-reward-icon" src="/assets/ui/quests/quest-gold_icon.png" alt="" />
          <span className="quests-scene__daily-reward-value">250</span>
        </div>
        <div className="quests-scene__daily-reward-3">
          <img className="quests-scene__daily-reward-icon" src="/assets/ui/quests/quest-gold_icon.png" alt="" />
          <span className="quests-scene__daily-reward-value">75</span>
        </div>
        <div className="quests-scene__daily-quest-1">Play 3 Matches</div>
        <img
          className="quests-scene__daily-icon-play"
          src="/assets/ui/quests/quest-daily-icon_play.png"
          alt=""
        />
        <div className="quests-scene__daily-quest-2">Play 3 Games as Lyra</div>
        <div className="quests-scene__daily-icon-lyra">
          <img src="/assets/ui/quests/quest-daily-icon__lyra.png" alt="" />
        </div>
        <div className="quests-scene__daily-quest-3">Deal 100 Damage</div>
        <div className="quests-scene__daily-icon-damage">
          <img src="/assets/ui/quests/quest-daily-icon_onehundmg.png" alt="" />
        </div>
        <div className="quests-scene__daily-progress quests-scene__daily-progress--1">
          <div className="quests-scene__daily-progress-body">
            <div className="quests-scene__progress-track">
              <div
                className="quests-scene__progress-fill"
                style={{ width: `${getProgressPercent(quest1Progress.current, quest1Progress.total)}%` }}
              />
            </div>
            <div className="quests-scene__progress-text">
              {quest1Progress.current}/{quest1Progress.total}
            </div>
            <button type="button" className="quests-scene__progress-abandon">
              <span className="quests-scene__progress-x" aria-hidden="true">
                &#10005;
              </span>
              Abandon
            </button>
          </div>
        </div>
        <div className="quests-scene__daily-progress quests-scene__daily-progress--2">
          <div className="quests-scene__daily-progress-body">
            <div className="quests-scene__progress-track">
              <div
                className="quests-scene__progress-fill"
                style={{ width: `${getProgressPercent(quest2Progress.current, quest2Progress.total)}%` }}
              />
            </div>
            <div className="quests-scene__progress-text">
              {quest2Progress.current}/{quest2Progress.total}
            </div>
            <button type="button" className="quests-scene__progress-abandon">
              <span className="quests-scene__progress-x" aria-hidden="true">
                &#10005;
              </span>
              Abandon
            </button>
          </div>
        </div>
        <div className="quests-scene__daily-progress quests-scene__daily-progress--3">
          <div className="quests-scene__daily-progress-body">
            <div className="quests-scene__progress-track">
              <div
                className="quests-scene__progress-fill"
                style={{ width: `${getProgressPercent(quest3Progress.current, quest3Progress.total)}%` }}
              />
            </div>
            <div className="quests-scene__progress-text">
              {quest3Progress.current}/{quest3Progress.total}
            </div>
            <div className="quests-scene__progress-complete" aria-label="Quest complete">
              <span className="quests-scene__progress-check" aria-hidden="true">
                ✓
              </span>
              Complete
            </div>
          </div>
        </div>
        <div className="quests-scene__nav">
          <QuestStoreCrestButton className="quests-scene__store-button" onClick={() => setScene("STORE")} />
          <button type="button" className="main-menu-nav-button" onClick={() => setScene("MAIN_MENU")}>
            <span className="main-menu-nav-button__art" aria-hidden="true">
              <img
                className="main-menu-nav-button__img main-menu-nav-button__img--inactive"
                src="/assets/ui/quests/quest-main-btn_inactive.png"
                alt=""
              />
              <img
                className="main-menu-nav-button__img main-menu-nav-button__img--active"
                src="/assets/ui/quests/quest-main-btn_active.png"
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

export default QuestsScene;


