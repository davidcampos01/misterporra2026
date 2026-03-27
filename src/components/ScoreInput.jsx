import { useState, useEffect } from "react";

export function ScoreInput({ value, onChange, color }) {
  const [local, setLocal] = useState(value);

  // Sincronizar cuando Firestore actualiza el valor desde fuera
  useEffect(() => { setLocal(value); }, [value]);

  return (
    <input
      type="number" min="0" max="99" value={local}
      onChange={e => {
        setLocal(e.target.value);
        onChange(e.target.value);
      }}
      style={{
        width: 38, height: 38, background: "#0a0a14",
        border: `1.5px solid ${color || "#2a2a40"}`, borderRadius: 7,
        color: "#f0f0f8", fontFamily: "'Space Mono',monospace",
        fontSize: 17, fontWeight: 700, textAlign: "center", outline: "none",
      }}
    />
  );
}
