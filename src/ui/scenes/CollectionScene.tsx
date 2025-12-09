type CollectionSceneProps = {
  onBack?: () => void;
};

export default function CollectionScene({ onBack }: CollectionSceneProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0a1221, #0e1c34)",
        color: "#eaf1ff",
        padding: "24px",
        display: "grid",
        gap: 12
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Collection</h2>
        {onBack && (
          <button style={secondaryBtn} onClick={onBack}>
            Back
          </button>
        )}
      </div>
      <div style={{ opacity: 0.75 }}>Collection browsing is coming soon. Cards unlock per hero will show here.</div>
    </div>
  );
}

const secondaryBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#e7f1ff",
  cursor: "pointer",
  fontWeight: 700
};
