import { useState } from "react";
import { useOptionsStore, type LanguageOption } from "../state/useOptionsStore";
import { useUIStore } from "../state/useUIStore";

const tabs = ["General", "Graphics", "Audio", "Astra"] as const;
type OptionsTab = (typeof tabs)[number];

const OptionsScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const [activeTab, setActiveTab] = useState<OptionsTab>("General");
  const {
    language,
    screenShake,
    masterVolume,
    musicVolume,
    highQualityEffects,
    showAstraAssistant,
    setLanguage,
    setScreenShake,
    setMasterVolume,
    setMusicVolume,
    setHighQualityEffects,
    setShowAstraAssistant,
  } = useOptionsStore();

  return (
    <div className="options-scene">
      <div className="options-title-bar ui-panel">
        <h1>Options</h1>
      </div>

      <div className="options-tabs" role="tablist" aria-label="Options tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`options-tab${activeTab === tab ? " options-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="options-panel ui-panel">
        <div className="options-panel__content">
          {activeTab === "General" && (
            <>
              <div className="options-row">
                <label className="options-label" htmlFor="options-master-volume">
                  Master Volume
                </label>
                <div className="options-control options-slider">
                  <input
                    id="options-master-volume"
                    type="range"
                    min={0}
                    max={100}
                    value={masterVolume}
                    onChange={(event) => setMasterVolume(Number(event.target.value))}
                  />
                </div>
                <div className="options-value">{masterVolume}</div>
              </div>

              <div className="options-row">
                <label className="options-label" htmlFor="options-music-volume">
                  Music Volume
                </label>
                <div className="options-control options-slider">
                  <input
                    id="options-music-volume"
                    type="range"
                    min={0}
                    max={100}
                    value={musicVolume}
                    onChange={(event) => setMusicVolume(Number(event.target.value))}
                  />
                </div>
                <div className="options-value">{musicVolume}</div>
              </div>

              <div className="options-row">
                <label className="options-label" htmlFor="options-screen-shake">
                  Screen Shake
                </label>
                <div className="options-control">
                  <label className="options-toggle" htmlFor="options-screen-shake">
                    <input
                      id="options-screen-shake"
                      type="checkbox"
                      checked={screenShake}
                      onChange={(event) => setScreenShake(event.target.checked)}
                    />
                    <span className="options-toggle__indicator" aria-hidden="true" />
                    <span className="options-toggle__text">{screenShake ? "On" : "Off"}</span>
                  </label>
                </div>
                <div className="options-value" aria-hidden="true" />
              </div>

              <div className="options-row">
                <label className="options-label" htmlFor="options-language">
                  Language
                </label>
                <div className="options-control">
                  <select
                    id="options-language"
                    className="options-select"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as LanguageOption)}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
                <div className="options-value" aria-hidden="true" />
              </div>
            </>
          )}

          {activeTab === "Graphics" && (
            <div className="options-row">
              <label className="options-label" htmlFor="options-high-quality">
                High Quality Effects
              </label>
              <div className="options-control">
                <label className="options-toggle" htmlFor="options-high-quality">
                  <input
                    id="options-high-quality"
                    type="checkbox"
                    checked={highQualityEffects}
                    onChange={(event) => setHighQualityEffects(event.target.checked)}
                  />
                  <span className="options-toggle__indicator" aria-hidden="true" />
                  <span className="options-toggle__text">{highQualityEffects ? "On" : "Off"}</span>
                </label>
              </div>
              <div className="options-value" aria-hidden="true" />
            </div>
          )}

          {activeTab === "Audio" && (
            <>
              <div className="options-row">
                <span className="options-label">SFX Volume</span>
                <div className="options-control">
                  <span className="options-placeholder">TODO</span>
                </div>
                <div className="options-value" aria-hidden="true" />
              </div>

              <div className="options-row">
                <span className="options-label">Voice Volume</span>
                <div className="options-control">
                  <span className="options-placeholder">TODO</span>
                </div>
                <div className="options-value" aria-hidden="true" />
              </div>

              <div className="options-row">
                <span className="options-label">Ambient Volume</span>
                <div className="options-control">
                  <span className="options-placeholder">TODO</span>
                </div>
                <div className="options-value" aria-hidden="true" />
              </div>
            </>
          )}

          {activeTab === "Astra" && (
            <div className="options-row">
              <label className="options-label" htmlFor="options-astra-assistant">
                Show Astra Assistant
              </label>
              <div className="options-control">
                <label className="options-toggle" htmlFor="options-astra-assistant">
                  <input
                    id="options-astra-assistant"
                    type="checkbox"
                    checked={showAstraAssistant}
                    onChange={(event) => setShowAstraAssistant(event.target.checked)}
                  />
                  <span className="options-toggle__indicator" aria-hidden="true" />
                  <span className="options-toggle__text">{showAstraAssistant ? "On" : "Off"}</span>
                </label>
              </div>
              <div className="options-value" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="options-panel__actions">
          <button type="button" className="ui-button ui-button--primary" onClick={() => setScene("MAIN_MENU")}>
            Back
          </button>
        </div>
      </div>

      <div className="options-secondary-actions">
        <button type="button" className="ui-button ui-button--secondary" disabled>
          Social and Privacy Settings
        </button>
        <button type="button" className="ui-button ui-button--secondary" disabled>
          Account Settings
        </button>
      </div>
    </div>
  );
};

export default OptionsScene;
