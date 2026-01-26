/**
 * PROFILE V1 (FROZEN)
 * Layout/classes are locked. Only allow: bug fixes, wiring, data binding.
 * Do NOT change positioning, wrappers, or classNames without explicit approval.
 */
import { useEffect, useRef, type CSSProperties } from "react";
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
  const heroProgressRef = useRef<HTMLDivElement | null>(null);
  const rankRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const safeFrame = document.querySelector(".ui-safe-frame");
    safeFrame?.classList.add("ui-safe-frame--profile");
    return () => {
      safeFrame?.classList.remove("ui-safe-frame--profile");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rafId = window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("ui-animations-ready"));
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

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
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      draw(window.performance.now() / 1000);
    }
    rank.addEventListener("mouseenter", onEnter);
    rank.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      rank.removeEventListener("mouseenter", onEnter);
      rank.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, []);

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
  }, []);

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

