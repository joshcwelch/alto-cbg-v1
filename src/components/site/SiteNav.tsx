type SiteNavProps = {
  onNavigate?: (target: string) => void;
  onPlayClick?: () => void;
};

const NAV_ITEMS = [
  { label: "Play", target: "hero" },
  { label: "Heroes", target: "heroes" },
  { label: "World", target: "world" },
  { label: "Community", target: "community" },
  { label: "Download", target: "download" },
];

export default function SiteNav({ onNavigate, onPlayClick }: SiteNavProps) {
  const handleNavigate = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <nav className="site-nav">
      <div className="alto-container site-nav__inner">
        <button className="site-logo" onClick={() => handleNavigate("hero")} aria-label="Back to top">
          <span className="logo-mark" />
          ALTO
        </button>
        <ul className="site-nav__links">
          {NAV_ITEMS.map(item => (
            <li key={item.label}>
              <button className="site-nav__link" onClick={() => handleNavigate(item.target)}>
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button className="site-nav__link site-nav__cta" onClick={onPlayClick}>
              Play In Browser
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
