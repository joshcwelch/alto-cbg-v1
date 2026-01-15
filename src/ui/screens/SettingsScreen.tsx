import { useEffect, useState } from "react";
import Button from "../components/common/Button";

const AUDIO_ENABLED_KEY = "alto:settings:audioEnabled";
const MASTER_VOLUME_KEY = "alto:settings:masterVolume";

const readBool = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "true";
};

const readNumber = (key: string, fallback: number) => {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const SettingsScreen = () => {
  const [audioEnabled, setAudioEnabled] = useState(() => readBool(AUDIO_ENABLED_KEY, true));
  const [masterVolume, setMasterVolume] = useState(() => readNumber(MASTER_VOLUME_KEY, 0.8));

  useEffect(() => {
    window.localStorage.setItem(AUDIO_ENABLED_KEY, String(audioEnabled));
  }, [audioEnabled]);

  useEffect(() => {
    window.localStorage.setItem(MASTER_VOLUME_KEY, String(masterVolume));
  }, [masterVolume]);

  return (
    <div className="screen screen--settings">
      <div className="hub-screen">
        <header className="settings-header">
          <img src="/ui/settings/settings-header_frame.png" alt="" />
          <h1>Settings</h1>
        </header>
        <div className="settings-panel">
          <img className="settings-panel__frame" src="/ui/settings/settings-content_panel.png" alt="" />
          <div className="settings-panel__content">
            <div className="settings-row">
              <div>
                <p className="settings-label">Audio</p>
                <p className="settings-subtext">Toggle all in-game audio output.</p>
              </div>
              <Button
                variant="secondary"
                className="settings-audio-toggle"
                onClick={() => setAudioEnabled((prev) => !prev)}
              >
                <img
                  src={audioEnabled ? "/assets/ui/sound-on.png" : "/assets/ui/sound-off.png"}
                  alt=""
                />
                {audioEnabled ? "Enabled" : "Muted"}
              </Button>
            </div>
            <div className="settings-row">
              <div>
                <p className="settings-label">Master Volume</p>
                <p className="settings-subtext">Global output level.</p>
              </div>
              <div className="settings-slider">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={masterVolume}
                  onChange={(event) => setMasterVolume(Number(event.target.value))}
                />
                <span>{Math.round(masterVolume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
