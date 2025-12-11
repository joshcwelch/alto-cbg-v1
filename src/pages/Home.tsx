import { useEffect } from "react";
import SiteNav from "../components/site/SiteNav";
import HeroSection from "../components/site/HeroSection";
import FeaturesSection from "../components/site/FeaturesSection";
import HeroesShowcase from "../components/site/HeroesShowcase";
import WorldSection from "../components/site/WorldSection";
import CommunitySection from "../components/site/CommunitySection";
import SiteFooter from "../components/site/SiteFooter";
import "../styles/alto-site.css";

export type ScrollRequest = { id: string; at: number };

type HomeProps = {
  onNavigatePlay: () => void;
  onRequestScroll: (target: string) => void;
  scrollRequest?: ScrollRequest | null;
  onScrollHandled?: () => void;
};

const scrollIntoView = (target: string) => {
  const el = document.getElementById(target);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function Home({ onNavigatePlay, onRequestScroll, scrollRequest, onScrollHandled }: HomeProps) {
  useEffect(() => {
    if (!scrollRequest?.id) return;
    const timer = window.setTimeout(() => {
      scrollIntoView(scrollRequest.id);
      onScrollHandled?.();
    }, 40);
    return () => window.clearTimeout(timer);
  }, [scrollRequest, onScrollHandled]);

  const handleSection = (target: string) => onRequestScroll(target);

  return (
    <div className="alto-site">
      <SiteNav onNavigate={handleSection} onPlayClick={onNavigatePlay} />
      <main className="site-main">
        <HeroSection onPlayClick={onNavigatePlay} onDownloadClick={() => handleSection("download")} onNavigateHeroes={() => handleSection("heroes")} />
        <FeaturesSection />
        <HeroesShowcase />
        <WorldSection />
        <CommunitySection onPlayClick={onNavigatePlay} />
      </main>
      <SiteFooter />
    </div>
  );
}
