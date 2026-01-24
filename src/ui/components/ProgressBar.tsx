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
  const pipScaleX = thicknessScale * 2 * 1.2;
  const pipScaleY = thicknessScale * 2 * 0.85;
  const pipVisualWidth = pipSize * pipScaleX;
  const pipVisualHeight = pipSize * pipScaleY;
  const pipLeft = Math.min(Math.max(pct * width - pipVisualWidth / 2, 0), width - pipVisualWidth);
  const debugLabel = `${Math.round(pct * 100)}%`;

  return (
    <div
      className={`progress-bar progress-bar--${variant}`}
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
      <div className="progress-bar__clip">
        <div
          className="progress-bar__inner"
          style={{
            transform: `scaleY(${debugScale})`,
          }}
        >
          <div className="progress-bar__fill-wrap" style={{ width: `${pct * 100}%` }}>
            <div className="progress-bar__visual-wrap" style={{ transform: `scaleY(${thicknessScale})` }}>
              <div className="progress-bar__fill" />
              {showHighlight ? <div className="progress-bar__highlight" /> : null}
            </div>
          </div>
        </div>
      </div>
      <div
        className="progress-bar__pip-wrap"
        style={{
          left: `${pipLeft}px`,
          width: `${pipVisualWidth}px`,
          height: `${pipVisualHeight}px`,
        }}
      >
        {debug ? <div className="progress-bar__debug-label">{debugLabel}</div> : null}
        <div className="progress-bar__pip" />
      </div>
    </div>
  );
};

export default ProgressBar;
