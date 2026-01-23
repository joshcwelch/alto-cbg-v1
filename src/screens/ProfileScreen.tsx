import { useEffect } from "react";
import { useUIStore } from "../ui/state/useUIStore";
import ProgressBar from "../ui/components/ProgressBar";

const ACHIEVEMENT_BARS = [
  { key: "a1", x: 520, y: 320, w: 240, h: 12, variant: "blue" as const },
  { key: "a2", x: 520, y: 420, w: 240, h: 12, variant: "green" as const },
  { key: "a3", x: 520, y: 520, w: 240, h: 12, variant: "orange" as const },
  { key: "a4", x: 520, y: 625, w: 240, h: 12, variant: "purple" as const },
];

const ProfileScreen = () => {
  const setScene = useUIStore((state) => state.setScene);

  useEffect(() => {
    const safeFrame = document.querySelector(".ui-safe-frame");
    safeFrame?.classList.add("ui-safe-frame--profile");
    return () => {
      safeFrame?.classList.remove("ui-safe-frame--profile");
    };
  }, []);

  return (
    <div className="profile-screen">
      <div className="profile-screen__bg" aria-hidden="true" />
      <img className="profile-screen__portrait" src="/assets/heroes/tharos.png" alt="" />
      <div className="profile-screen__content">
        <div className="profile-screen__title">ACHIEVMENTS</div>
        <div className="profile-screen__title profile-screen__title--hero-level">HERO LEVEL</div>
        <div className="profile-screen__title profile-screen__title--win-count">WIN COUNT:</div>
        <div className="profile-screen__title profile-screen__title--season-rank">
          HIGHEST
          <br />
          SEASON RANK:
        </div>
        <div className="profile-screen__title profile-screen__title--friends">FRIENDS:</div>
        <div className="profile-screen__label profile-screen__label--showcase">SHOWCASE</div>
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
          ACHIEVMENT TITLE
        </div>
        <div className="profile-screen__achievement-text profile-screen__achievement-text--top-1">
          ACHIEVMENT TITLE
        </div>
        <div className="profile-screen__achievement-text profile-screen__achievement-text--base">
          ACHIEVMENT TITLE
        </div>
        <div className="profile-screen__achievement-text profile-screen__achievement-text--bottom-1">
          ACHIEVMENT TITLE
        </div>
        {ACHIEVEMENT_BARS.map((slot, index) => (
          <ProgressBar
            key={slot.key}
            x={slot.x}
            y={slot.y}
            width={slot.w}
            height={slot.h}
            value={[1, 2, 3, 5][index]}
            max={[5, 10, 30, 50][index]}
            variant={slot.variant}
            debug
            debugScale={2}
            thicknessScale={2}
          />
        ))}
        <img className="profile-screen__rank" src="/assets/ui/profile/player-rank_gold.png" alt="" />
        <button
          type="button"
          className="profile-screen__label profile-screen__label--achievements"
          onClick={() => {
            // TODO: Navigate to achievements screen when available.
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
              USERNAME
            </textPath>
          </text>
        </svg>
        <div className="profile-screen__subtitle">TITLE</div>
        <button
          type="button"
          className="profile-screen__label profile-screen__label--customize"
          onClick={() => {
            // TODO: Navigate to customize profile screen when available.
          }}
          aria-label="Customize profile"
        >
          CUSTOMIZE
        </button>
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
