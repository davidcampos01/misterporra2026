export function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: "0 0 auto", padding: "6px 12px", borderRadius: 40, fontSize: 11, fontWeight: 800,
      letterSpacing: .5, textTransform: "uppercase", cursor: "pointer",
      border: `1px solid ${active ? "#7b2fff" : "#1a1a2a"}`,
      background: active ? "#7b2fff" : "transparent",
      color: active ? "#fff" : "#5060a0",
    }}>
      {label}
    </button>
  );
}
