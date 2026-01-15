import { useCallback, useEffect, useState } from "react";

type LoadingScreenProps = {
  onContinue: () => void;
};

const LoadingScreen = ({ onContinue }: LoadingScreenProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleContinue = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);
    onContinue();
  }, [hasInteracted, onContinue]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      handleContinue();
    };
    const handlePointer = () => handleContinue();
    window.addEventListener("keydown", handleKey);
    window.addEventListener("pointerdown", handlePointer);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("pointerdown", handlePointer);
    };
  }, [handleContinue]);

  return (
    <div className="screen screen--loading">
      <div className="loading-screen">
        <img className="loading-screen__background" src="/ui/loading/loading-background.png" alt="" />
        <div className="loading-screen__content">
          <img className="loading-screen__spinner" src="/ui/loading/loading-spinner_primary.png" alt="" />
          <div className="loading-screen__bar">
            <img src="/ui/loading/loading-bar_frame.png" alt="" />
            <img className="loading-screen__bar-fill" src="/ui/loading/loading-bar_fill.png" alt="" />
            <img className="loading-screen__bar-glow" src="/ui/loading/loading-bar_glow.png" alt="" />
          </div>
          <button className="loading-screen__prompt" onClick={handleContinue}>
            <img src="/ui/loading/press-any-key_prompt.png" alt="Press any key" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
