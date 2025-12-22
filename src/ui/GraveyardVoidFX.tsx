import { useEffect, useRef } from "react";
import type { BoardPoint } from "./BoardSlots";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./boardMetrics";

type Burst = {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
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
  vx: number;
  vy: number;
  driftDelayMs: number;
  lifeMs: number;
  startTime: number;
  size: number;
  color: string;
};

const PARTICLE_COLORS = ["#3a1f4f", "#2a2f52", "#0b0b12"];

const GraveyardVoidFX = ({
  bursts,
  portalCenter,
  portalSize,
  onBurstComplete,
}: GraveyardVoidFXProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const activeBurstIdsRef = useRef<Set<string>>(new Set());
  const burstCountsRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const maskRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const mask = new Image();
    mask.src = "/fx/graveyard/portal-vortex-mask.png";
    mask.onload = () => {
      maskRef.current = mask;
    };
    return () => {
      maskRef.current = null;
    };
  }, []);

  useEffect(() => {
    const spawnBurst = (burst: Burst) => {
      const count = 12 + Math.floor(Math.random() * 19);
      const particles: Particle[] = [];
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const driftSpeed = 0.015 + Math.random() * 0.03;
        const x = burst.bounds.x + Math.random() * burst.bounds.width;
        const y = burst.bounds.y + Math.random() * burst.bounds.height;
        particles.push({
          burstId: burst.id,
          x,
          y,
          vx: Math.cos(angle) * driftSpeed,
          vy: Math.sin(angle) * driftSpeed,
          driftDelayMs: 60 + Math.random() * 140,
          lifeMs: 1100 + Math.random() * 500,
          startTime: performance.now(),
          size: 2 + Math.random() * 3,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
      activeBurstIdsRef.current.add(burst.id);
      burstCountsRef.current.set(burst.id, count);
      particlesRef.current = [...particlesRef.current, ...particles];
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

        if (age < particle.driftDelayMs) {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
        } else {
          const dx = portalCenter.x - particle.x;
          const dy = portalCenter.y - particle.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const nx = dx / dist;
          const ny = dy / dist;
          const accel = 0.00035 + (1 - Math.min(dist / 320, 1)) * 0.0011;
          particle.vx += nx * accel * dt;
          particle.vy += ny * accel * dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
        }

        const toCenterX = portalCenter.x - particle.x;
        const toCenterY = portalCenter.y - particle.y;
        const distToCenter = Math.hypot(toCenterX, toCenterY);
        const progress = age / particle.lifeMs;
        const fadeOut = progress < 0.65 ? 1 : 1 - (progress - 0.65) / 0.35;
        const centerFade = Math.min(1, distToCenter / 70);
        const alpha = Math.max(0, fadeOut * centerFade);
        const shrink = 1 - Math.min(1, (progress - 0.1) / 0.9);
        const radius = particle.size * Math.max(0.2, shrink);

        if (alpha > 0.01) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        remaining.push(particle);
      }

      if (maskRef.current) {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(
          maskRef.current,
          portalCenter.x - portalSize.width / 2,
          portalCenter.y - portalSize.height / 2,
          portalSize.width,
          portalSize.height
        );
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.globalAlpha = 1;
      particlesRef.current = remaining;

      if (completedBursts.length > 0) {
        completedBursts.forEach(onBurstComplete);
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
