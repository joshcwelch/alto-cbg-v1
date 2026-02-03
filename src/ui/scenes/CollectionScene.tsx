import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useUIStore } from "../state/useUIStore";
import CollectionCardGrid from "../components/CollectionCardGrid";
import CollectionFactionFilter, { type FactionId } from "../components/CollectionFactionFilter";

const CollectionScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  type FilterKey = "all" | "unit" | "spell" | "artifact";
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [selectedFaction, setSelectedFaction] = useState<FactionId | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [rarityOpen, setRarityOpen] = useState(false);
  const [rarityFilter, setRarityFilter] = useState("All Rarities");
  const [showOwned, setShowOwned] = useState(true);
  const [showUnowned, setShowUnowned] = useState(true);
  const [filterSliderVars, setFilterSliderVars] = useState({
    top: "204px",
    dy: "0px",
    rangeTop: "204px",
    rangeHeight: "0px",
  });
  const filterSliderOffset = -14;
  const filterRefs = useRef<Record<FilterKey, HTMLButtonElement | null>>({
    all: null,
    unit: null,
    spell: null,
    artifact: null,
  });
  const sliderRef = useRef<HTMLImageElement | null>(null);
  const toggleOwned = () => setShowOwned((v) => !v);
  const toggleUnowned = () => setShowUnowned((v) => !v);
  const rarityProgress = [
    { key: "common", label: "Common", icon: "/assets/ui/collection/collection-icon_common.png", pct: 67 },
    { key: "ucommon", label: "Uncommon", icon: "/assets/ui/collection/collection-icon_ucommon.png", pct: 52 },
    { key: "rare", label: "Rare", icon: "/assets/ui/collection/collection-icon_rare.png", pct: 37 },
    { key: "epic", label: "Epic", icon: "/assets/ui/collection/collection-icon_epic.png", pct: 18 },
    { key: "legendary", label: "Legendary", icon: "/assets/ui/collection/collection-icon_legendary.png", pct: 6 },
    { key: "mythic", label: "Mythic", icon: "/assets/ui/collection/collection-icon_mythic.png", pct: 2 },
  ] as const;
  const rarityOptions = [
    { key: "all", label: "All Rarities", icon: null },
    { key: "common", label: "Common", icon: "/assets/ui/collection/collection-icon_common.png" },
    { key: "ucommon", label: "Uncommon", icon: "/assets/ui/collection/collection-icon_ucommon.png" },
    { key: "rare", label: "Rare", icon: "/assets/ui/collection/collection-icon_rare.png" },
    { key: "epic", label: "Epic", icon: "/assets/ui/collection/collection-icon_epic.png" },
    { key: "legendary", label: "Legendary", icon: "/assets/ui/collection/collection-icon_legendary.png" },
    { key: "mythic", label: "Mythic", icon: "/assets/ui/collection/collection-icon_mythic.png" },
  ] as const;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const roots = Array.from(document.querySelectorAll<HTMLElement>(".collection-fx-group--flame"));
    if (roots.length === 0) return;

    const dpr = window.devicePixelRatio || 1;

    const drawFlame = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      time: number,
      seed: number
    ) => {
      const baseW = size * 0.33;
      const baseH = size * 1.04;
      const flicker = 0.9 + 0.08 * Math.sin(time * 3.2 + seed * 2.1);
      const wobble = 0.08 * Math.sin(time * 6.1 + seed * 1.7);
      const sway = 0.12 * Math.sin(time * 1.8 + seed * 3.4);
      const width = baseW * (0.9 + 0.05 * Math.sin(time * 4.1 + seed));
      const height = baseH * (0.95 + 0.12 * Math.sin(time * 3.6 + seed * 2.5));
      const tilt = width * wobble;

      ctx.globalCompositeOperation = "screen";

      const outer = ctx.createLinearGradient(cx, cy - height, cx, cy + height * 0.35);
      outer.addColorStop(0, "rgba(190, 245, 255, 0.95)");
      outer.addColorStop(0.55, "rgba(70, 180, 255, 0.75)");
      outer.addColorStop(1, "rgba(20, 70, 120, 0.1)");

      ctx.fillStyle = outer;
      ctx.globalAlpha = 0.82 * flicker;
      ctx.shadowColor = "rgba(120, 210, 255, 0.45)";
      ctx.shadowBlur = size * 0.4;
      const edgeJitter = size * 0.02 * Math.sin(time * 7.3 + seed * 4.1);
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.72, cy + height * 0.35);
      ctx.bezierCurveTo(
        cx - width * 0.85 + tilt - edgeJitter,
        cy - height * 0.05 + edgeJitter,
        cx - width * 0.35 + tilt + edgeJitter,
        cy - height * 0.8,
        cx + tilt,
        cy - height - edgeJitter
      );
      ctx.bezierCurveTo(
        cx + width * 0.35 + tilt - edgeJitter,
        cy - height * 0.8,
        cx + width * 0.85 + tilt + edgeJitter,
        cy - height * 0.05 + edgeJitter,
        cx + width * 0.72 + edgeJitter,
        cy + height * 0.35
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      const inner = ctx.createLinearGradient(cx, cy - height, cx, cy + height * 0.2);
      inner.addColorStop(0, "rgba(230, 255, 255, 0.98)");
      inner.addColorStop(0.55, "rgba(120, 210, 255, 0.85)");
      inner.addColorStop(1, "rgba(30, 90, 140, 0)");

      ctx.fillStyle = inner;
      ctx.globalAlpha = 0.78 * flicker;
      ctx.shadowColor = "rgba(210, 250, 255, 0.35)";
      ctx.shadowBlur = size * 0.22;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.3, cy + height * 0.2);
      ctx.bezierCurveTo(
        cx - width * 0.35 + tilt * 1.1,
        cy - height * 0.15,
        cx - width * 0.1 + tilt * 0.8,
        cy - height * 0.72,
        cx + tilt * 0.8,
        cy - height * 0.88
      );
      ctx.bezierCurveTo(
        cx + width * 0.1 + tilt * 0.8,
        cy - height * 0.7,
        cx + width * 0.35 + tilt * 1.1,
        cy - height * 0.1,
        cx + width * 0.3,
        cy + height * 0.2
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 0.5 * flicker;
      ctx.fillStyle = "rgba(200, 245, 255, 0.9)";
      ctx.beginPath();
      ctx.ellipse(cx + sway * size * 0.12, cy - height * 0.1, size * 0.12, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const cleanups: Array<() => void> = [];

    roots.forEach((root) => {
      const flameCanvas = document.createElement("canvas");
      flameCanvas.className = "collection__lantern-flames";
      flameCanvas.style.display = "block";
      root.appendChild(flameCanvas);
      const ctx = flameCanvas.getContext("2d");
      if (!ctx) {
        flameCanvas.remove();
        return;
      }

      let rafId = 0;

      const resize = () => {
        const rect = root.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        flameCanvas.width = Math.max(1, Math.floor(width * dpr));
        flameCanvas.height = Math.max(1, Math.floor(height * dpr));
        flameCanvas.style.width = `${width}px`;
        flameCanvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const draw = (time: number) => {
        ctx.clearRect(0, 0, flameCanvas.clientWidth, flameCanvas.clientHeight);
        const baseSize = Math.min(flameCanvas.clientWidth, flameCanvas.clientHeight) * 0.75;
        const anchorX = flameCanvas.clientWidth * 0.5;
        const anchorY = flameCanvas.clientHeight * 0.95;
        const layers = [
          { scale: 0.85, offsetX: 0, offsetY: 0, seedOffset: 0, angleBase: 0, stretch: 1.2 },
          { scale: 0.6, offsetX: -6, offsetY: -10, seedOffset: 0.8, angleBase: -0.16, stretch: 0.95 },
          { scale: 0.48, offsetX: 8, offsetY: -14, seedOffset: 1.6, angleBase: 0.16, stretch: 0.9 },
        ];
        const size = baseSize * 0.98;
        const height = size * 1.25;
        layers.forEach((layer) => {
          const angle = layer.angleBase + Math.sin(time * 1.6 + 1.4 * 2.2) * 0.03;
          ctx.save();
          ctx.translate(anchorX + layer.offsetX, anchorY - height * 0.35 + layer.offsetY);
          ctx.rotate(angle);
          ctx.scale(1, layer.stretch);
          drawFlame(ctx, 0, 0, baseSize * layer.scale, time, 1.4 + layer.seedOffset);
          ctx.restore();
        });
      };

      const frame = (now: number) => {
        draw(now / 1000);
        rafId = window.requestAnimationFrame(frame);
      };

      resize();
      rafId = window.requestAnimationFrame(frame);
      window.addEventListener("resize", resize);

      cleanups.push(() => {
        window.removeEventListener("resize", resize);
        window.cancelAnimationFrame(rafId);
        flameCanvas.remove();
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const roots = Array.from(document.querySelectorAll<HTMLElement>(".collection-fx-group--particles"));
    if (roots.length === 0) return;

    const spawnPip = (container: HTMLElement, variant: "base" | "ember") => {
      const pip = document.createElement("span");
      pip.className = variant === "ember" ? "collection__pip collection__pip--ember" : "collection__pip";
      const x = 10 + Math.random() * 60;
      const size = variant === "ember" ? 1.6 + Math.random() * 2.2 : 1.2 + Math.random() * 1.6;
      const rise = variant === "ember" ? 90 + Math.random() * 130 : 70 + Math.random() * 110;
      const drift = Math.round(Math.random() * 18 - 9);
      const duration = variant === "ember" ? 2400 + Math.random() * 1600 : 2000 + Math.random() * 1400;
      pip.style.left = `${x}%`;
      pip.style.bottom = `${Math.random() * 10}%`;
      pip.style.width = `${size}px`;
      pip.style.height = `${size}px`;
      pip.style.setProperty("--rise", `${rise}px`);
      pip.style.setProperty("--drift", `${drift}px`);
      pip.style.setProperty("--dur", `${duration}ms`);
      container.appendChild(pip);
      pip.addEventListener("animationend", () => {
        pip.remove();
      });
    };

    const cleanups: Array<() => void> = [];

    roots.forEach((root) => {
      const pipBox = document.createElement("div");
      pipBox.className = "collection__pip-box";
      root.appendChild(pipBox);

      const pipInterval = window.setInterval(() => {
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i += 1) {
          spawnPip(pipBox, "base");
        }
        if (Math.random() > 0.5) {
          spawnPip(pipBox, "ember");
        }
      }, 460);

      cleanups.push(() => {
        window.clearInterval(pipInterval);
        pipBox.remove();
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const roots = Array.from(document.querySelectorAll<HTMLElement>(".collection-fx-group--smoke"));
    if (roots.length === 0) return;

    const spawnSmoke = (container: HTMLElement) => {
      const puff = document.createElement("span");
      puff.className = "collection__smoke";
      const x = 8 + Math.random() * 70;
      const size = 26 + Math.random() * 22;
      const drift = Math.round(Math.random() * 18 - 9);
      const rise = 38 + Math.random() * 50;
      const duration = 3000 + Math.random() * 2000;
      const delay = Math.random() * 240;
      puff.style.left = `${x}%`;
      puff.style.bottom = `${Math.random() * 15}%`;
      puff.style.width = `${size}px`;
      puff.style.height = `${size}px`;
      puff.style.setProperty("--drift", `${drift}px`);
      puff.style.setProperty("--rise", `${rise}px`);
      puff.style.setProperty("--dur", `${duration}ms`);
      puff.style.setProperty("--delay", `${delay}ms`);
      container.appendChild(puff);
      puff.addEventListener("animationend", () => {
        puff.remove();
      });
    };

    const cleanups: Array<() => void> = [];

    roots.forEach((root) => {
      const smokeBox = document.createElement("div");
      smokeBox.className = "collection__smoke-box";
      root.appendChild(smokeBox);

      const smokeInterval = window.setInterval(() => {
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i += 1) {
          spawnSmoke(smokeBox);
        }
      }, 560);

      cleanups.push(() => {
        window.clearInterval(smokeInterval);
        smokeBox.remove();
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMove = (event: MouseEvent) => {
      setCursor({ x: Math.round(event.clientX), y: Math.round(event.clientY) });
    };
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const measure = () => {
      const baseEl = filterRefs.current.all;
      const targetEl = filterRefs.current[selectedFilter];
      const sliderEl = sliderRef.current;
      if (!baseEl || !targetEl) return;
      const baseRect = baseEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const sliderRect = sliderEl?.getBoundingClientRect();
      const baseY = baseRect.top + baseRect.height / 2 + filterSliderOffset;
      const targetY = targetRect.top + targetRect.height / 2 + filterSliderOffset;
      const dy = targetY - baseY;
      const centers = [
        filterRefs.current.all,
        filterRefs.current.unit,
        filterRefs.current.spell,
        filterRefs.current.artifact,
      ]
        .map((el) => el?.getBoundingClientRect())
        .filter((rect): rect is DOMRect => Boolean(rect));
      const minCenter = Math.min(...centers.map((rect) => rect.top + rect.height / 2));
      const maxCenter = Math.max(...centers.map((rect) => rect.top + rect.height / 2));
      const sliderHalf = sliderRect ? sliderRect.height / 2 : 0;
      const rangeTop = minCenter + filterSliderOffset - sliderHalf;
      const rangeHeight = maxCenter - minCenter + sliderHalf * 2;
      setFilterSliderVars({
        top: `${baseY}px`,
        dy: `${dy}px`,
        rangeTop: `${rangeTop}px`,
        rangeHeight: `${rangeHeight}px`,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [selectedFilter]);

  const RarityProgressPanel = (
    <div className="collection-scene__rarity-progress" aria-label="Collection progress by rarity">
      {rarityProgress.map((row) => (
        <div key={row.key} className="collection-scene__rarity-progress-row">
          <img className="collection-scene__rarity-progress-icon" src={row.icon} alt="" aria-hidden="true" />
          <div className="collection-scene__rarity-progress-text">
            <div className="collection-scene__rarity-progress-title">{row.label} Cards</div>
            <div className="collection-scene__rarity-progress-sub">{row.pct}% Collected</div>
          </div>
        </div>
      ))}
    </div>
  );

  const OwnershipFilterToggles = (
    <div className="collection-scene__ownership-toggles" aria-label="Ownership filters">
      <button
        type="button"
        className={"collection-scene__ownership-toggle" + (showOwned ? " is-on" : " is-off")}
        onClick={toggleOwned}
        aria-pressed={showOwned}
        aria-label="Toggle Owned"
      >
        <img
          className="collection-scene__ownership-toggle-icon"
          src={
            showOwned
              ? "/assets/ui/collection/collection-filter_toggle-eye_on.png"
              : "/assets/ui/collection/collection-filter_toggle-eye_off.png"
          }
          alt=""
          aria-hidden="true"
        />
        <span className="collection-scene__ownership-toggle-label">Owned</span>
      </button>

      <button
        type="button"
        className={"collection-scene__ownership-toggle" + (showUnowned ? " is-on" : " is-off")}
        onClick={toggleUnowned}
        aria-pressed={showUnowned}
        aria-label="Toggle Unowned"
      >
        <img
          className="collection-scene__ownership-toggle-icon"
          src={
            showUnowned
              ? "/assets/ui/collection/collection-filter_toggle-eye_on.png"
              : "/assets/ui/collection/collection-filter_toggle-eye_off.png"
          }
          alt=""
          aria-hidden="true"
        />
        <span className="collection-scene__ownership-toggle-label">Unowned</span>
      </button>
    </div>
  );

  return (
    <div className="collection-scene collection-scene--empty">
      <div className="collection-scene__bg" aria-hidden="true" />
      <div className="collection-fx-group collection-fx-group--flame" aria-hidden="true" />
      <div className="collection-fx-group collection-fx-group--flame collection-fx-group--flame-b" aria-hidden="true" />
      <div className="collection-fx-group collection-fx-group--particles" aria-hidden="true" />
      <div
        className="collection-fx-group collection-fx-group--particles collection-fx-group--particles-b"
        aria-hidden="true"
      />
      <div className="collection-fx-group collection-fx-group--smoke" aria-hidden="true" />
      <div className="collection-fx-group collection-fx-group--smoke collection-fx-group--smoke-b" aria-hidden="true" />
      <button
        type="button"
        className="collection-scene__filter-button"
        ref={(el) => {
          filterRefs.current.all = el;
        }}
        onClick={() => setSelectedFilter("all")}
        aria-label="All Cards"
        aria-pressed={selectedFilter === "all"}
      >
        <span className="collection-scene__filter-button-label">ALL CARDS</span>
        <img src="/assets/ui/collection/collection-filter-btn_allcards.png" alt="" />
      </button>
      <button
        type="button"
        className="collection-scene__filter-button collection-scene__filter-button--secondary"
        ref={(el) => {
          filterRefs.current.unit = el;
        }}
        onClick={() => setSelectedFilter("unit")}
        aria-label="All Cards"
        aria-pressed={selectedFilter === "unit"}
      >
        <span className="collection-scene__filter-button-label">UNIT</span>
        <img src="/assets/ui/collection/collection-filter-btn_units.png" alt="" />
      </button>
      <button
        type="button"
        className="collection-scene__filter-button collection-scene__filter-button--tertiary"
        ref={(el) => {
          filterRefs.current.spell = el;
        }}
        onClick={() => setSelectedFilter("spell")}
        aria-label="All Cards"
        aria-pressed={selectedFilter === "spell"}
      >
        <span className="collection-scene__filter-button-label">SPELL</span>
        <img src="/assets/ui/collection/collection-filter-btn_spells.png" alt="" />
      </button>
      <button
        type="button"
        className="collection-scene__filter-button collection-scene__filter-button--quaternary"
        ref={(el) => {
          filterRefs.current.artifact = el;
        }}
        onClick={() => setSelectedFilter("artifact")}
        aria-label="All Cards"
        aria-pressed={selectedFilter === "artifact"}
      >
        <span className="collection-scene__filter-button-label">ARTIFACT</span>
        <img src="/assets/ui/collection/collection-filter-btn_artifacts.png" alt="" />
      </button>
      <img
        className="collection-scene__filter-slider"
        src="/assets/ui/collection/collection-filter-btn-slider.png"
        alt=""
        aria-hidden="true"
        ref={(el) => {
          sliderRef.current = el;
        }}
        style={{
          ["--filter-slider-top" as any]: filterSliderVars.top,
          ["--filter-slider-dy" as any]: filterSliderVars.dy,
          ["--filter-slider-range-top" as any]: filterSliderVars.rangeTop,
          ["--filter-slider-range-height" as any]: filterSliderVars.rangeHeight,
        }}
      />
      <div className="collection-scene__search" aria-label="Search cards">
        <span className="collection-scene__search-icon" aria-hidden="true" />
        <div className="collection-search-frame">
          <input
            className="collection-scene__search-input collection-search-input"
            type="text"
            placeholder="Search cards"
            aria-label="Search cards"
          />
        </div>
      </div>
      <div className="collection-scene__rarity-filter" aria-label="Rarity filter">
        <div className="collection-scene__rarity-filter-menu">
          <button
            type="button"
            className="collection-scene__rarity-filter-trigger collection-rarity-dropdown-trigger"
            aria-haspopup="listbox"
            aria-expanded={rarityOpen}
            onClick={() => setRarityOpen((prev) => !prev)}
          >
              <span>{rarityFilter}</span>
              <span className="collection-scene__rarity-filter-caret" aria-hidden="true">
                ▼
              </span>
          </button>
          {rarityOpen ? (
            <div
              className="collection-scene__rarity-filter-list collection-rarity-menu"
              role="listbox"
              aria-label="Rarity options"
            >
              {rarityOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={
                    "collection-scene__rarity-filter-option collection-rarity-menu__item" +
                    (rarityFilter === option.label ? " is-selected" : "")
                  }
                  role="option"
                  aria-selected={rarityFilter === option.label}
                  data-rarity={option.key}
                  onClick={() => {
                    setRarityFilter(option.label);
                    setRarityOpen(false);
                  }}
                >
                  {option.icon ? (
                    <img
                      className="collection-rarity-menu__icon"
                      src={option.icon}
                      alt=""
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="collection-rarity-menu__icon collection-rarity-menu__icon--placeholder" />
                  )}
                  <span className="collection-rarity-menu__label">{option.label}</span>
                  <span className="collection-rarity-menu__check" aria-hidden="true">
                    ✓
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <CollectionFactionFilter selectedFaction={selectedFaction} onFactionChange={setSelectedFaction} />
      {RarityProgressPanel}
      {OwnershipFilterToggles}
      <div className="collection-scene__cardgrid-host">
        {/* TODO: use showOwned/showUnowned to filter cards by ownership. */}
        <CollectionCardGrid selectedFaction={selectedFaction} />
      </div>
      <div className="collection-debug" aria-hidden="true">
        Cursor: {cursor.x}, {cursor.y}
      </div>
      <div className="collection-scene__actions-panel" aria-label="Collection actions">
        <button
          type="button"
          className="collection-scene__deckbuilder"
          onClick={() => setScene("DECK_BUILDER")}
          aria-label="Deck Builder"
        >
          <span className="collection-scene__deckbuilder-art">
            <img src="/assets/ui/collection/collection-deckbuilder-btn.png" alt="Deck Builder" />
          </span>
        </button>
        <button
          type="button"
          className="collection-scene__salvage"
          onClick={() => window.alert("TODO: Salvage.")}
          aria-label="Salvage"
        >
          <img src="/assets/ui/collection/collection-salvage-btn.png" alt="Salvage" />
        </button>
      </div>
      <button
        type="button"
        className="main-menu-nav-button collection-scene__exit"
        onClick={() => setScene("MAIN_MENU")}
      >
        <span className="main-menu-nav-button__art" aria-hidden="true">
          <img
            className="main-menu-nav-button__img main-menu-nav-button__img--inactive"
            src="/assets/ui/collection/collection-main-btn_inactive.png"
            alt=""
          />
          <img
            className="main-menu-nav-button__img main-menu-nav-button__img--active"
            src="/assets/ui/collection/collection-main-btn_active.png"
            alt=""
          />
        </span>
        <span className="main-menu-nav-button__label">EXIT</span>
      </button>
    </div>
  );
};

export default CollectionScene;

