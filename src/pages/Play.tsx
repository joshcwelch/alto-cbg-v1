import SiteNav from "../components/site/SiteNav";
import SiteFooter from "../components/site/SiteFooter";
import "../styles/alto-site.css";

type PlayProps = {
  onNavigateHome: () => void;
  onRequestSection: (target: string) => void;
};

export default function Play({ onNavigateHome, onRequestSection }: PlayProps) {
  const handleNav = (target: string) => {
    onRequestSection(target);
  };

  return (
    <div className="alto-site">
      <SiteNav onNavigate={handleNav} />
      <main className="site-main play-placeholder">
        <div className="alto-container play-card">
          <h1>Alto Web Client Coming Soon</h1>
          <p>This page will load the full in-browser version of the game. Stay tuned for live duels straight from your browser.</p>
          <div id="alto-web-client-root" className="play-mount" />
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={onNavigateHome}>
            Back to Landing
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
