import { useUIStore } from "../state/useUIStore";

const QuestsScene = () => {
  const setScene = useUIStore((state) => state.setScene);

  const dailyQuests = [
    {
      id: "daily-win",
      timer: "10h 52m",
      title: "Win 3 Games",
      reward: "100",
      progress: { current: 0, total: 3 },
    },
    {
      id: "daily-hero",
      timer: "10h 52m",
      title: "Play 3 Matches as Lyra",
      reward: "250",
      progress: { current: 0, total: 3 },
    },
    {
      id: "daily-damage",
      timer: "4d 10h",
      title: "Deal 100 Damage",
      reward: "75",
      progress: { current: 0, total: 100 },
    },
  ];

  const weeklyQuest = {
    label: "Weekly Quest",
    title: "Win 7 Matches",
    subtitle: "Complete the run to claim all rewards.",
    rewards: {
      gold: "250",
      shards: "1",
    },
  };

  return (
    <div className="quests-scene">
      <header className="quests-header">
        <div className="quests-header__icon" aria-hidden="true" />
        <div className="quests-header__title">
          <p className="quests-header__eyebrow">Daily Rituals</p>
          <h1>Quests</h1>
        </div>
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("MAIN_MENU")}>
          Back
        </button>
      </header>

      <section className="quests-daily">
        {dailyQuests.map((quest) => {
          const progressValue = Math.min(quest.progress.current, quest.progress.total);
          const progressPercent =
            quest.progress.total === 0 ? 0 : Math.round((progressValue / quest.progress.total) * 100);

          return (
            <div key={quest.id} className="quests-card">
              <div className="quests-card__timer">{quest.timer}</div>
              <div className="quests-card__title">{quest.title}</div>
              <div className="quests-card__art" aria-hidden="true" />
              <div className="quests-card__reward">
                <span className="quests-card__reward-icon" aria-hidden="true" />
                <span className="quests-card__reward-value">{quest.reward}</span>
              </div>
              <div
                className="quests-card__progress"
                role="progressbar"
                aria-valuenow={progressValue}
                aria-valuemin={0}
                aria-valuemax={quest.progress.total}
                aria-label={`${quest.title} progress`}
              >
                <div className="quests-card__progress-track">
                  <div className="quests-card__progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="quests-card__progress-text">
                  {quest.progress.current}/{quest.progress.total}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="quests-weekly">
        <div className="quests-weekly__chest" aria-hidden="true" />
        <div className="quests-weekly__details">
          <div className="quests-weekly__label">{weeklyQuest.label}</div>
          <div className="quests-weekly__title">{weeklyQuest.title}</div>
          <div className="quests-weekly__subtitle">{weeklyQuest.subtitle}</div>
        </div>
        <div className="quests-weekly__rewards">
          <div className="quests-weekly__reward">
            <span className="quests-weekly__reward-icon quests-weekly__reward-icon--gold" aria-hidden="true" />
            <span className="quests-weekly__reward-value">{weeklyQuest.rewards.gold}</span>
          </div>
          <div className="quests-weekly__reward">
            <span className="quests-weekly__reward-icon quests-weekly__reward-icon--shard" aria-hidden="true" />
            <span className="quests-weekly__reward-value">{weeklyQuest.rewards.shards}</span>
          </div>
          <div className="quests-weekly__pack" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
};

export default QuestsScene;
