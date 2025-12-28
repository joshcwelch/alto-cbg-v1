/* ==========================================================================
   Alto — AttackAnimationService
   Version: 1.0.0
   Purpose: Imperative “ghost slam” animations that must survive React rerenders.
   Notes:
   - Presentation-only. Does not touch engine state.
   - Uses Web Animations API for reliability.
   ========================================================================== */

export type SlamProfile = "LIGHT" | "HEAVY" | "LETHAL";

export type Point = { x: number; y: number };

export type AttackSlamParams = {
  /** A stable DOM container that shares board coordinate space */
  layer: HTMLElement;

  /** Start and end points in the SAME coordinate system as `layer` */
  from: Point;
  to: Point;

  /** Visual */
  artUrl: string;
  sizePx: number; // match your minion visual footprint (or slightly larger)
  slam: SlamProfile;
  attack?: number;
  health?: number;

  /** Optional hooks */
  onImpact?: () => void;
};

type ActiveAnim = { el: HTMLElement; cancel: () => void };

function slamTuning(slam: SlamProfile) {
  switch (slam) {
    case "LETHAL":
      return {
        liftMs: 500,
        pauseMs: 500,
        lungeMs: 120,
        duration: 1120,
        scale: 1.14,
        lift: -8,
        impactScale: 0.92,
        impactBrightness: 1.2,
        liftScale: 1.5,
        lungeScale: 1.18,
      };
    case "HEAVY":
      return {
        liftMs: 500,
        pauseMs: 500,
        lungeMs: 120,
        duration: 1120,
        scale: 1.1,
        lift: -7,
        impactScale: 0.95,
        impactBrightness: 1.15,
        liftScale: 1.5,
        lungeScale: 1.14,
      };
    default:
      return {
        liftMs: 500,
        pauseMs: 500,
        lungeMs: 120,
        duration: 1120,
        scale: 1.06,
        lift: -6,
        impactScale: 0.97,
        impactBrightness: 1.1,
        liftScale: 1.5,
        lungeScale: 1.1,
      };
  }
}

/**
 * Imperative animator. Create once and reuse.
 */
export class AttackAnimationService {
  private active: ActiveAnim[] = [];

  /** Kill any in-flight animations (turn change, game over, disable presentation) */
  stopAll() {
    for (const a of this.active) a.cancel();
    this.active = [];
  }

  /**
   * Plays a “ghost attacker” slam. Returns a promise that resolves when animation finishes.
   */
  playAttackSlam(params: AttackSlamParams): Promise<void> {
    const { layer, from, to, artUrl, sizePx, slam, onImpact } = params;
    console.log("[AttackAnimationService] slam", { from, to, artUrl, slam });
    const t = slamTuning(slam);

    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.left = `${from.x - sizePx / 2}px`;
    el.style.top = `${from.y - sizePx / 2}px`;
    el.style.width = `${sizePx}px`;
    el.style.height = `${sizePx}px`;
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    el.style.willChange = "transform, opacity, filter";
    el.className = "board-minion";

    const art = document.createElement("img");
    art.className = "board-minion__art";
    art.src = artUrl;
    art.alt = "";

    const frame = document.createElement("img");
    frame.className = "board-minion__frame";
    frame.src = "/assets/ui/frames/minion.png";
    frame.alt = "";

    el.appendChild(art);
    el.appendChild(frame);

    if (typeof params.attack === "number" && typeof params.health === "number") {
      const attackStat = document.createElement("div");
      attackStat.className = "board-minion__stat board-minion__stat--attack";
      const attackIcon = document.createElement("img");
      attackIcon.className = "board-minion__stat-icon";
      attackIcon.src = "/assets/ui/attack.PNG";
      attackIcon.alt = "";
      const attackText = document.createElement("span");
      attackText.className = "board-minion__stat-text";
      attackText.textContent = `${params.attack}`;
      attackStat.appendChild(attackIcon);
      attackStat.appendChild(attackText);

      const healthStat = document.createElement("div");
      healthStat.className = "board-minion__stat board-minion__stat--health";
      const healthIcon = document.createElement("img");
      healthIcon.className = "board-minion__stat-icon";
      healthIcon.src = "/assets/ui/health.PNG";
      healthIcon.alt = "";
      const healthText = document.createElement("span");
      healthText.className = "board-minion__stat-text";
      healthText.textContent = `${params.health}`;
      healthStat.appendChild(healthIcon);
      healthStat.appendChild(healthText);

      el.appendChild(attackStat);
      el.appendChild(healthStat);
    }

    layer.appendChild(el);

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Phase A: lift + brief pause, Phase B: aggressive lunge
    const liftProgress = t.liftMs / t.duration;
    const pauseProgress = t.pauseMs / t.duration;
    const lungeStart = liftProgress + pauseProgress;

    const liftX = dx * 0.12;
    const liftY = dy * 0.12 + t.lift;
    const lungeX = dx * 0.4;
    const lungeY = dy * 0.4 + t.lift * 0.35;

    const a = el.animate(
      [
        { transform: `translate(0px, 0px) scale(1)`, opacity: 1, filter: "brightness(1)" },
        {
          transform: `translate(${liftX}px, ${liftY}px) scale(${t.liftScale})`,
          opacity: 1,
          filter: "brightness(1.06)",
          offset: liftProgress,
        },
        {
          transform: `translate(${liftX}px, ${liftY}px) scale(${t.liftScale})`,
          opacity: 1,
          filter: "brightness(1.06)",
          offset: lungeStart,
        },
        {
          transform: `translate(${lungeX}px, ${lungeY}px) scale(${t.lungeScale})`,
          opacity: 1,
          filter: "brightness(1.1)",
          offset: Math.min(0.92, lungeStart + t.lungeMs / t.duration),
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${t.scale})`,
          opacity: 1,
          filter: "brightness(1.12)",
        },
      ],
      { duration: t.duration, easing: "cubic-bezier(0.15, 0.9, 0.2, 1)", fill: "forwards" }
    );

    let impacted = false;

    // Fire impact near the end (consistent “slam” moment)
    const impactTimer = window.setTimeout(() => {
      impacted = true;
      try {
        onImpact?.();
      } catch {
        // ignore
      }

      // Phase B: tiny “hit stop” feel without blocking gameplay: quick squash + fade
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${t.scale})`, opacity: 1, filter: "brightness(1)" },
          { transform: `translate(${dx}px, ${dy}px) scale(${t.impactScale})`, opacity: 1, filter: `brightness(${t.impactBrightness})` },
          { transform: `translate(${dx}px, ${dy}px) scale(${t.scale})`, opacity: 0.0, filter: "brightness(1)" },
        ],
        { duration: 240, easing: "ease-out", fill: "forwards" }
      );
    }, Math.max(0, t.duration - 140));

    const cancel = () => {
      window.clearTimeout(impactTimer);
      try {
        a.cancel();
      } catch {}
      if (el.parentElement) el.remove();
    };

    this.active.push({ el, cancel });

    return new Promise((resolve) => {
      a.onfinish = () => {
        // If impact didn’t fire for some reason, fire now (last resort)
        if (!impacted) {
          try {
            onImpact?.();
          } catch {}
        }
        cancel();
        // remove from active list
        this.active = this.active.filter((x) => x.el !== el);
        resolve();
      };
      a.oncancel = () => {
        cancel();
        this.active = this.active.filter((x) => x.el !== el);
        resolve();
      };
    });
  }
}
