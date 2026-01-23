type ProgressBarProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  max: number;
  variant: "blue" | "green" | "orange" | "purple";
  showHighlight?: boolean;
  debug?: boolean;
  debugScale?: number;
  thicknessScale?: number;
};

const FILL_ASSET: Record<ProgressBarProps["variant"], string> = {
  blue: "/assets/ui/profile/progress_fill_blue.png",
  green: "/assets/ui/profile/progress_fill_green.png",
  orange: "/assets/ui/profile/progress_fill_orange.png",
  purple: "/assets/ui/profile/progress_fill_purple.png",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const ProgressBar = ({
  x,
  y,
  width,
  height,
  value,
  max,
  variant,
  showHighlight = true,
  debug = false,
  debugScale = 1,
  thicknessScale = 1,
}: ProgressBarProps) => {
  const pct = clamp01(max > 0 ? value / max : 0);
  const pipSize = Math.max(10, Math.round(height * 1.4));
  const pipLeft = Math.min(Math.max(pct * width - pipSize / 2, 0), width - pipSize);
  const debugLabel = `${Math.round(pct * 100)}%`;

  return (
    <div
      className="progress-bar"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        outline: debug ? "1px solid rgba(255, 0, 0, 0.6)" : undefined,
        background: debug ? "rgba(255, 255, 255, 0.06)" : undefined,
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      {debug ? <div className="progress-bar__debug-label">{debugLabel}</div> : null}
      <div
        className="progress-bar__inner"
        style={{
          transform: `scaleY(${debugScale})`,
        }}
      >
        <div className="progress-bar__fill-wrap" style={{ width: `${pct * 100}%` }}>
          <div className="progress-bar__visual-wrap" style={{ transform: `scaleY(${thicknessScale})` }}>
            <img className="progress-bar__fill" src={FILL_ASSET[variant]} alt="" />
            {showHighlight ? (
              <img
                className="progress-bar__highlight"
                src="/assets/ui/profile/progress_fill_highlight.png"
                alt=""
              />
            ) : null}
          </div>
        </div>
        <img
          className="progress-bar__pip"
          src="/assets/ui/profile/progress_pip.png"
          alt=""
          style={{
            width: `${pipSize}px`,
            height: `${pipSize}px`,
            left: `${pipLeft}px`,
            transform: `translateY(-50%) scale(${thicknessScale * 0.9})`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
