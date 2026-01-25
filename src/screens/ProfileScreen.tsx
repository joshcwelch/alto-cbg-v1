/**
 * PROFILE V1 (FROZEN)
 * Layout/classes are locked. Only allow: bug fixes, wiring, data binding.
 * Do NOT change positioning, wrappers, or classNames without explicit approval.
 */
import { useEffect, type CSSProperties } from "react";
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
          <div className="profile-screen__hero-level-progress-fill">
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
        <img className="profile-screen__rank" src="/assets/ui/profile/player-rank_gold.png" alt="" />
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
