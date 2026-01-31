import { useEffect, useRef } from "react";
import UISceneRoot from "../scenes/UISceneRoot";
import AstraOverlayRoot from "../overlays/AstraOverlayRoot";
import { useUIStore } from "../state/useUIStore";
import { useOptionsStore } from "../state/useOptionsStore";

const AppShell = () => {
  const transitionActive = useUIStore((state) => state.transitionActive);
  const pendingScene = useUIStore((state) => state.pendingScene);
  const transitionKey = useUIStore((state) => state.transitionKey);
  const endTransition = useUIStore((state) => state.endTransition);
  const scene = useUIStore((state) => state.scene);
  const masterVolume = useOptionsStore((state) => state.masterVolume);
  const musicVolume = useOptionsStore((state) => state.musicVolume);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicBaseRef = useRef(0);
  const whispersRef = useRef<HTMLAudioElement | null>(null);
  const whispersIntervalRef = useRef<number | null>(null);
  const clickContextRef = useRef<AudioContext | null>(null);
  const clickBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (!transitionActive || pendingScene) return;
    if (typeof window === "undefined" || typeof document === "undefined") {
      endTransition(transitionKey);
      return;
    }

    let canceled = false;

    const waitForImages = (root: HTMLElement) =>
      new Promise<void>((resolve) => {
        const images = Array.from(root.querySelectorAll("img"));
        if (images.length === 0) {
          resolve();
          return;
        }
        let remaining = images.length;
        const done = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
        };
        images.forEach((img) => {
          if (img.complete) {
            done();
            return;
          }
          const onLoad = () => {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onLoad);
            done();
          };
          img.addEventListener("load", onLoad);
          img.addEventListener("error", onLoad);
        });
      });

    const waitForLayout = () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });

    const waitForAnimations = () =>
      new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          window.removeEventListener("ui-animations-ready", done);
          resolve();
        };
        window.addEventListener("ui-animations-ready", done, { once: true });
        window.setTimeout(done, 220);
      });

    const run = async () => {
      const root = document.querySelector(".ui-safe-frame") as HTMLElement | null;
      if (root) {
        await waitForImages(root);
      }
      if (canceled) return;
      await waitForLayout();
      if (canceled) return;
      await waitForAnimations();
      if (canceled) return;
      endTransition(transitionKey);
    };

    run();

    return () => {
      canceled = true;
    };
  }, [transitionActive, pendingScene, transitionKey, endTransition]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const music = new Audio("/assets/sounds/orchestra-fantasy-111168.mp3");
    music.loop = true;
    musicRef.current = music;

    const startAudio = () => {
      if (musicBaseRef.current <= 0) return;
      music.play().catch(() => undefined);
    };

    const startLoopFade = () => {
      const fadeMs = 1800;
      const intervalId = window.setInterval(() => {
        if (!music.duration || Number.isNaN(music.duration)) return;
        const baseVolume = musicBaseRef.current;
        if (baseVolume <= 0) {
          music.volume = 0;
          return;
        }
        const remaining = music.duration - music.currentTime;
        if (remaining <= fadeMs / 1000) {
          const t = Math.max(0, remaining / (fadeMs / 1000));
          music.volume = baseVolume * t;
        } else if (music.volume !== baseVolume) {
          music.volume = baseVolume;
        }
      }, 200);
      return () => window.clearInterval(intervalId);
    };

    const stopLoopFade = startLoopFade();
    startAudio();

    const resumeOnGesture = () => {
      startAudio();
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };

    window.addEventListener("pointerdown", resumeOnGesture);
    window.addEventListener("keydown", resumeOnGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      stopLoopFade();
      music.pause();
      music.currentTime = 0;
      musicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    if (scene === "INVENTORY") {
      music.volume = 0;
      music.pause();
      return;
    }
    const base = 0.45 * (masterVolume / 100) * (musicVolume / 100);
    musicBaseRef.current = base;
    if (base <= 0) {
      music.volume = 0;
      music.pause();
      return;
    }
    music.volume = base;
    music.play().catch(() => undefined);
  }, [masterVolume, musicVolume, scene]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (scene !== "INVENTORY") {
      if (whispersIntervalRef.current) {
        window.clearInterval(whispersIntervalRef.current);
        whispersIntervalRef.current = null;
      }
      if (whispersRef.current) {
        whispersRef.current.pause();
        whispersRef.current.currentTime = 0;
      }
      return;
    }

    if (!whispersRef.current) {
      whispersRef.current = new Audio("/assets/sounds/strange-whispers-415245.mp3");
    }
    const whispers = whispersRef.current;
    whispers.volume = 0.3 * (masterVolume / 100);

    const playWhispers = () => {
      whispers.currentTime = 0;
      whispers.play().catch(() => undefined);
    };

    playWhispers();
    whispersIntervalRef.current = window.setInterval(playWhispers, 30000);

    return () => {
      if (whispersIntervalRef.current) {
        window.clearInterval(whispersIntervalRef.current);
        whispersIntervalRef.current = null;
      }
      whispers.pause();
      whispers.currentTime = 0;
    };
  }, [scene, masterVolume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let disposed = false;
    const getContext = () => {
      if (!clickContextRef.current) {
        clickContextRef.current = new AudioContext();
      }
      return clickContextRef.current;
    };

    const loadBuffer = async () => {
      if (clickBufferRef.current) return clickBufferRef.current;
      const response = await fetch("/assets/sounds/ui/click1.ogg");
      const data = await response.arrayBuffer();
      const ctx = getContext();
      const buffer = await ctx.decodeAudioData(data);
      if (disposed) return null;
      clickBufferRef.current = buffer;
      return buffer;
    };

    const resumeOnGesture = () => {
      const ctx = getContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => undefined);
      }
      loadBuffer().catch(() => undefined);
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };

    window.addEventListener("pointerdown", resumeOnGesture);
    window.addEventListener("keydown", resumeOnGesture);

    const playClick = async () => {
      if (masterVolume <= 0) return;
      const ctx = getContext();
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => undefined);
      }
      const buffer = await loadBuffer();
      if (!buffer || disposed) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const delay = ctx.createDelay(0.3);
      const feedback = ctx.createGain();

      const baseVolume = Math.max(0, Math.min(1, masterVolume / 100)) * 0.55;
      dryGain.gain.value = baseVolume;
      wetGain.gain.value = baseVolume * 0.35;
      delay.delayTime.value = 0.085;
      feedback.gain.value = 0.2;

      source.connect(dryGain);
      source.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);
      dryGain.connect(ctx.destination);
      wetGain.connect(ctx.destination);

      source.start(0);
      source.onended = () => {
        source.disconnect();
        dryGain.disconnect();
        wetGain.disconnect();
        delay.disconnect();
        feedback.disconnect();
      };
    };

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest("button,[role='button'],.ui-button,.main-menu-nav-button");
      if (!button) return;
      if (button instanceof HTMLButtonElement && button.disabled) return;
      void playClick();
    };

    window.addEventListener("click", onClick);
    return () => {
      disposed = true;
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      clickBufferRef.current = null;
      if (clickContextRef.current) {
        clickContextRef.current.close().catch(() => undefined);
        clickContextRef.current = null;
      }
    };
  }, [masterVolume]);

  return (
    <div className="ui-shell">
      {/* TODO: Legacy screen navigation remains in src/ui/shell and src/ui/screens. */}
      <div className="ui-background" aria-hidden="true" />
      <div
        className={`ui-screen-fade${transitionActive ? " ui-screen-fade--visible" : ""}`}
        aria-hidden="true"
      >
        <div className="ui-screen-fade__label">Switching Menus</div>
      </div>
      <div className="ui-layer">
        <div className="ui-safe-frame">
          <UISceneRoot />
        </div>
        <AstraOverlayRoot />
      </div>
    </div>
  );
};

export default AppShell;
