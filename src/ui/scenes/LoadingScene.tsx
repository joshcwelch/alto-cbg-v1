import { useEffect } from "react";

type LoadingSceneProps = {
  onContinue: () => void;
};

export default function LoadingScene({ onContinue }: LoadingSceneProps) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 900);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(120% 120% at 50% 30%, #0b1324, #060911 70%)",
        color: "#e7f0ff",
        flexDirection: "column",
        gap: 16,
        transition: "opacity 240ms ease"
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: "linear-gradient(145deg, #5be0ff, #3474ff)",
          boxShadow: "0 14px 34px rgba(0,0,0,0.35), 0 0 24px rgba(80,160,255,0.45)"
        }}
      />
      <div style={{ fontSize: 18, letterSpacing: 0.6, fontWeight: 700 }}>Connecting to Alto…</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>Spinning up hero core systems</div>
    </div>
  );
}
