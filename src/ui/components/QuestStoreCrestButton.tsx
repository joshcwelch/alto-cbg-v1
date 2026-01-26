import { useRef } from "react";

type QuestStoreCrestButtonProps = {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
};

const QuestStoreCrestButton = ({
  onClick,
  className = "",
  ariaLabel = "Visit the Store",
}: QuestStoreCrestButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const spawnParticles = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    for (let i = 0; i < 6; i += 1) {
      const particle = document.createElement("span");
      particle.className = "quest-store-crest__particle";
      const x = rect.width * (0.12 + Math.random() * 0.3);
      const y = rect.height * (0.25 + Math.random() * 0.5);
      const dx = (Math.random() * 20 - 10).toFixed(2);
      const dy = -(26 + Math.random() * 20).toFixed(2);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty("--dx", `${dx}px`);
      particle.style.setProperty("--dy", `${dy}px`);
      button.appendChild(particle);
      particle.addEventListener("animationend", () => {
        particle.remove();
      });
    }
  };

  const triggerClickFlash = () => {
    const button = buttonRef.current;
    if (!button) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    button.classList.add("is-click-flash");
    window.setTimeout(() => {
      button.classList.remove("is-click-flash");
    }, 180);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`quest-store-crest ${className}`.trim()}
      onClick={(event) => {
        triggerClickFlash();
        onClick();
      }}
      onMouseEnter={spawnParticles}
      onFocus={() => {
        if (buttonRef.current?.matches(":focus-visible")) {
          spawnParticles();
        }
      }}
      aria-label={ariaLabel}
    >
      <span className="quest-store-crest__label" aria-hidden="true">
        <span>Need more Resources?</span>
        <span className="quest-store-crest__label-subtle">Visit the store!</span>
      </span>
      <img className="quest-store-crest__img" src="/assets/ui/quests/quest-store_icon.png" alt="" />
    </button>
  );
};

export default QuestStoreCrestButton;
