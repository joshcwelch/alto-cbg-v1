type MainMenuSceneProps = {
  onPlay: () => void;
};

export default function MainMenuScene({ onPlay }: MainMenuSceneProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/assets/ui/menus/menuBackground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        flexDirection: "column",
        color: "#f2f6ff",
        textAlign: "center",
        padding: "32px"
      }}
    >
      <div
        style={{
          padding: "12px 22px",
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(16,28,46,0.8), rgba(6,10,18,0.82))",
          boxShadow: "0 14px 34px rgba(0,0,0,0.45)"
        }}
      >
        <h1 style={{ margin: 0, letterSpacing: 0.8 }}>Alto Chronicles</h1>
        <p style={{ marginTop: 6, opacity: 0.7 }}>Hero Core System — UI Level B</p>
      </div>

      <button
        onClick={onPlay}
        style={{
          padding: "14px 28px",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "linear-gradient(145deg, #6ce8ff, #3da6ff)",
          color: "#061223",
          fontWeight: 900,
          letterSpacing: 0.8,
          boxShadow: "0 12px 24px rgba(0,0,0,0.4), 0 0 18px rgba(90,185,255,0.4)",
          cursor: "pointer",
          minWidth: 180
        }}
      >
        Play
      </button>

      <div style={{ display: "flex", gap: 10, opacity: 0.6 }}>
        <button style={disabledButton}>Arena (Soon)</button>
        <button style={disabledButton}>Campaign (Soon)</button>
        <button style={disabledButton}>Co-op (Soon)</button>
      </div>
    </div>
  );
}

const disabledButton: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
  color: "rgba(255,255,255,0.45)",
  cursor: "not-allowed",
  minWidth: 120
};
