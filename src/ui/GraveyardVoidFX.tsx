import { useEffect, useRef } from "react";
import type { BoardPoint } from "./BoardSlots";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./boardMetrics";

type Burst = {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  artSrc?: string;
  frameSrc?: string;
};

type GraveyardVoidFXProps = {
  bursts: Burst[];
  portalCenter: BoardPoint;
  portalSize: { width: number; height: number };
  onBurstComplete: (id: string) => void;
};

type Particle = {
  burstId: string;
  x: number;
  y: number;
  px: number;
  py: number;
  kind: "smoke" | "ember" | "tendril";
  vx: number;
  vy: number;
  orbitDelayMs: number;
  pullDelayMs: number;
  collapseDelayMs: number;
  lifeMs: number;
  startTime: number;
  size: number;
  spriteScale: number;
  rotation: number;
  spin: number;
  jitterSeed: number;
  opacitySeed: number;
  snapSeed: number;
  snapBucket: number;
  glow: number;
  drag: number;
  swirlAnchorX: number;
  swirlAnchorY: number;
  trail: number;
};

type BurstSprite = {
  x: number;
  y: number;
  startTime: number;
  lifeMs: number;
  size: number;
};

type Ripple = {
  startTime: number;
  lifeMs: number;
  maxRadius: number;
};

type WispShot = {
  burstId: string;
  startTime: number;
  travelMs: number;
  originX: number;
  originY: number;
};

const SPRITE_PATHS = {
  smoke: "/assets/fx/void/void-smoke.svg",
  ember: "/assets/fx/void/void-ember.svg",
  tendril: "/assets/fx/void/void-tendril.svg",
  burstSheet: "/assets/fx/void/void-burst-sheet.svg",
  wispSheet: "/assets/fx/void/void-wisp-core-sheet.svg",
};

const WISP_SHEET = { frames: 4, frameSize: 128 };
const BURST_SHEET = { frames: 4, frameSize: 128 };

const sampleImagePoints = (
  image: HTMLImageElement,
  width: number,
  height: number,
  step: number,
  maxPoints: number,
  alphaThreshold = 40
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const points: Array<{ x: number; y: number; brightness: number }> = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha <= alphaThreshold) continue;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255);
      points.push({ x, y, brightness });
    }
  }
  if (points.length <= maxPoints) return points;
  const selected: Array<{ x: number; y: number; brightness: number }> = [];
  for (let i = 0; i < points.length; i += 1) {
    if (selected.length < maxPoints) {
      selected.push(points[i]);
    } else {
      const j = Math.floor(Math.random() * (i + 1));
      if (j < maxPoints) selected[j] = points[i];
    }
  }
  return selected;
};

const GraveyardVoidFX = ({
  bursts,
  portalCenter,
  portalSize,
  onBurstComplete,
}: GraveyardVoidFXProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const activeBurstIdsRef = useRef<Set<string>>(new Set());
  const pendingBurstIdsRef = useRef<Set<string>>(new Set());
  const latestBurstIdsRef = useRef<Set<string>>(new Set());
  const burstCountsRef = useRef<Map<string, number>>(new Map());
  const burstSpritesRef = useRef<BurstSprite[]>([]);
  const wispShotsRef = useRef<Map<string, WispShot>>(new Map());
  const wispShotCompletedRef = useRef<Set<string>>(new Set());
  const rippleRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const imagePromiseRef = useRef<Map<string, Promise<HTMLImageElement>>>(new Map());
  const isMountedRef = useRef(true);
  const spriteRefs = useRef<{
    smoke?: HTMLImageElement;
    ember?: HTMLImageElement;
    tendril?: HTMLImageElement;
    burstSheet?: HTMLImageElement;
    wispSheet?: HTMLImageElement;
  }>({});

  useEffect(() => {
    isMountedRef.current = true;
    latestBurstIdsRef.current = new Set(bursts.map((burst) => burst.id));

    const loadImage = (src: string) => {
      const cached = imageCacheRef.current.get(src);
      if (cached?.complete) return Promise.resolve(cached);
      const existingPromise = imagePromiseRef.current.get(src);
      if (existingPromise) return existingPromise;
      const img = cached ?? new Image();
      img.src = src;
      imageCacheRef.current.set(src, img);
      const promise = img.decode().then(() => img);
      imagePromiseRef.current.set(src, promise);
      return promise;
    };

    // Role-specialized particles: staggered timing + force curves define the "claiming" feel.
    const createParticle = (
      burstId: string,
      x: number,
      y: number,
      centerX: number,
      centerY: number,
      brightness: number,
      sizeScale: number,
      trailScale: number,
      isFrame: boolean
    ): Particle => {
      const dx = x - centerX;
      const dy = y - centerY;
      const baseAngle = Math.atan2(dy, dx);
      const angle = baseAngle + (Math.random() - 0.5) * 0.7;
      const speed = 0.1 + Math.random() * 0.22 + (isFrame ? 0.03 : 0);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const roll = Math.random();
      const kind =
        isFrame || brightness > 0.7
          ? "ember"
          : roll < 0.45
            ? "smoke"
            : "tendril";
      const orbitDelayMs = kind === "smoke" ? 80 + Math.random() * 80 : kind === "ember" ? 110 + Math.random() * 90 : 160 + Math.random() * 120;
      const pullDelayMs = orbitDelayMs + (kind === "smoke" ? 260 + Math.random() * 160 : kind === "ember" ? 220 + Math.random() * 120 : 320 + Math.random() * 180);
      const collapseDelayMs = pullDelayMs + (kind === "smoke" ? 360 + Math.random() * 220 : kind === "ember" ? 220 + Math.random() * 140 : 300 + Math.random() * 180);
      const lifeMs = kind === "smoke"
        ? 2200 + Math.random() * 700
        : kind === "ember"
          ? 950 + Math.random() * 420
          : 1500 + Math.random() * 520;
      return {
        burstId,
        x,
        y,
        px: x,
        py: y,
        kind,
        vx,
        vy,
        orbitDelayMs,
        pullDelayMs,
        collapseDelayMs,
        lifeMs,
        startTime: performance.now(),
        size: (1.4 + brightness * 2.2) * sizeScale,
        spriteScale: 0.65 + Math.random() * 0.7,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * (kind === "ember" ? 0.006 : 0.0035),
        jitterSeed: Math.random() * 1000,
        opacitySeed: Math.random() * 1000,
        snapSeed: Math.random(),
        snapBucket: 0,
        glow: Math.min(1, 0.4 + brightness * 0.7 + (isFrame ? 0.2 : 0)),
        drag: 0.981 + Math.random() * 0.012,
        swirlAnchorX: centerX,
        swirlAnchorY: centerY,
        trail: Math.min(1, trailScale + 0.12),
      };
    };

    void Promise.all([
      loadImage(SPRITE_PATHS.smoke),
      loadImage(SPRITE_PATHS.ember),
      loadImage(SPRITE_PATHS.tendril),
      loadImage(SPRITE_PATHS.burstSheet),
      loadImage(SPRITE_PATHS.wispSheet),
    ])
      .then(([smoke, ember, tendril, burstSheet, wispSheet]) => {
        spriteRefs.current = { smoke, ember, tendril, burstSheet, wispSheet };
      })
      .catch(() => {
        // ignore sprite load errors
      });

    const spawnParticleBurst = (burst: Burst, particles: Particle[]) => {
      if (particles.length === 0) return;
      activeBurstIdsRef.current.add(burst.id);
      burstCountsRef.current.set(burst.id, particles.length);
      particlesRef.current = [...particlesRef.current, ...particles];
      const centerX = burst.bounds.x + burst.bounds.width / 2;
      const centerY = burst.bounds.y + burst.bounds.height / 2;
      burstSpritesRef.current = [
        ...burstSpritesRef.current,
        {
          x: centerX,
          y: centerY,
          startTime: performance.now() + 120,
          lifeMs: 360,
          size: Math.min(220, Math.max(140, burst.bounds.width * 1.3)),
        },
      ];
    };

    const spawnGenericBurst = (burst: Burst) => {
      const count = 6 + Math.floor(Math.random() * 7);
      const centerX = burst.bounds.x + burst.bounds.width / 2;
      const centerY = burst.bounds.y + burst.bounds.height / 2;
      const particles: Particle[] = [];
      for (let i = 0; i < count; i += 1) {
        const x = burst.bounds.x + Math.random() * burst.bounds.width;
        const y = burst.bounds.y + Math.random() * burst.bounds.height;
        particles.push(
          createParticle(
            burst.id,
            x,
            y,
            centerX,
            centerY,
            0.4 + Math.random() * 0.6,
            0.9,
            0.5,
            false
          )
        );
      }
      spawnParticleBurst(burst, particles);
    };

    const spawnImageBurst = async (burst: Burst) => {
      if (!burst.artSrc || !burst.frameSrc) return;
      if (pendingBurstIdsRef.current.has(burst.id)) return;
      pendingBurstIdsRef.current.add(burst.id);
      try {
        const [art, frame] = await Promise.all([loadImage(burst.artSrc), loadImage(burst.frameSrc)]);
        if (!isMountedRef.current) return;
        if (!latestBurstIdsRef.current.has(burst.id)) return;
        if (activeBurstIdsRef.current.has(burst.id)) return;
        const { width, height } = burst.bounds;
        const centerX = burst.bounds.x + width / 2;
        const centerY = burst.bounds.y + height / 2;
        const artPoints = sampleImagePoints(art, Math.round(width), Math.round(height), 8, 58, 35);
        const framePoints = sampleImagePoints(frame, Math.round(width), Math.round(height), 9, 36, 45);
        const particles: Particle[] = [];
        artPoints.forEach((point) => {
          particles.push(
            createParticle(
              burst.id,
              burst.bounds.x + point.x,
              burst.bounds.y + point.y,
              centerX,
              centerY,
              point.brightness,
              1,
              0.6,
              false
            )
          );
        });
        framePoints.forEach((point) => {
          particles.push(
            createParticle(
              burst.id,
              burst.bounds.x + point.x,
              burst.bounds.y + point.y,
              centerX,
              centerY,
              Math.min(1, point.brightness + 0.2),
              1.2,
              0.85,
              true
            )
          );
        });
        const extraCount = 8 + Math.floor(Math.random() * 7);
        for (let i = 0; i < extraCount; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const radius = (Math.random() * 0.4 + 0.1) * Math.min(width, height);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          particles.push(
            createParticle(
              burst.id,
              x,
              y,
              centerX,
              centerY,
              0.5 + Math.random() * 0.5,
              1.1,
              0.75,
              false
            )
          );
        }
        spawnParticleBurst(burst, particles);
      } catch {
        spawnGenericBurst(burst);
      } finally {
        pendingBurstIdsRef.current.delete(burst.id);
      }
    };

    const spawnBurst = (burst: Burst) => {
      if (burst.artSrc && burst.frameSrc) {
        void spawnImageBurst(burst);
        return;
      }
      spawnGenericBurst(burst);
    };

    bursts.forEach((burst) => {
      if (!activeBurstIdsRef.current.has(burst.id)) {
        spawnBurst(burst);
      }
    });

    const step = (time: number) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        rafRef.current = null;
        return;
      }

      const lastTime = lastTimeRef.current ?? time;
      const dt = time - lastTime;
      lastTimeRef.current = time;

      const particles = particlesRef.current;
      if (particles.length === 0) {
        ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
        rafRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
      ctx.globalCompositeOperation = "source-over";

      const remaining: Particle[] = [];
      const completedBursts: string[] = [];
      const burstCounts = burstCountsRef.current;
      const wispShots = wispShotsRef.current;
      const wispCompleted = wispShotCompletedRef.current;
      const burstSprites = burstSpritesRef.current;
      const spriteBank = spriteRefs.current;

      let warpStrength = 0;
      if (burstSprites.length > 0 && spriteBank.burstSheet) {
        const sheet = spriteBank.burstSheet;
        ctx.globalCompositeOperation = "lighter";
        const nextBurstSprites: BurstSprite[] = [];
        for (const sprite of burstSprites) {
          const age = time - sprite.startTime;
          if (age < 0) {
            nextBurstSprites.push(sprite);
            continue;
          }
          if (age >= sprite.lifeMs) continue;
          const progress = age / sprite.lifeMs;
          const frame = Math.min(
            BURST_SHEET.frames - 1,
            Math.floor(progress * BURST_SHEET.frames)
          );
          const frameProgress = (progress * BURST_SHEET.frames) % 1;
          const sx = frame * BURST_SHEET.frameSize;
          const sy = 0;
          const overshoot = frameProgress < 0.12 ? 1.08 : 1;
          const size = sprite.size * (0.8 + progress * 0.35) * overshoot;
          ctx.globalAlpha = (1 - progress) * 0.75;
          ctx.drawImage(
            sheet,
            sx,
            sy,
            BURST_SHEET.frameSize,
            BURST_SHEET.frameSize,
            sprite.x - size / 2,
            sprite.y - size / 2,
            size,
            size
          );
          nextBurstSprites.push(sprite);
          warpStrength = Math.max(warpStrength, 1 - progress);
        }
        burstSpritesRef.current = nextBurstSprites;
        ctx.globalCompositeOperation = "source-over";
      }

      for (const particle of particles) {
        const age = time - particle.startTime;
        if (age >= particle.lifeMs) {
          const nextCount = (burstCounts.get(particle.burstId) ?? 1) - 1;
          if (nextCount <= 0) {
            burstCounts.delete(particle.burstId);
            activeBurstIdsRef.current.delete(particle.burstId);
            completedBursts.push(particle.burstId);
          } else {
            burstCounts.set(particle.burstId, nextCount);
          }
          continue;
        }

        particle.px = particle.x;
        particle.py = particle.y;
        particle.rotation += particle.spin * dt;
        const snapBucket = Math.floor(age / 140);
        if (snapBucket !== particle.snapBucket) {
          particle.snapBucket = snapBucket;
          particle.rotation += (particle.snapSeed - 0.5) * 0.35;
        }

        const orbitPhase = age < particle.orbitDelayMs;
        const pullPhase = age >= particle.orbitDelayMs && age < particle.pullDelayMs;
        const collapsePhase = age >= particle.pullDelayMs && age < particle.collapseDelayMs;
        const collapseEndPhase = age >= particle.collapseDelayMs;
        if (orbitPhase) {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.vx *= particle.drag;
          particle.vy *= particle.drag;
        } else {
          // Curving pull: tangential + inward force keeps motion alive, never straight.
          const anchorX = collapseEndPhase ? portalCenter.x : particle.swirlAnchorX;
          const anchorY = collapseEndPhase ? portalCenter.y : particle.swirlAnchorY;
          const dx = anchorX - particle.x;
          const dy = anchorY - particle.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const nx = dx / dist;
          const ny = dy / dist;
          const distScale = Math.min(1, dist / 320);
          const tangential = collapseEndPhase ? 0.0012 : pullPhase ? 0.001 : 0.0007;
          const inward = collapseEndPhase ? 0.0022 : pullPhase ? 0.0015 : 0.0008;
          const resistance = pullPhase ? 0.7 : 1;
          const orbitBias = (particle.jitterSeed % 1) * 0.6 - 0.3;
          particle.vx += ((nx * inward * distScale) + (-ny * tangential + orbitBias * 0.0004)) * dt * resistance;
          particle.vy += ((ny * inward * distScale) + (nx * tangential + orbitBias * 0.0004)) * dt * resistance;
          particle.vx *= particle.drag;
          particle.vy *= particle.drag;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
        }

        const toCenterX = portalCenter.x - particle.x;
        const toCenterY = portalCenter.y - particle.y;
        const distToCenter = Math.hypot(toCenterX, toCenterY);
        const progress = age / particle.lifeMs;
        const fadeIn = Math.min(1, age / 140);
        const fadeOut = progress < 0.78 ? 1 : 1 - (progress - 0.78) / 0.22;
        const centerFade = collapseEndPhase ? Math.min(1, distToCenter / 70) : 1;
        const noiseBucket = Math.floor(age / 90);
        const noise = Math.sin((particle.opacitySeed + noiseBucket) * 12.9898) * 43758.5453;
        const opacityNoise = (noise - Math.floor(noise)) * 0.1 - 0.05;
        let alpha = Math.max(0, fadeIn * fadeOut * centerFade * (1 + opacityNoise));
        if (particle.kind === "ember") {
          if (pullPhase) alpha *= 1.15;
          if (progress > 0.88) alpha = 0;
        }
        const shrink = 1 - Math.min(1, (progress - 0.05) / 0.95);
        const radius = particle.size * Math.max(0.2, shrink);

        if (collapseEndPhase) {
          if (!wispShots.has(particle.burstId) && !wispCompleted.has(particle.burstId)) {
            wispShots.set(particle.burstId, {
              burstId: particle.burstId,
              startTime: time + 80,
              travelMs: 420,
              originX: particle.swirlAnchorX,
              originY: particle.swirlAnchorY,
            });
            wispCompleted.add(particle.burstId);
          }
        }

        if (alpha > 0.01 && !collapseEndPhase) {
          if ((pullPhase || collapsePhase || collapseEndPhase) && particle.trail > 0.01 && spriteBank.tendril) {
            const dx = particle.x - particle.px;
            const dy = particle.y - particle.py;
            const len = Math.hypot(dx, dy);
            if (len > 0.5) {
              const skipFrame = Math.floor(time / 32) % 2 === 0;
              if (!skipFrame) {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(Math.atan2(dy, dx));
                ctx.globalAlpha = alpha * particle.trail * 0.6;
                ctx.globalCompositeOperation = "lighter";
                ctx.scale(Math.min(2.4, 0.6 + len * 0.12), 0.6);
                const trailSize = radius * 4;
                ctx.drawImage(
                  spriteBank.tendril,
                  -trailSize / 2,
                  -trailSize / 2,
                  trailSize,
                  trailSize
                );
                ctx.restore();
              }
            }
          }

          const sprite =
            particle.kind === "ember"
              ? spriteBank.ember
              : particle.kind === "tendril"
                ? spriteBank.tendril
                : spriteBank.smoke;

          const speed = Math.hypot(particle.vx, particle.vy);
          const stretch = collapseEndPhase ? 1 + Math.min(0.8, speed * 2.8) : 1;
          const drawSize = radius * 6 * particle.spriteScale;
          if (sprite) {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation =
              particle.kind === "smoke" ? "source-over" : "lighter";
            ctx.scale(1, stretch);
            ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
            ctx.restore();
          }
        }

        remaining.push(particle);
      }

      if (wispShots.size > 0) {
        // Single wisp shot: straight-line delivery after particles fuse.
        ctx.globalCompositeOperation = "lighter";
        const sheet = spriteBank.wispSheet;
        const nextShots = new Map<string, WispShot>();
        wispShots.forEach((shot, id) => {
          const age = time - shot.startTime;
          if (age < 0) {
            nextShots.set(id, shot);
            return;
          }
          const progress = Math.min(1, age / shot.travelMs);
          const eased = progress * progress * (3 - 2 * progress);
          const drawX = shot.originX + (portalCenter.x - shot.originX) * eased;
          const drawY = shot.originY + (portalCenter.y - shot.originY) * eased;
          const dx = portalCenter.x - shot.originX;
          const dy = portalCenter.y - shot.originY;
          const angle = Math.atan2(dy, dx);
          const flash = progress > 0.82 ? 1.2 : 1;
          const alpha = progress > 0.97 ? 0 : 0.9;
          const coreSize = 58 * flash;

          if (spriteBank.tendril) {
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(angle);
            ctx.globalAlpha = 0.45;
            ctx.scale(2.4, 0.9);
            ctx.drawImage(
              spriteBank.tendril,
              -coreSize * 1.2,
              -coreSize / 2,
              coreSize * 2.4,
              coreSize
            );
            ctx.restore();
          }

          if (sheet) {
            const frame = Math.floor((time / 90) % WISP_SHEET.frames);
            const sx = frame * WISP_SHEET.frameSize;
            ctx.globalAlpha = alpha;
            ctx.drawImage(
              sheet,
              sx,
              0,
              WISP_SHEET.frameSize,
              WISP_SHEET.frameSize,
              drawX - coreSize / 2,
              drawY - coreSize / 2,
              coreSize,
              coreSize
            );
          }

          if (progress < 1) {
            nextShots.set(id, shot);
          }
        });
        wispShotsRef.current = nextShots;
        ctx.globalCompositeOperation = "source-over";
      }

      if (particlesRef.current.length > 0) {
        // Cheap bloom pass to unify sprites without heavy post-processing.
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.08;
        ctx.filter = "blur(2px)";
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = "none";
        ctx.restore();

        if (warpStrength > 0.02) {
          // Subtle portal warp tied to burst timing.
          ctx.save();
          ctx.globalAlpha = 0.05 * warpStrength;
          ctx.globalCompositeOperation = "lighter";
          ctx.filter = "blur(1px)";
          ctx.beginPath();
          ctx.arc(portalCenter.x, portalCenter.y, portalSize.width * 0.55, 0, Math.PI * 2);
          ctx.clip();
          const warp = Math.sin(time / 240) * 1.2 * warpStrength;
          ctx.drawImage(ctx.canvas, warp, -warp);
          ctx.filter = "none";
          ctx.restore();
        }
      }

      if (rippleRef.current.length > 0) {
        // Pressure-release ripple: brief, localized pulse after collapse.
        const nextRipples: Ripple[] = [];
        rippleRef.current.forEach((ripple) => {
          const age = time - ripple.startTime;
          if (age >= ripple.lifeMs) return;
          const progress = age / ripple.lifeMs;
          const radius = ripple.maxRadius * (0.2 + progress);
          ctx.globalAlpha = (1 - progress) * 0.35;
          ctx.strokeStyle = "rgba(20, 10, 30, 0.7)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(portalCenter.x, portalCenter.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          nextRipples.push(ripple);
        });
        rippleRef.current = nextRipples;
      }

      ctx.save();
      // Local vignette keeps the portal dangerous and focused.
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.25;
      const vignette = ctx.createRadialGradient(
        portalCenter.x,
        portalCenter.y,
        portalSize.width * 0.15,
        portalCenter.x,
        portalCenter.y,
        portalSize.width * 0.65
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.45)");
      ctx.fillStyle = vignette;
      ctx.beginPath();
      ctx.arc(portalCenter.x, portalCenter.y, portalSize.width * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha = 1;
      particlesRef.current = remaining;

      if (completedBursts.length > 0) {
        completedBursts.forEach(onBurstComplete);
        rippleRef.current = [
          ...rippleRef.current,
          ...completedBursts.map(() => ({
            startTime: time,
            lifeMs: 280,
            maxRadius: portalSize.width * 0.7,
          })),
        ];
        completedBursts.forEach((id) => {
          wispShotsRef.current.delete(id);
          wispShotCompletedRef.current.delete(id);
        });
      }

      if (remaining.length > 0) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        lastTimeRef.current = null;
        ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
      }
    };

    if (particlesRef.current.length > 0 && rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(step);
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [bursts, onBurstComplete, portalCenter.x, portalCenter.y, portalSize.height, portalSize.width]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="graveyard-void-canvas"
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      aria-hidden="true"
    />
  );
};

export default GraveyardVoidFX;
